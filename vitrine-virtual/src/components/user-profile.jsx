import { useState } from "react"
import { Link, NavLink, Outlet } from "react-router-dom"
import { VscAccount, VscClose, VscCopy, VscMenu } from "react-icons/vsc"

function createStoreLink(businessName) {
    const storeSlug = businessName.trim().toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")

    return storeSlug
        ? `${window.location.origin}/vitrine?loja=${encodeURIComponent(storeSlug)}`
        : ""
}

export function ProfileOverview({ profile }) {
    const [message, setMessage] = useState("")
    const storeLink = createStoreLink(profile.businessName)

    async function copyStoreLink() {
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
                        placeholder="Cadastre o nome do comércio para gerar o link"
                        className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600 outline-none"
                    />
                    <button
                        type="button"
                        onClick={copyStoreLink}
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

export function AccountSettings({ profile, onSaveProfile }) {
    const [businessName, setBusinessName] = useState(profile.businessName)
    const [businessImage, setBusinessImage] = useState(profile.image)
    const [whatsappNumber, setWhatsappNumber] = useState(
        profile.whatsappNumber || "",
    )
    const [message, setMessage] = useState("")

    function handleImageChange(event) {
        const file = event.target.files?.[0]
        setMessage("")

        if (!file) return

        if (!file.type.startsWith("image/")) {
            setMessage("Selecione um arquivo de imagem válido.")
            event.target.value = ""
            return
        }

        const reader = new FileReader()
        reader.onload = () => {
            if (typeof reader.result === "string") {
                setBusinessImage(reader.result)
            }
        }
        reader.onerror = () => {
            setMessage("Não foi possível carregar a foto. Tente novamente.")
        }
        reader.readAsDataURL(file)
    }

    function handleSubmit(event) {
        event.preventDefault()
        onSaveProfile({
            businessName: businessName.trim(),
            image: businessImage,
            whatsappNumber: whatsappNumber.replace(/\D/g, ""),
        })
        setMessage("Dados da conta atualizados.")
    }

    return (
        <section className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
            <h2 className="text-center text-xl font-semibold text-slate-900">
                Alterar dados da conta
            </h2>
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div className="flex flex-col items-center gap-4">
                    {businessImage ? (
                        <img
                            src={businessImage}
                            alt="Pré-visualização da foto do comércio"
                            className="h-28 w-28 rounded-full object-cover ring-4 ring-blue-50"
                        />
                    ) : (
                        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-4 ring-blue-50">
                            <VscAccount aria-hidden="true" className="text-5xl" />
                        </div>
                    )}
                    <div className="w-full">
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
                            onChange={handleImageChange}
                            className="block w-full rounded-lg border border-slate-300 text-sm text-slate-600 file:mr-4 file:border-0 file:bg-blue-50 file:px-4 file:py-3 file:font-medium file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>
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
                        value={businessName}
                        onChange={(event) => setBusinessName(event.target.value)}
                        placeholder="Ex.: Loja da Maria"
                        maxLength={80}
                        required
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                        inputMode="numeric"
                        autoComplete="tel"
                        value={whatsappNumber}
                        onChange={(event) => setWhatsappNumber(event.target.value)}
                        placeholder="Ex.: 5511999999999"
                        aria-describedby="business-whatsapp-help"
                        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                    <p id="business-whatsapp-help" className="mt-2 text-sm text-slate-500">
                        Inclua o código do país e o DDD. Exemplo: 5511999999999.
                    </p>
                </div>
                {message && (
                    <p role="status" className="text-sm text-blue-700">
                        {message}
                    </p>
                )}
                <button
                    type="submit"
                    className="w-full rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800"
                >
                    Salvar dados da conta
                </button>
            </form>
        </section>
    )
}

export function LoginSettings({ login, onSaveLogin }) {
    const [loginName, setLoginName] = useState(login)
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [message, setMessage] = useState("")

    function handleSubmit(event) {
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

        if (loginName.trim()) onSaveLogin(loginName.trim())
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
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
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

export default function UserProfile() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const navLinkClass = ({ isActive }) =>
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
                                className={navLinkClass}
                            >
                                Dados do comércio
                            </NavLink>
                            <NavLink
                                to="/home/profile/account"
                                onClick={() => setIsMenuOpen(false)}
                                className={navLinkClass}
                            >
                                Alterar dados da conta
                            </NavLink>
                            <NavLink
                                to="/home/profile/login"
                                onClick={() => setIsMenuOpen(false)}
                                className={navLinkClass}
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
