import { useState } from "react"
import { AuthContext } from "./auth-context.js"

const AUTH_SESSION_KEY = "vitrine-virtual:demo-session"

// Recupera o usuário da sessão atual, incluindo os dados retornados pela API.
function obterUsuarioInicial() {
    try {
        const savedUser = window.sessionStorage.getItem(AUTH_SESSION_KEY)
        if (!savedUser) return null

        try {
            const user = JSON.parse(savedUser)
            if (user && typeof user.email === "string") return user
        } catch {
            // Mantém compatibilidade com sessões antigas que salvavam apenas o email.
            if (savedUser.includes("@")) return { email: savedUser }
        }

        return null
    } catch {
        return null
    }
}

// Disponibiliza o estado de autenticação para as rotas e páginas.
export default function ProvedorDeAutenticacao({ children }) {
    const [user, setUser] = useState(obterUsuarioInicial)

    // Registra na sessão o usuário retornado pela API de autenticação.
    function entrar(user) {
        if (!user || typeof user.email !== "string" || !user.email.trim()) {
            throw new Error("Informe um email válido para continuar.")
        }

        const normalizedUser = {
            ...user,
            email: user.email.trim().toLowerCase(),
        }

        try {
            window.sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(normalizedUser))
        } catch {
            throw new Error("Não foi possível iniciar a sessão neste navegador.")
        }

        setUser(normalizedUser)
    }

    // Atualiza os dados do usuário autenticado durante a sessão atual.
    function atualizarUsuario(updates) {
        if (!user) {
            throw new Error("Não há um usuário autenticado para atualizar.")
        }

        const updatedUser = { ...user, ...updates }
        try {
            window.sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(updatedUser))
        } catch {
            throw new Error("Não foi possível salvar os dados da sessão neste navegador.")
        }

        setUser(updatedUser)
    }

    // Encerra a sessão de demonstração e limpa o usuário atual.
    function sair() {
        try {
            window.sessionStorage.removeItem(AUTH_SESSION_KEY)
        } catch {
            throw new Error("Não foi possível encerrar a sessão neste navegador.")
        }

        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, entrar, atualizarUsuario, sair }}>
            {children}
        </AuthContext.Provider>
    )
}
