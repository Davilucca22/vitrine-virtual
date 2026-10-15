const endpoint = import.meta.env.VITE_URL_SITE

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

function normalizarUsuario(user) {
    const id = user?.id ?? user?.ID
    const email = user?.email ?? user?.EMAIL

    if (id === undefined || typeof email !== "string") {
        throw new Error("O servidor retornou dados de conta inválidos.")
    }

    return {
        id: String(id),
        email,
        nome_loja: user.nome_loja ?? user.NOME_LOJA ?? "",
        foto_loja: user.foto_loja ?? user.FOTO_LOJA ?? "",
        contato: user.contato ?? user.CONTATO ?? "",
        status: user.status ?? user.STATUS,
    }
}

function obterUsuarioDaResposta(data) {
    const user = Array.isArray(data?.response)
        ? data.response[0]
        : data?.response
    if (!user || typeof user !== "object") {
        throw new Error("O servidor não retornou os dados atualizados.")
    }

    return normalizarUsuario(user)
}

export async function atualizarDadosDaConta({ nomeLoja, contato, foto }) {
    const formData = new FormData()
    formData.append("nome_loja", nomeLoja)
    formData.append("contato", contato)
    if (foto) formData.append("foto", foto)

    const data = await requisitarUsuario("/user/data", {
        method: "PUT",
        body: formData,
    })

    return obterUsuarioDaResposta(data)
}

export async function atualizarDadosDeLogin({ email, senha }) {
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

    return normalizarUsuario(data?.response)
}

export async function encerrarSessao() {
    await requisitarUsuario("/logout", { method: "POST" })
}
