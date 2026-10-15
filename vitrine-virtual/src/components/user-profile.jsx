import { useState } from "react"
import { Link, NavLink, Outlet } from "react-router-dom"
import { VscAccount, VscClose, VscCopy, VscMenu } from "react-icons/vsc"

// Gera o endereço público da loja usando o identificador aceito pela API.
function criarLinkDaLoja(idLoja) {
    if (idLoja === undefined || idLoja === null || !String(idLoja).trim()) {
        return ""
    }

    const query = new URLSearchParams({ id_loja: String(idLoja) })
    return `${window.location.origin}/vitrine?${query}`
}

// Mostra os dados públicos da loja e permite copiar seu endereço.
export function VisaoGeralDoPerfil({ profile }) {
    const [message, setMessage] = useState("")
    const storeLink = criarLinkDaLoja(profile.id)

    // Copia o link público e informa o resultado ao lojista.
    async function copiarLinkDaLoja() {
        try {
            await navigator.clipboard.writeText(storeLink)
            setMessage("Link copiado.")
        } catch {
            setMessage("Não foi possível copiar o link neste navegador.")
        }
    }

    return (
        <section className="mx-auto max-w-2xl rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200 sm:p-8">
            {profile.image ? (
                <img
                    src={profile.image}
                    alt={`Foto de ${profile.businessName || "seu comércio"}`}
                    className="mx-auto h-32 w-32 rounded-full object-cover ring-4 ring-blue-50"
                />
            ) : (
                <div
                    aria-label="Nenhuma foto cadastrada"
                    className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-4 ring-blue-50"
                >
                    <VscAccount aria-hidden="true" className="text-5xl" />
                </div>
            )}
            <h2 className="mt-5 text-2xl font-bold text-slate-900">
                {profile.businessName || "Nome do comércio"}
            </h2>

            <div className="mt-8 text-left">
                <label
                    htmlFor="public-store-link"
                    className="mb-2 block text-sm font-medium text-slate-700"
                >
                    Link público da loja
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                        id="public-store-link"
                        type="url"
                        value={storeLink}
                        readOnly
                        placeholder="ID da loja indisponível para gerar o link"
                        className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600 outline-none"
                    />
                    <button
                        type="button"
                        onClick={copiarLinkDaLoja}
                        disabled={!storeLink}
                        className="flex items-center justify-center gap-2 rounded-lg border border-blue-200 px-4 py-3 text-sm font-medium text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <VscCopy aria-hidden="true" />
                        Copiar link
                    </button>
                </div>
                {message && (
                    <p role="status" className="mt-2 text-sm text-blue-700">
                        {message}
                    </p>
                )}
            </div>
        </section>
    )
}

// Exibe os dados do comércio retornados pelo servidor.
export function ConfiguracoesDaConta({ profile, email = "" }) {
    return (
        <section className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
            <h2 className="text-center text-xl font-semibold text-slate-900">
                Dados da conta
            </h2>
            <div className="mt-6 space-y-5">
                <div>
                    <label
                        htmlFor="account-email"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Email de acesso
                    </label>
                    <input
                        id="account-email"
                        type="email"
                        value={email}
                        readOnly
                        className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-600 outline-none"
                    />
                </div>
                <div className="flex flex-col items-center gap-4">
                    {profile.image ? (
                        <img
                            src={profile.image}
                            alt={`Foto de ${profile.businessName || "seu comércio"}`}
                            className="h-28 w-28 rounded-full object-cover ring-4 ring-blue-50"
                        />
                    ) : (
                        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-4 ring-blue-50">
                            <VscAccount aria-hidden="true" className="text-5xl" />
                        </div>
                    )}
                </div>
                <div>
                    <label
                        htmlFor="business-name"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Nome do comércio
                    </label>
                    <input
                        id="business-name"
                        type="text"
                        value={profile.businessName}
                        readOnly
                        className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-600 outline-none"
                    />
                </div>
                <div>
                    <label
                        htmlFor="business-whatsapp"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        WhatsApp da loja
                    </label>
                    <input
                        id="business-whatsapp"
                        type="tel"
                        value={profile.whatsappNumber}
                        readOnly
                        className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-600 outline-none"
                    />
                </div>
            </div>
        </section>
    )
}

