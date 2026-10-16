import { VscAccount, VscAdd } from "react-icons/vsc"

// Exibe a navegação fixa para cadastrar produtos e abrir o perfil.
export default function BarraDeNavegacao({
    aoAdicionar,
    aoClicarNoPerfil,
    perfilAtivo,
}) {
    return (
        <nav
            aria-label="Navegação principal"
            className="fixed inset-x-0 bottom-0 z-20 flex h-20 items-center justify-center border-t border-indigo-100 bg-indigo-50 px-4 shadow-lg"
        >
            <div className="flex items-center justify-center gap-5">
                <button
                    type="button"
                    onClick={aoAdicionar}
                    aria-label="Adicionar produto"
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-700 text-white shadow-sm transition hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    <VscAdd aria-hidden="true" className="h-5 w-5 shrink-0" />
                </button>
                <button
                    type="button"
                    onClick={aoClicarNoPerfil}
                    aria-label={perfilAtivo ? "Voltar para produtos" : "Minha conta"}
                    aria-pressed={perfilAtivo}
                    className={`flex h-12 w-12 items-center justify-center rounded-xl text-slate-700 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                        perfilAtivo ? "bg-white text-indigo-700 shadow-sm" : ""
                    }`}
                >
                    <VscAccount aria-hidden="true" className="h-5 w-5 shrink-0" />
                    <span className="sr-only">
                        {perfilAtivo ? "Voltar para produtos" : "Minha conta"}
                    </span>
                </button>
            </div>
        </nav>
    )
}
