import { Navigate, Outlet } from "react-router-dom"
import { useAutenticacao } from "./auth-context.js"

// Impede que usuários autenticados voltem às páginas públicas de acesso.
export default function RotaDeVisitante() {
    const { user } = useAutenticacao()

    return user ? <Navigate to="/home" replace /> : <Outlet />
}
