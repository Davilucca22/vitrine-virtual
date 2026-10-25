export const CORES_PADRAO = {
    cor_primaria: "#4338ca",
    cor_segundaria: "#eef2ff",
    cor_texto_primaria: "#1e293b",
    cor_texto_segundaria: "#64748b",
}

const CAMPOS_DE_COR = [
    "cor_primaria",
    "cor_segundaria",
    "cor_texto_primaria",
    "cor_texto_segundaria",
]

export function normalizarCores(value, defaultValue = CORES_PADRAO) {
    const source = value?.cores ?? value
    const colors = {}

    for (const field of CAMPOS_DE_COR) {
        const color = source?.[field] ?? source?.[field.toUpperCase()]
        if (color === undefined || color === null || color === "") {
            colors[field] = defaultValue[field]
            continue
        }

        if (typeof color !== "string") {
            throw new Error(`A cor "${field}" retornada pelo servidor é inválida.`)
        }

        const value = color.trim().replace(/^#/, "")
        if (/^[\da-f]{3}$/i.test(value)) {
            colors[field] = `#${[...value].map((digit) => digit + digit).join("")}`
        } else if (/^[\da-f]{6}$/i.test(value)) {
            colors[field] = `#${value}`
        } else {
            throw new Error(`A cor "${field}" retornada pelo servidor é inválida.`)
        }
    }

    return colors
}

export function estiloDasCores(value) {
    const colors = normalizarCores(value)

    return {
        "--cor-primaria": colors.cor_primaria,
        "--cor-segundaria": colors.cor_segundaria,
        "--cor-texto-primaria": colors.cor_texto_primaria,
        "--cor-texto-segundaria": colors.cor_texto_segundaria,
    }
}
