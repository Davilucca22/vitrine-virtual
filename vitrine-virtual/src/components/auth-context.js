import { createContext, useContext } from "react"

export const AuthContext = createContext(null)

// Recupera a autenticação atual e alerta quando o provedor não está montado.
export function useAutenticacao() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAutenticacao deve ser usado dentro de ProvedorDeAutenticacao.")
    }

    return context
}
