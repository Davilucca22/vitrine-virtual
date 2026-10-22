import { useEffect, useRef, useState } from "react"
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
                    className="mx-auto h-32 w-32 rounded-full object-cover ring-4 ring-indigo-100"
                />
            ) : (
                <div
                    aria-label="Nenhuma foto cadastrada"
                    className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-indigo-50 text-indigo-700 ring-4 ring-indigo-100"
                >
                    <VscAccount aria-hidden="true" className="text-5xl" />
                </div>
            )}
            <h2 className="mt-5 text-2xl font-bold text-slate-800">
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
                        className="flex items-center justify-center gap-2 rounded-lg border border-indigo-200 px-4 py-3 text-sm font-medium text-indigo-700 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <VscCopy aria-hidden="true" />
                        Copiar link
                    </button>
                </div>
                {message && (
                    <p
                        role="status"
                        className={`mt-2 text-sm ${
                            message.startsWith("Não foi possível")
                                ? "text-red-700"
                                : "text-green-700"
                        }`}
                    >
                        {message}
                    </p>
                )}
            </div>
        </section>
    )
}

// Permite alterar os dados públicos do comércio na conta autenticada.
export function ConfiguracoesDaConta({ profile, email = "", aoSalvarDados }) {
    const [nomeLoja, setNomeLoja] = useState(profile.businessName)
    const [contato, setContato] = useState(profile.whatsappNumber)
    const [verPrecos, setVerPrecos] = useState(profile.verPrecos ?? true)
    const [foto, setFoto] = useState(null)
    const [fotoPreview, setFotoPreview] = useState(profile.image)
    const fotoPreviewUrl = useRef("")
    const [error, setError] = useState("")
    const [message, setMessage] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        return () => {
            if (fotoPreviewUrl.current) {
                URL.revokeObjectURL(fotoPreviewUrl.current)
            }
        }
    }, [])

    function tratarSelecaoDeFoto(event) {
        const file = event.target.files?.[0]
        setError("")
        setMessage("")
        if (!file) return
        if (!file.type.startsWith("image/")) {
            setError("Selecione um arquivo de imagem válido.")
            event.target.value = ""
            return
        }

        if (fotoPreviewUrl.current) {
            URL.revokeObjectURL(fotoPreviewUrl.current)
        }
        fotoPreviewUrl.current = URL.createObjectURL(file)
        setFoto(file)
        setFotoPreview(fotoPreviewUrl.current)
        setFoto(file)
    }

    async function tratarEnvio(event) {
        event.preventDefault()
        setError("")
        setMessage("")
        setIsSubmitting(true)
        try {
            const updatedUser = await aoSalvarDados({
                nomeLoja: nomeLoja.trim(),
                contato: contato.trim(),
                foto,
                verPrecos,
            })
            if (fotoPreviewUrl.current) {
                URL.revokeObjectURL(fotoPreviewUrl.current)
                fotoPreviewUrl.current = ""
            }
            setFoto(null)
            setFotoPreview(updatedUser.foto_loja)
            setMessage("Dados da conta atualizados.")
        } catch (submitError) {
            setError(submitError.message || "Não foi possível atualizar os dados.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <section className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
            <h2 className="text-center text-xl font-semibold text-slate-800">
                Dados da conta
            </h2>
            <form onSubmit={tratarEnvio} className="mt-6 space-y-5">
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
                    {fotoPreview ? (
                        <img
                            src={fotoPreview}
                            alt={`Foto de ${profile.businessName || "seu comércio"}`}
                            className="h-28 w-28 rounded-full object-cover ring-4 ring-indigo-100"
                        />
                    ) : (
                        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-indigo-50 text-indigo-700 ring-4 ring-indigo-100">
                            <VscAccount aria-hidden="true" className="text-5xl" />
                        </div>
                    )}
                </div>
                <div>
                    <label
                        htmlFor="business-photo"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Foto do comércio
                    </label>
                    <input
                        id="business-photo"
                        type="file"
                        accept="image/*"
                        onChange={tratarSelecaoDeFoto}
                        className="block w-full rounded-lg border border-slate-300 text-sm text-slate-600 file:mr-4 file:border-0 file:bg-indigo-50 file:px-4 file:py-3 file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
                    />
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
                        value={nomeLoja}
                        onChange={(event) => setNomeLoja(event.target.value)}
                        required
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-800 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
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
                        value={contato}
                        onChange={(event) => setContato(event.target.value)}
                        required
                        minLength={13}
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-800 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                    />
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <label
                        htmlFor="account-show-prices"
                        className="flex cursor-pointer items-start gap-3 text-sm font-medium text-slate-700"
                    >
                        <input
                            id="account-show-prices"
                            type="checkbox"
                            checked={verPrecos}
                            onChange={(event) => setVerPrecos(event.target.checked)}
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-700 focus:ring-indigo-600"
                        />
                        <span>
                            Exibir preços dos produtos no catálogo
                            <span className="mt-1 block font-normal text-slate-500">
                                Quando desativado, os preços não serão mostrados nos
                                produtos nem no carrinho.
                            </span>
                        </span>
                    </label>
                </div>
                {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
                {message && <p role="status" className="text-sm text-green-700">{message}</p>}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-lg bg-indigo-700 px-5 py-3 font-semibold text-white transition hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isSubmitting ? "Salvando..." : "Salvar dados da conta"}
                </button>
            </form>
        </section>
    )
}

// Permite atualizar o email de acesso e a senha da conta.
export function ConfiguracoesDeAcesso({ email, aoSalvarLogin }) {
    const [loginEmail, setLoginEmail] = useState(email)
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [message, setMessage] = useState("")
    const [error, setError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Valida os campos antes de atualizar as credenciais no servidor.
    async function tratarEnvioDoFormulario(event) {
        event.preventDefault()
        setMessage("")
        setError("")

        if (!loginEmail.trim() || !newPassword) {
            setError("Informe o novo email e a nova senha.")
            return
        }

        if (newPassword && newPassword.length < 8) {
            setError("A nova senha deve ter pelo menos 8 caracteres.")
            return
        }

        if (newPassword !== confirmPassword) {
            setError("A confirmação da senha não corresponde.")
            return
        }

        setIsSubmitting(true)
        try {
            await aoSalvarLogin({ email: loginEmail.trim(), senha: newPassword })
            setNewPassword("")
            setConfirmPassword("")
            setMessage("Dados de login atualizados.")
        } catch (submitError) {
            setError(submitError.message || "Não foi possível atualizar os dados de login.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <section className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
            <h2 className="text-center text-xl font-semibold text-slate-800">
                Alterar dados de login
            </h2>
            <p className="mt-2 text-center text-sm text-slate-500">
                Atualize o email e a senha usados para acessar sua conta.
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
                        type="email"
                        required
                        autoComplete="username"
                        value={loginEmail}
                        onChange={(event) => setLoginEmail(event.target.value)}
                        placeholder="voce@exemplo.com"
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-800 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
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
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-800 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
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
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-800 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                    />
                </div>
                {error && (
                    <p role="alert" className="text-sm text-red-700">
                        {error}
                    </p>
                )}
                {message && (
                    <p role="status" className="text-sm text-green-700">
                        {message}
                    </p>
                )}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-indigo-200 px-5 py-3 font-semibold text-indigo-700 transition hover:bg-indigo-50"
                >
                    {isSubmitting ? "Salvando..." : "Salvar dados de login"}
                </button>
            </form>
        </section>
    )
}

// Organiza o menu e as páginas de configuração do perfil.
export default function PerfilDaLoja({ aoSair }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    // Aplica o destaque visual ao link da seção atual do perfil.
    const classeDoLinkDeNavegacao = ({ isActive }) =>
        `block rounded-lg px-4 py-3 font-medium transition ${
            isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-700 hover:bg-indigo-50"
        }`

    return (
        <div>
            <header className="bg-indigo-700 px-6 py-8 text-center text-white shadow-sm">
                <div className="mx-auto max-w-6xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-100">
                        Vitrine virtual
                    </p>
                    <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
                        Perfil do comércio
                    </h1>
                    <p className="mt-2 text-indigo-100">
                        Consulte os dados e gerencie as configurações da sua loja.
                    </p>
                </div>
            </header>

            <div className="mx-auto max-w-6xl px-6 pt-6">
                <div className="mx-auto max-w-2xl">
                    <button
                        type="button"
                        onClick={() => setIsMenuOpen(true)}
                        aria-label="Abrir menu do perfil"
                        aria-expanded={isMenuOpen}
                        aria-controls="profile-menu"
                        className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700 shadow-sm transition hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <VscMenu aria-hidden="true" className="text-xl" />
                        Menu do perfil
                    </button>
                </div>
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
                            <h2 className="text-lg font-semibold text-slate-800">
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
                            <button
                                type="button"
                                onClick={() => {
                                    setIsMenuOpen(false)
                                    aoSair()
                                }}
                                className="mt-2 block w-full rounded-lg px-4 py-3 text-left font-medium text-red-700 transition hover:bg-red-50"
                            >
                                Sair da conta
                            </button>
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
