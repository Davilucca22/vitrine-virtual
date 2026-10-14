import { useState } from "react"
import { AuthContext } from "./auth-context.js"

const AUTH_SESSION_KEY = "vitrine-virtual:demo-session"

// Restaura o usuário da sessão atual, se houver um email salvo.
function obterUsuarioInicial() {
    try {
        const email = window.sessionStorage.getItem(AUTH_SESSION_KEY)
        return email ? { email } : null
    } catch {
        return null
    }
}

// Disponibiliza o estado de autenticação para as rotas e páginas.
export default function ProvedorDeAutenticacao({ children }) {
    const [user, setUser] = useState(obterUsuarioInicial)

    // Valida e registra o email na sessão de demonstração.
    function entrar(email) {
        const normalizedEmail = email.trim().toLowerCase()
        if (!normalizedEmail) {
            throw new Error("Informe um email válido para continuar.")
        }

        try {
            window.sessionStorage.setItem(AUTH_SESSION_KEY, normalizedEmail)
        } catch {
            throw new Error("Não foi possível iniciar a sessão neste navegador.")
        }

        setUser({ email: normalizedEmail })
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
        <AuthContext.Provider value={{ user, entrar, sair }}>
            {children}
        </AuthContext.Provider>
    )
}
