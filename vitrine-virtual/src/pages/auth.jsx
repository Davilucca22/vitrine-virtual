import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { VscAccount } from "react-icons/vsc"
import { useAutenticacao } from "../components/auth-context.js"
import Registro from "../APIs/Registro.js"
import Login from "../APIs/Login.js"

const inputClassName =
    "w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"

// Padroniza o layout das telas de login e cadastro.
function LayoutDeAutenticacao({ title, description, children }) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
            <section className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
                <header className="text-center">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
                        Vitrine virtual
                    </p>
                    <h1 className="mt-2 text-3xl font-bold text-slate-900">{title}</h1>
                    <p className="mt-2 text-slate-600">{description}</p>
                </header>
                <div className="mt-8">{children}</div>
            </section>
        </main>
    )
}

// Permite que o lojista acesse a área de gerenciamento.
export function TelaDeLogin() {
    const [error, setError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { entrar } = useAutenticacao()
    const navigate = useNavigate()

    // Valida as credenciais no backend e inicia a sessão após autenticar.
    async function tratarEnvioDoFormulario(event) {
        event.preventDefault()
        if (isSubmitting) return

        setError("")

        const formData = new FormData(event.currentTarget)
        const email = formData.get("email").trim().toLowerCase()
        const senha = formData.get("password")

        setIsSubmitting(true)
        try {
            const result = await Login({ email, senha })
            const user = result?.response
            if (!user?.email) {
                throw new Error("O servidor retornou uma resposta de login inválida.")
            }

            entrar(user)
            navigate("/home", { replace: true })
        } catch (submitError) {
            setError(submitError.message || "Não foi possível entrar na conta. Tente novamente.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <LayoutDeAutenticacao
            title="Entrar"
            description="Acesse sua conta para gerenciar a loja."
        >
            <form onSubmit={tratarEnvioDoFormulario} className="space-y-5">
                <div>
                    <label
                        htmlFor="login-email"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Email
                    </label>
                    <input
                        id="login-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className={inputClassName}
                        placeholder="voce@exemplo.com"
                    />
                </div>
                <div>
                    <label
                        htmlFor="login-password"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Senha
                    </label>
                    <input
                        id="login-password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        className={inputClassName}
                        placeholder="Sua senha"
                    />
                </div>
                {error && (
                    <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                        {error}
                    </p>
                )}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800"
                >
                    {isSubmitting ? "Entrando..." : "Entrar"}
                </button>
            </form>
            <p className="mt-6 text-center text-sm text-slate-600">
                Ainda não tem conta?{" "}
                <Link
                    to="/registro"
                    className="font-semibold text-blue-700 hover:text-blue-800"
                >
                    Criar conta
                </Link>
            </p>
            <Link
                to="/vitrine"
                className="mt-4 block text-center text-sm text-slate-500 hover:text-slate-700"
            >
                Voltar à vitrine
            </Link>
        </LayoutDeAutenticacao>
    )
}

// Apresenta o cadastro de demonstração da loja.
export function TelaDeCadastro() {
    const [photoPreview, setPhotoPreview] = useState("")
    const [error, setError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { entrar } = useAutenticacao()
    const navigate = useNavigate()

    // Valida a imagem selecionada e gera uma pré-visualização local.
    function tratarAlteracaoDaFoto(event) {
        const file = event.target.files?.[0]
        setError("")

        if (!file) {
            setPhotoPreview("")
            return
        }

        if (!file.type.startsWith("image/")) {
            setError("Selecione um arquivo de imagem válido.")
            event.target.value = ""
            setPhotoPreview("")
            return
        }

        const reader = new FileReader()
        reader.onload = () => {
            if (typeof reader.result === "string") setPhotoPreview(reader.result)
        }
        reader.onerror = () => {
            setError("Não foi possível carregar a foto. Tente novamente.")
        }
        reader.readAsDataURL(file)
    }

    // Envia os campos no formato esperado pelo backend e inicia a sessão após o cadastro.
    async function tratarEnvioDoFormulario(event) {
        event.preventDefault()
        if (isSubmitting) return

        setError("")

        const inputData = new FormData(event.currentTarget)
        const password = inputData.get("password")
        const passwordConfirmation = inputData.get("passwordConfirmation")

        if (password !== passwordConfirmation) {
            setError("A confirmação da senha não corresponde.")
            return
        }

        const formData = new FormData()
        formData.append("nome_loja", inputData.get("businessName").trim())
        formData.append("email", inputData.get("email").trim().toLowerCase())
        formData.append("senha", password)
        formData.append("contato", inputData.get("whatsapp").trim())

        const photo = inputData.get("photo")
        if (photo instanceof File && photo.size > 0) {
            formData.append("foto", photo)
        }

        setIsSubmitting(true)
        try {
            const result = await Registro({ formData })
            const user = result?.response
            if (!user?.email) {
                throw new Error("O cadastro foi concluído, mas a resposta do servidor é inválida.")
            }

            entrar(user)
            navigate("/home", { replace: true })
        } catch (submitError) {
            setError(submitError.message || "Não foi possível criar a conta. Tente novamente.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <LayoutDeAutenticacao
            title="Criar conta"
            description="Cadastre os dados da sua loja para começar."
        >
            <form onSubmit={tratarEnvioDoFormulario} className="space-y-4">
                <div>
                    <label
                        htmlFor="register-business-name"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Nome da loja <span className="text-red-600">*</span>
                    </label>
                    <input
                        id="register-business-name"
                        name="businessName"
                        type="text"
                        autoComplete="organization"
                        required
                        maxLength={80}
                        className={inputClassName}
                        placeholder="Ex.: Loja da Maria"
                    />
                </div>

                <div>
                    <label
                        htmlFor="register-photo"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Foto da loja (opcional)
                    </label>
                    <div className="flex flex-col items-center gap-3">
                        {photoPreview ? (
                            <img
                                src={photoPreview}
                                alt="Pré-visualização da foto da loja"
                                className="h-24 w-24 rounded-full object-cover ring-4 ring-blue-50"
                            />
                        ) : (
                            <div
                                aria-label="Nenhuma foto selecionada"
                                className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 text-blue-600"
                            >
                                <VscAccount aria-hidden="true" className="text-4xl" />
                            </div>
                        )}
                        <input
                            id="register-photo"
                            name="photo"
                            type="file"
                            accept="image/*"
                            onChange={tratarAlteracaoDaFoto}
                            className="block w-full rounded-lg border border-slate-300 text-sm text-slate-600 file:mr-4 file:border-0 file:bg-blue-50 file:px-4 file:py-3 file:font-medium file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>
                </div>

                <div>
                    <label
                        htmlFor="register-whatsapp"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        WhatsApp <span className="text-red-600">*</span>
                    </label>
                    <input
                        id="register-whatsapp"
                        name="whatsapp"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        required
                        minLength={13}
                        className={inputClassName}
                        placeholder="Ex.: +55 11 99999-9999"
                    />
                </div>

                <div>
                    <label
                        htmlFor="register-email"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Email <span className="text-red-600">*</span>
                    </label>
                    <input
                        id="register-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className={inputClassName}
                        placeholder="voce@exemplo.com"
                    />
                </div>

                <div>
                    <label
                        htmlFor="register-password"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Senha <span className="text-red-600">*</span>
                    </label>
                    <input
                        id="register-password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        minLength={8}
                        required
                        className={inputClassName}
                        placeholder="Mínimo de 8 caracteres"
                    />
                </div>

                <div>
                    <label
                        htmlFor="register-password-confirmation"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Confirmação de senha <span className="text-red-600">*</span>
                    </label>
                    <input
                        id="register-password-confirmation"
                        name="passwordConfirmation"
                        type="password"
                        autoComplete="new-password"
                        minLength={8}
                        required
                        className={inputClassName}
                        placeholder="Digite novamente sua senha"
                    />
                </div>

                {error && (
                    <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                        {error}
                    </p>
                )}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800"
                >
                    {isSubmitting ? "Criando conta..." : "Criar conta"}
                </button>
            </form>
            <p className="mt-6 text-center text-sm text-slate-600">
                Já tem uma conta?{" "}
                <Link
                    to="/login"
                    className="font-semibold text-blue-700 hover:text-blue-800"
                >
                    Entrar
                </Link>
            </p>
            <Link
                to="/vitrine"
                className="mt-4 block text-center text-sm text-slate-500 hover:text-slate-700"
            >
                Voltar à vitrine
            </Link>
        </LayoutDeAutenticacao>
    )
}
