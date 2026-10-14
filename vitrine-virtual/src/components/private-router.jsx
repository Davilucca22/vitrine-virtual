import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAutenticacao } from "./auth-context.js"

// Exige uma sessão para exibir as páginas administrativas.
export default function RotaPrivada() {
    const { user } = useAutenticacao()
    const location = useLocation()

    return user ? (
        <Outlet />
    ) : (
        <Navigate to="/login" replace state={{ from: location }} />
    )
}
