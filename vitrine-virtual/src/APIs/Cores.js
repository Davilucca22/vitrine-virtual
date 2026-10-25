import { normalizarCores } from "../constants/colors.js"

const endpoint = import.meta.env.VITE_URL_SITE
const caminho = "/user/data/colors"

async function requisitarCores(method = "GET", colors) {
    const headers = {
        Accept: "application/json",
    }
    const options = { method, headers, credentials: "include" }

    if (colors) {
        headers["Content-Type"] = "application/json"
        options.body = JSON.stringify({ form: colors })
    }

    const response = await fetch(`${endpoint}${caminho}`, options)
    const data = await response.json()

    if (!response.ok) {
        if (
            method === "GET" &&
            response.status === 404 &&
            typeof data?.response === "string" &&
            data.response.toLowerCase().includes("esquema de cores nao encontrado")
        ) {
            return null
        }

        throw new Error(data?.response || "Não foi possível acessar as cores da conta.")
    }

    return data
}

function obterCoresDaResposta(data) {
    const result = Array.isArray(data?.response)
        ? data.response[0]
        : data?.response

    if (result === undefined || result === null) return null
    if (typeof result !== "object") {
        throw new Error("O servidor retornou as cores em formato inválido.")
    }

    const colors = result.cores ?? result
    if (typeof colors !== "object" || colors === null) {
        throw new Error("O servidor retornou as cores em formato inválido.")
    }

    const hasColors = [
        "cor_primaria",
        "cor_segundaria",
        "cor_texto_primaria",
        "cor_texto_segundaria",
    ].some(
        (field) =>
            colors[field] !== undefined ||
            colors[field.toUpperCase()] !== undefined,
    )

    return hasColors ? normalizarCores(colors) : null
}

export async function buscarCores() {
    const data = await requisitarCores()
    if (data === null) {
        return { colors: null, configured: false }
    }

    const colors = obterCoresDaResposta(data)

    return { colors, configured: colors !== null }
}

export async function salvarCores(colors, configured) {
    const normalizedColors = normalizarCores(colors)
    const data = await requisitarCores(
        configured ? "PUT" : "POST",
        normalizedColors,
    )
    const savedColors = obterCoresDaResposta(data)

    return savedColors || normalizedColors
}
