import { useEffect, useState } from "react"
import { VscEdit, VscTrash } from "react-icons/vsc"
import { Route, Routes, useLocation, useNavigate } from "react-router-dom"
import BarraDeNavegacao from "../components/navbar.jsx"
import { useAutenticacao } from "../components/auth-context.js"
import {
    atualizarProduto,
    criarProduto,
    excluirProduto as excluirProdutoDaAPI,
    listarProdutos,
} from "../APIs/Produto.js"
import PerfilDaLoja, {
    ConfiguracoesDaConta,
    ConfiguracoesDeAcesso,
    VisaoGeralDoPerfil,
} from "../components/user-profile.jsx"

const initialForm = {
    name: "",
    description: "",
    category: "",
    price: "",
    image: "",
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
})

// Exibe os produtos cadastrados e oferece ações de edição e exclusão.
function CatalogoDeProdutos({ products, aoEditar, aoExcluir, isLoading }) {

    return (
        <>
            <header className="bg-blue-700 px-6 py-6 text-white shadow-md">
                <div className="mx-auto max-w-6xl text-center">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">
                        Vitrine virtual
                    </p>
                    <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
                        Seus produtos
                    </h1>
                    <p className="mt-2 text-blue-100">
                        Cadastre e organize os produtos da sua vitrine.
                    </p>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-6 py-8">
                {isLoading ? (
                    <p role="status" className="rounded-lg bg-white p-6 text-center text-slate-600">
                        Carregando produtos...
                    </p>
                ) : products.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                        <h2 className="text-xl font-semibold text-slate-800">
                            Sua vitrine está vazia
                        </h2>
                        <p className="mt-2 text-slate-500">
                            Use o botão + para cadastrar seu primeiro produto.
                        </p>
                    </div>
                ) : (
                    <section
                        aria-label="Produtos cadastrados"
                        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                    >
                        {products.map((product) => (
                            <article
                                key={product.id}
                                className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"
                            >
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="h-56 w-full object-cover"
                                />
                                <div className="p-5">
                                    <h2 className="truncate text-center text-xl font-semibold text-slate-900">
                                        {product.name}
                                    </h2>
                                    {product.category && (
                                        <p className="mt-1 text-sm font-medium text-blue-700">
                                            {product.category}
                                        </p>
                                    )}
                                    <p className="mt-2 min-h-12 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                                        {product.description}
                                    </p>
                                    <p className="mt-4 text-lg font-bold text-blue-700">
                                        {currencyFormatter.format(product.price)}
                                    </p>
                                    <div className="mt-5 flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => aoEditar(product)}
                                            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
                                        >
                                            <VscEdit aria-hidden="true" />
                                            Editar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => aoExcluir(product.id)}
                                            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
                                        >
                                            <VscTrash aria-hidden="true" />
                                            Excluir
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </section>
                )}
            </main>
        </>
    )
}

// Coordena o catálogo, formulários e configurações da área administrativa.
export default function Inicio() {
    const navigate = useNavigate()
    const location = useLocation()
    const { user } = useAutenticacao()
    const [products, setProducts] = useState([])
    const [productsError, setProductsError] = useState("")
    const [isLoadingProducts, setIsLoadingProducts] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingProductId, setEditingProductId] = useState(null)
    const [form, setForm] = useState(initialForm)
    const [imageFile, setImageFile] = useState(null)
    const [imageError, setImageError] = useState("")
    const [isLoadingImage, setIsLoadingImage] = useState(false)
    const [isSubmittingProduct, setIsSubmittingProduct] = useState(false)
    const [accountLogin, setAccountLogin] = useState("")
    const profile = {
        id: user?.id,
        businessName: user?.nome_loja || "",
        image: user?.foto_loja || "",
        whatsappNumber: user?.contato || "",
    }

    useEffect(() => {
        let isCurrent = true

        async function carregarProdutos() {
            setIsLoadingProducts(true)
            setProductsError("")
            try {
                const loadedProducts = await listarProdutos(user?.id)
                if (isCurrent) setProducts(loadedProducts)
            } catch (error) {
                if (isCurrent) {
                    setProductsError(
                        error.message || "Não foi possível carregar os produtos.",
                    )
                }
            } finally {
                if (isCurrent) setIsLoadingProducts(false)
            }
        }

        carregarProdutos()
        return () => {
            isCurrent = false
        }
    }, [user?.id])

    useEffect(() => {
        if (!isModalOpen) return undefined

        // Fecha o formulário quando o usuário pressiona Escape.
        function fecharComEsc(event) {
            if (event.key === "Escape") fecharModal()
        }

        window.addEventListener("keydown", fecharComEsc)
        return () => window.removeEventListener("keydown", fecharComEsc)
    }, [isModalOpen])

    // Prepara o formulário vazio para cadastrar um produto.
    function abrirModalDeCadastro() {
        navigate("/home")
        setEditingProductId(null)
        setForm(initialForm)
        setImageFile(null)
        setImageError("")
        setIsLoadingImage(false)
        setIsModalOpen(true)
    }

    // Preenche o formulário com os dados do produto selecionado.
    function abrirModalDeEdicao(product) {
        setEditingProductId(product.id)
        setForm({
            name: product.name,
            description: product.description,
            category: product.category || "",
            price: String(product.price),
            image: product.image,
        })
        setImageFile(null)
        setImageError("")
        setIsLoadingImage(false)
        setIsModalOpen(true)
    }

    // Fecha o formulário e limpa os dados temporários da edição.
    function fecharModal() {
        setIsModalOpen(false)
        setEditingProductId(null)
        setForm(initialForm)
        setImageFile(null)
        setImageError("")
        setIsLoadingImage(false)
    }

    // Valida o arquivo e carrega a imagem para o formulário.
    function tratarAlteracaoDaImagem(event) {
        const file = event.target.files?.[0]
        setImageError("")

        if (!file) return

        if (!file.type.startsWith("image/")) {
            setImageError("Selecione um arquivo de imagem válido.")
            event.target.value = ""
            return
        }

        const reader = new FileReader()
        setImageFile(file)
        setIsLoadingImage(true)
        setForm((currentForm) => ({ ...currentForm, image: "" }))
        reader.onload = () => {
            if (typeof reader.result === "string") {
                setForm((currentForm) => ({ ...currentForm, image: reader.result }))
            }
            setIsLoadingImage(false)
        }
        reader.onerror = () => {
            setImageError("Não foi possível carregar a imagem. Tente novamente.")
            setIsLoadingImage(false)
        }
        reader.readAsDataURL(file)
    }

    // Cria ou atualiza o produto usando os valores validados do formulário.
    async function tratarEnvioDoFormulario(event) {
        event.preventDefault()
        if (isSubmittingProduct) return

        const product = {
            ...form,
            category: form.category.trim(),
            price: Number(form.price),
        }

        setProductsError("")
        setIsSubmittingProduct(true)
        try {
            const savedProduct = editingProductId
                ? await atualizarProduto(editingProductId, product, imageFile)
                : await criarProduto(product, imageFile)

            setProducts((currentProducts) =>
                editingProductId
                    ? currentProducts.map((item) =>
                          item.id === editingProductId ? savedProduct : item,
                      )
                    : [...currentProducts, savedProduct],
            )
            fecharModal()
        } catch (error) {
            setProductsError(
                error.message || "Não foi possível salvar o produto. Tente novamente.",
            )
        } finally {
            setIsSubmittingProduct(false)
        }
    }

    // Confirma a exclusão antes de remover o produto da API.
    async function excluirProduto(productId) {
        if (!window.confirm("Deseja realmente excluir este produto?")) return
        setProductsError("")
        try {
            await excluirProdutoDaAPI(productId)
            setProducts((currentProducts) =>
                currentProducts.filter((product) => product.id !== productId),
            )
        } catch (error) {
            setProductsError(
                error.message || "Não foi possível excluir o produto. Tente novamente.",
            )
        }
    }

    // Alterna entre o catálogo de produtos e as configurações do perfil.
    function tratarCliqueNoPerfil() {
        if (location.pathname.startsWith("/home/profile")) {
            navigate("/home")
            return
        }

        fecharModal()
        navigate("/home/profile")
    }

    return (
        <div className="min-h-screen bg-slate-100 pb-24">
            <Routes>
                <Route
                    index
                    element={
                        <CatalogoDeProdutos
                            products={products}
                            aoEditar={abrirModalDeEdicao}
                            aoExcluir={excluirProduto}
                            isLoading={isLoadingProducts}
                        />
                    }
                />
                <Route path="profile" element={<PerfilDaLoja />}>
                    <Route
                        index
                        element={<VisaoGeralDoPerfil profile={profile} />}
                    />
                    <Route
                        path="account"
                        element={
                            <ConfiguracoesDaConta
                                profile={profile}
                                email={user?.email || ""}
                            />
                        }
                    />
                    <Route
                        path="login"
                        element={
                            <ConfiguracoesDeAcesso
                                login={accountLogin}
                                aoSalvarLogin={setAccountLogin}
                            />
                        }
                    />
                </Route>
            </Routes>
            {productsError && (
                <p
                    role="alert"
                    className="mx-auto mt-4 max-w-6xl rounded-lg bg-amber-50 p-4 text-amber-900"
                >
                    {productsError}
                </p>
            )}

            {isModalOpen && (
                <div
                    className="fixed inset-0 z-20 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) fecharModal()
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="product-modal-title"
                        className="my-auto w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
                    >
                        <h2
                            id="product-modal-title"
                            className="text-center text-2xl font-bold text-slate-900"
                        >
                            {editingProductId ? "Editar produto" : "Adicionar produto"}
                        </h2>
                        {productsError && (
                            <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
                                {productsError}
                            </p>
                        )}
                        <form onSubmit={tratarEnvioDoFormulario} className="mt-6 space-y-4">
                            <div>
                                <label
                                    htmlFor="product-image"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Foto do produto
                                </label>
                                <input
                                    id="product-image"
                                    type="file"
                                    accept="image/*"
                                    required={!form.image}
                                    onChange={tratarAlteracaoDaImagem}
                                    className="block w-full rounded-lg border border-slate-300 text-sm text-slate-600 file:mr-4 file:border-0 file:bg-blue-50 file:px-4 file:py-3 file:font-medium file:text-blue-700 hover:file:bg-blue-100"
                                />
                                {imageError && (
                                    <p role="alert" className="mt-2 text-sm text-red-600">
                                        {imageError}
                                    </p>
                                )}
                                {form.image && (
                                    <img
                                        src={form.image}
                                        alt="Pré-visualização do produto"
                                        className="mt-4 h-48 w-full rounded-xl object-cover"
                                    />
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="product-name"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Nome do produto
                                </label>
                                <input
                                    id="product-name"
                                    type="text"
                                    value={form.name}
                                    onChange={(event) =>
                                        setForm({ ...form, name: event.target.value })
                                    }
                                    placeholder="Ex.: Camiseta básica"
                                    required
                                    maxLength={80}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="product-category"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Categoria
                                </label>
                                <input
                                    id="product-category"
                                    type="text"
                                    value={form.category}
                                    onChange={(event) =>
                                        setForm({ ...form, category: event.target.value })
                                    }
                                    placeholder="Ex.: Roupas, Acessórios"
                                    required
                                    maxLength={40}
                                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="product-description"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Descrição
                                </label>
                                <textarea
                                    id="product-description"
                                    value={form.description}
                                    onChange={(event) =>
                                        setForm({ ...form, description: event.target.value })
                                    }
                                    placeholder="Descreva seu produto..."
                                    required
                                    rows={3}
                                    maxLength={500}
                                    className="w-full resize-y rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="product-price"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Valor (R$)
                                </label>
                                <input
                                    id="product-price"
                                    type="number"
                                    value={form.price}
                                    onChange={(event) =>
                                        setForm({ ...form, price: event.target.value })
                                    }
                                    placeholder="0,00"
                                    min="0"
                                    step="0.01"
                                    required
                                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={fecharModal}
                                    disabled={isSubmittingProduct}
                                    className="rounded-lg border border-slate-300 px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={
                                        Boolean(imageError) ||
                                        isLoadingImage ||
                                        isSubmittingProduct
                                    }
                                    className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isSubmittingProduct
                                        ? "Salvando..."
                                        : editingProductId
                                          ? "Salvar alterações"
                                          : "Cadastrar"}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}

            <BarraDeNavegacao
                aoAdicionar={abrirModalDeCadastro}
                aoClicarNoPerfil={tratarCliqueNoPerfil}
                perfilAtivo={location.pathname.startsWith("/home/profile")}
            />
        </div>
    )
}
