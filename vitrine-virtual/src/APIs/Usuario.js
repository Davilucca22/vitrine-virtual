import { normalizarCores } from "../constants/colors.js"

const endpoint = import.meta.env.VITE_URL_SITE
const CAMPOS_TOKEN = ["token", "TOKEN", "access_token", "accessToken", "ACCESS_TOKEN"]

function obterTokenDoObjeto(value) {
    if (!value || typeof value !== "object") return undefined

    for (const field of CAMPOS_TOKEN) {
        const token = value[field]
        if (typeof token === "string" && token.trim()) return token.trim()
    }

    return undefined
}

export function obterTokenDaResposta(data) {
    const response = Array.isArray(data?.response)
        ? data.response[0]
        : data?.response

    return obterTokenDoObjeto(response) ?? obterTokenDoObjeto(data)
}

async function requisitarUsuario(path, options) {
    const response = await fetch(`${endpoint}${path}`, {
        credentials: "include",
        ...options,
    })
    const data = await response.json()

    if (!response.ok) {
        throw new Error(data?.response || "Não foi possível atualizar os dados.")
    }

    return data
}

function normalizarVerPrecos(value, defaultValue = true) {
    if (value === undefined || value === null) return defaultValue
    if (typeof value === "boolean") return value
    if (value === 1 || value === "1" || value === "true") return true
    if (value === 0 || value === "0" || value === "false") return false

    throw new Error("O servidor retornou uma configuração de preços inválida.")
}

export function normalizarUsuario(user, verPrecosDefault = true) {
    const id = user?.id ?? user?.ID
    const email = user?.email ?? user?.EMAIL
    const token = obterTokenDoObjeto(user)
    const colorData = user?.cores ?? user
    const hasColors =
        colorData &&
        [
            "cor_primaria",
            "cor_segundaria",
            "cor_texto_primaria",
            "cor_texto_segundaria",
        ].some(
            (field) =>
                colorData[field] !== undefined ||
                colorData[field.toUpperCase()] !== undefined,
        )

    if (id === undefined || typeof email !== "string") {
        throw new Error("O servidor retornou dados de conta inválidos.")
    }

    return {
        id: String(id),
        email,
        ...(token ? { token } : {}),
        nome_loja: user.nome_loja ?? user.NOME_LOJA ?? "",
        foto_loja: user.foto_loja ?? user.FOTO_LOJA ?? "",
        contato: user.contato ?? user.CONTATO ?? "",
        status: user.status ?? user.STATUS,
        ...(hasColors ? { cores: normalizarCores(colorData) } : {}),
        ver_precos: normalizarVerPrecos(
            user.ver_precos ?? user.VER_PRECOS,
            verPrecosDefault,
        ),
    }
}

function obterUsuarioDaResposta(data, verPrecosDefault) {
    const user = Array.isArray(data?.response)
        ? data.response[0]
        : data?.response
    if (!user || typeof user !== "object") {
        throw new Error("O servidor não retornou os dados atualizados.")
    }

    return normalizarUsuario(user, verPrecosDefault)
}

export async function atualizarDadosDaConta({
    nomeLoja,
    contato,
    foto,
    verPrecos,
}) {
    const formData = new FormData()
    formData.append("nome_loja", nomeLoja)
    formData.append("contato", contato)
    formData.append("ver_precos", String(verPrecos))
    if (foto) formData.append("foto", foto)

    const data = await requisitarUsuario("/user/data", {
        method: "PUT",
        body: formData,
    })

    return obterUsuarioDaResposta(data, verPrecos)
}

export async function atualizarDadosDeLogin({ email, senha, verPrecos = true }) {
    const data = await requisitarUsuario("/user/login", {
        method: "PUT",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            form: { email: email.trim().toLowerCase(), senha },
        }),
    })

    return normalizarUsuario(data?.response, verPrecos)
}

export async function encerrarSessao() {
    await requisitarUsuario("/logout", { method: "POST" })
}
