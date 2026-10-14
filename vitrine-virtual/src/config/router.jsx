import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom"

import ProvedorDeAutenticacao from "../components/auth-provider.jsx"
import RotaDeVisitante from "../components/guest-router.jsx"
import RotaPrivada from "../components/private-router.jsx"
import Inicio from "../pages/home"
import Vitrine from "../pages/vitrine.jsx"
import { TelaDeLogin, TelaDeCadastro } from "../pages/auth.jsx"

// Centraliza as rotas públicas, privadas e da vitrine.
export default function ConfigurarRotas() {
    return (
        <BrowserRouter>
            <ProvedorDeAutenticacao>
                <Routes>
                    <Route path="/vitrine" element={<Vitrine />} />

                    <Route element={<RotaDeVisitante />}>
                        <Route path="/login" element={<TelaDeLogin />} />
                        <Route path="/registro" element={<TelaDeCadastro />} />
                        <Route
                            path="/register"
                            element={<Navigate to="/registro" replace />}
                        />
                    </Route>

                    <Route element={<RotaPrivada />}>
                        <Route path="/home/*" element={<Inicio />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/home" replace />} />
                </Routes>
            </ProvedorDeAutenticacao>
        </BrowserRouter>
    )
}
