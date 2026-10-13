import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom"

import AuthProvider from "../components/auth-provider.jsx"
import GuestRouter from "../components/guest-router.jsx"
import PrivateRouter from "../components/private-router.jsx"
import Home from "../pages/home"
import Vitrine from "../pages/vitrine.jsx"
import { Login, Register } from "../pages/auth.jsx"

export default function App_router() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/vitrine" element={<Vitrine />} />

                    <Route element={<GuestRouter />}>
                        <Route path="/login" element={<Login />} />
                        <Route path="/registro" element={<Register />} />
                        <Route
                            path="/register"
                            element={<Navigate to="/registro" replace />}
                        />
                    </Route>

                    <Route element={<PrivateRouter />}>
                        <Route path="/home/*" element={<Home />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/home" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    )
}
