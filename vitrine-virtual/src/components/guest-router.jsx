import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "./auth-context.js"

export default function GuestRouter() {
    const { user } = useAuth()

    return user ? <Navigate to="/home" replace /> : <Outlet />
}
