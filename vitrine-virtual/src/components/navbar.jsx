import { VscAccount, VscAddCompact } from "react-icons/vsc"

// Exibe a navegação fixa para cadastrar produtos e abrir o perfil.
export default function BarraDeNavegacao({
    aoAdicionar,
    aoClicarNoPerfil,
    perfilAtivo,
}) {
    return (
        <nav
            aria-label="Navegação principal"
            className="fixed bottom-0 flex h-16 w-full items-center justify-center gap-5 bg-blue-700 shadow-lg"
        >
            <button
                type="button"
                onClick={aoAdicionar}
                aria-label="Adicionar produto"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-700"
            >
                <VscAddCompact aria-hidden="true" className="text-2xl text-blue-700" />
            </button>
            <button
                type="button"
                onClick={aoClicarNoPerfil}
                aria-label={perfilAtivo ? "Voltar para produtos" : "Minha conta"}
                aria-pressed={perfilAtivo}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-700"
            >
                <VscAccount aria-hidden="true" className="text-xl text-blue-700" />
            </button>
        </nav>
    )
}