// Permite atualizar o identificador de login e validar a nova senha.
export function ConfiguracoesDeAcesso({ login, aoSalvarLogin }) {
    const [loginName, setLoginName] = useState(login)
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [message, setMessage] = useState("")

    // Valida os campos antes de atualizar o login da sessão atual.
    function tratarEnvioDoFormulario(event) {
        event.preventDefault()
        setMessage("")

        if (!loginName.trim() && !newPassword) {
            setMessage("Informe um novo login ou uma nova senha.")
            return
        }

        if (newPassword && newPassword.length < 8) {
            setMessage("A nova senha deve ter pelo menos 8 caracteres.")
            return
        }

        if (newPassword !== confirmPassword) {
            setMessage("A confirmação da senha não corresponde.")
            return
        }

        if (loginName.trim()) aoSalvarLogin(loginName.trim())
        setNewPassword("")
        setConfirmPassword("")
        setMessage(
            "Login atualizado nesta sessão. A alteração de senha exige integração com autenticação no backend.",
        )
    }

    return (
        <section className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
            <h2 className="text-center text-xl font-semibold text-slate-900">
                Alterar dados de login
            </h2>
            <p className="mt-2 text-center text-sm text-slate-500">
                A atualização real das credenciais depende da integração com autenticação.
            </p>
            <form onSubmit={tratarEnvioDoFormulario} className="mt-6 space-y-5">
                <div>
                    <label
                        htmlFor="account-login"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Login
                    </label>
                    <input
                        id="account-login"
                        type="text"
                        autoComplete="username"
                        value={loginName}
                        onChange={(event) => setLoginName(event.target.value)}
                        placeholder="Seu novo login"
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>
                <div>
                    <label
                        htmlFor="account-password"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Nova senha
                    </label>
                    <input
                        id="account-password"
                        type="password"
                        autoComplete="new-password"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        placeholder="Mínimo de 8 caracteres"
                        minLength={8}
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>
                <div>
                    <label
                        htmlFor="account-password-confirm"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Confirme a nova senha
                    </label>
                    <input
                        id="account-password-confirm"
                        type="password"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        placeholder="Digite novamente a nova senha"
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>
                {message && (
                    <p role="status" className="text-sm text-blue-700">
                        {message}
                    </p>
                )}
                <button
                    type="submit"
                    className="w-full rounded-lg border border-blue-200 px-5 py-3 font-semibold text-blue-700 transition hover:bg-blue-50"
                >
                    Salvar dados de login
                </button>
            </form>
        </section>
    )
}

// Organiza o menu e as páginas de configuração do perfil.
export default function PerfilDaLoja() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    // Aplica o destaque visual ao link da seção atual do perfil.
    const classeDoLinkDeNavegacao = ({ isActive }) =>
        `block rounded-lg px-4 py-3 font-medium transition ${
            isActive ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-100"
        }`

    return (
        <div>
            <header className="bg-blue-700 px-6 py-8 text-center text-white shadow-md">
                <div className="mx-auto max-w-6xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">
                        Vitrine virtual
                    </p>
                    <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
                        Perfil do comércio
                    </h1>
                    <p className="mt-2 text-blue-100">
                        Consulte os dados e gerencie as configurações da sua loja.
                    </p>
                </div>
            </header>

            <div className="mx-auto max-w-6xl px-6 pt-6">
                <button
                    type="button"
                    onClick={() => setIsMenuOpen(true)}
                    aria-label="Abrir menu do perfil"
                    aria-expanded={isMenuOpen}
                    aria-controls="profile-menu"
                    className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <VscMenu aria-hidden="true" className="text-xl" />
                    Menu do perfil
                </button>
            </div>

            {isMenuOpen && (
                <div className="profile-menu-backdrop fixed inset-0 z-30">
                    <button
                        type="button"
                        aria-label="Fechar menu do perfil"
                        onClick={() => setIsMenuOpen(false)}
                        className="absolute inset-0 h-full w-full bg-slate-950/50"
                    />
                    <aside
                        id="profile-menu"
                        aria-label="Menu do perfil"
                        className="profile-menu-panel relative h-full w-72 max-w-[85vw] bg-white p-6 shadow-2xl"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-900">
                                Menu do perfil
                            </h2>
                            <button
                                type="button"
                                onClick={() => setIsMenuOpen(false)}
                                aria-label="Fechar menu do perfil"
                                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                            >
                                <VscClose aria-hidden="true" className="text-xl" />
                            </button>
                        </div>
                        <nav className="mt-6 space-y-2">
                            <NavLink
                                to="/home/profile"
                                end
                                onClick={() => setIsMenuOpen(false)}
                                className={classeDoLinkDeNavegacao}
                            >
                                Dados do comércio
                            </NavLink>
                            <NavLink
                                to="/home/profile/account"
                                onClick={() => setIsMenuOpen(false)}
                                className={classeDoLinkDeNavegacao}
                            >
                                Alterar dados da conta
                            </NavLink>
                            <NavLink
                                to="/home/profile/login"
                                onClick={() => setIsMenuOpen(false)}
                                className={classeDoLinkDeNavegacao}
                            >
                                Alterar dados de login
                            </NavLink>
                            <Link
                                to="/home"
                                onClick={() => setIsMenuOpen(false)}
                                className="mt-6 block rounded-lg px-4 py-3 font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                            >
                                Voltar aos produtos
                            </Link>
                        </nav>
                    </aside>
                </div>
            )}

            <main className="mx-auto max-w-6xl px-6 py-8">
                <Outlet />
            </main>
        </div>
    )
}
