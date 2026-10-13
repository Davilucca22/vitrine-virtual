import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "./auth-context.js"

export default function PrivateRouter() {
    const { user } = useAuth()
    const location = useLocation()

    return user ? (
        <Outlet />
    ) : (
        <Navigate to="/login" replace state={{ from: location }} />
    )
}
