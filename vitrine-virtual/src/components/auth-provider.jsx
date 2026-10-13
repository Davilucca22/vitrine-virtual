import { useState } from "react"
import { AuthContext } from "./auth-context.js"

const AUTH_SESSION_KEY = "vitrine-virtual:demo-session"

function getInitialUser() {
    try {
        const email = window.sessionStorage.getItem(AUTH_SESSION_KEY)
        return email ? { email } : null
    } catch {
        return null
    }
}

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(getInitialUser)

    function signIn(email) {
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

    function signOut() {
        try {
            window.sessionStorage.removeItem(AUTH_SESSION_KEY)
        } catch {
            throw new Error("Não foi possível encerrar a sessão neste navegador.")
        }

        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}
