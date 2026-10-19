import { useEffect, useState } from "react"
import { VscEdit, VscTrash } from "react-icons/vsc"
import { Route, Routes, useLocation, useNavigate } from "react-router-dom"
import BarraDeNavegacao from "../components/navbar.jsx"
import { useAutenticacao } from "../components/auth-context.js"
import {
    atualizarDadosDaConta,
    atualizarDadosDeLogin,
    encerrarSessao,
} from "../APIs/Usuario.js"
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
function CatalogoDeProdutos({
    products,
    aoEditar,
    aoExcluir,
    aoVerDetalhes,
    isLoading,
}) {

    return (
        <>
            {/* Cabeçalho que identifica a vitrine e apresenta a área de produtos. */}
            <header className="bg-indigo-700 px-6 py-6 text-white shadow-sm">
                {/* Título e orientação para organizar os produtos cadastrados. */}
                <div className="mx-auto max-w-6xl text-center">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-100">
                        Vitrine virtual
                    </p>
                    <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
                        Seus produtos
                    </h1>
                    <p className="mt-2 text-indigo-100">
                        Cadastre e organize os produtos da sua vitrine.
                    </p>
                </div>
            </header>

            {/* Conteúdo principal do catálogo, com carregamento, estado vazio ou produtos. */}
            <main className="mx-auto max-w-6xl px-6 py-8">
                {isLoading ? (
                    /* Indicador exibido enquanto a lista de produtos é carregada. */
                    <p role="status" className="rounded-lg bg-white p-6 text-center text-slate-600">
                        Carregando produtos...
                    </p>
                ) : products.length === 0 ? (
                    /* Mensagem e instrução quando ainda não há produtos cadastrados. */
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                        <h2 className="text-xl font-semibold text-slate-800">
                            Sua vitrine está vazia
                        </h2>
                        <p className="mt-2 text-slate-500">
                            Use o botão + para cadastrar seu primeiro produto.
                        </p>
                    </div>
                ) : (
                    /* Grade de produtos cadastrados, com duas colunas no mobile e três no desktop. */
                    <section
                        aria-label="Produtos cadastrados"
                        className="grid grid-cols-2 gap-6 lg:grid-cols-3"
                    >
                        {products.map((product) => (
                            /* Card com a foto, nome, categoria e ações do produto. */
                            <article
                                key={product.id}
                                className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"
                            >
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className=" w-full bg-black/50 object-contain lg:aspect-auto lg:h-56"
                                />
                                {/* Informações do produto e ações responsivas para mobile e desktop. */}
                                <div className="p-3 lg:p-5">
                                    <h2 className="line-clamp-2 min-h-10 text-center text-sm font-semibold text-slate-800 lg:truncate lg:text-xl">
                                        {product.name}
                                    </h2>
                                    <p className="mt-1 truncate text-center text-xs font-medium text-indigo-700 lg:text-left lg:text-sm">
                                        {product.category || "Sem categoria"}
                                    </p>
                                    <p className="mt-3 hidden min-h-12 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600 lg:block">
                                        {product.description}
                                    </p>
                                    <p className="mt-3 hidden text-lg font-bold text-indigo-700 lg:block">
                                        {currencyFormatter.format(product.price)}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => aoVerDetalhes(product)}
                                        className="mt-3 flex w-full items-center justify-center rounded-lg border border-indigo-700 px-2 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 lg:hidden"
                                    >
                                        Ver detalhes
                                    </button>
                                    <div className="mt-5 hidden gap-3 lg:flex">
                                        <button
                                            type="button"
                                            onClick={() => aoEditar(product)}
                                            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-indigo-200 px-4 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-50"
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
    const { user, atualizarUsuario, sair } = useAutenticacao()
    const [products, setProducts] = useState([])
    const [productsError, setProductsError] = useState("")
    const [isLoadingProducts, setIsLoadingProducts] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [editingProductId, setEditingProductId] = useState(null)
    const [form, setForm] = useState(initialForm)
    const [imageFile, setImageFile] = useState(null)
    const [imageError, setImageError] = useState("")
    const [isLoadingImage, setIsLoadingImage] = useState(false)
    const [isSubmittingProduct, setIsSubmittingProduct] = useState(false)
    const [logoutError, setLogoutError] = useState("")
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
                if (isCurrent) setProducts(loadedProducts.products)
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

    useEffect(() => {
        if (!selectedProduct) return undefined

        function fecharDetalhesComEsc(event) {
            if (event.key === "Escape") setSelectedProduct(null)
        }

        window.addEventListener("keydown", fecharDetalhesComEsc)
        return () => window.removeEventListener("keydown", fecharDetalhesComEsc)
    }, [selectedProduct])

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

    async function salvarDadosDaConta(dados) {
        const updatedUser = await atualizarDadosDaConta(dados)
        atualizarUsuario(updatedUser)
        return updatedUser
    }

    async function salvarDadosDeLogin(credentials) {
        const updatedUser = await atualizarDadosDeLogin(credentials)
        atualizarUsuario(updatedUser)
    }

    async function encerrarConta() {
        setLogoutError("")
        try {
            await encerrarSessao()
            sair()
            navigate("/login", { replace: true })
        } catch (error) {
            setLogoutError(error.message || "Não foi possível encerrar a sessão.")
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
        <div className="min-h-screen bg-slate-50 pb-20">
          <div className="min-h-screen">
            <Routes>
                <Route
                    index
                    element={
                        <CatalogoDeProdutos
                            products={products}
                            aoEditar={abrirModalDeEdicao}
                            aoExcluir={excluirProduto}
                            aoVerDetalhes={setSelectedProduct}
                            isLoading={isLoadingProducts}
                        />
                    }
                />
                <Route path="profile" element={<PerfilDaLoja aoSair={encerrarConta} />}>
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
                                aoSalvarDados={salvarDadosDaConta}
                            />
                        }
                    />
                    <Route
                        path="login"
                        element={
                            <ConfiguracoesDeAcesso
                                email={user?.email || ""}
                                aoSalvarLogin={salvarDadosDeLogin}
                            />
                        }
                    />
                </Route>
            </Routes>
            {logoutError && (
                <p
                    role="alert"
                    className="mx-auto mt-4 max-w-6xl rounded-lg bg-red-50 p-4 text-red-800"
                >
                    {logoutError}
                </p>
            )}
            {productsError && (
                <p
                    role="alert"
                    className="mx-auto mt-4 max-w-6xl rounded-lg bg-red-50 p-4 text-red-800"
                >
                    {productsError}
                </p>
            )}

            {selectedProduct && (
                /* Fundo que destaca a janela de detalhes do produto no mobile. */
                <div
                    className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 lg:hidden"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setSelectedProduct(null)
                        }
                    }}
                >
                    {/* Detalhes do produto e ações para editar ou excluir. */}
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="product-details-title"
                        className="my-auto w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
                    >
                        <img
                            src={selectedProduct.image}
                            alt={selectedProduct.name}
                            className="max-h-64 w-full bg-black/50 object-contain"
                        />
                        <div className="p-5">
                            <h2
                                id="product-details-title"
                                className="text-xl font-bold text-slate-800"
                            >
                                {selectedProduct.name}
                            </h2>
                            <p className="mt-1 text-sm font-medium text-indigo-700">
                                {selectedProduct.category || "Sem categoria"}
                            </p>
                            {selectedProduct.description && (
                                <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                                    {selectedProduct.description}
                                </p>
                            )}
                            <p className="mt-4 text-lg font-bold text-indigo-700">
                                {currencyFormatter.format(selectedProduct.price)}
                            </p>
                            <div className="mt-5 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const productToEdit = selectedProduct
                                        setSelectedProduct(null)
                                        abrirModalDeEdicao(productToEdit)
                                    }}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-indigo-200 px-4 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                >
                                    <VscEdit aria-hidden="true" />
                                    Editar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const productId = selectedProduct.id
                                        setSelectedProduct(null)
                                        excluirProduto(productId)
                                    }}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-600"
                                >
                                    <VscTrash aria-hidden="true" />
                                    Excluir
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedProduct(null)}
                                className="mt-2 flex w-full items-center justify-center rounded-lg px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                            >
                                Fechar
                            </button>
                        </div>
                    </section>
                </div>
            )}

            {isModalOpen && (
                /* Fundo que destaca o formulário de cadastro ou edição do produto. */
                <div
                    className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) fecharModal()
                    }}
                >
                    {/* Formulário com os campos para cadastrar ou atualizar um produto. */}
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="product-modal-title"
                        className="my-auto w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
                    >
                        <h2
                            id="product-modal-title"
                            className="text-center text-2xl font-bold text-slate-800"
                        >
                            {editingProductId ? "Editar produto" : "Adicionar produto"}
                        </h2>
                        {productsError && (
                            <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
                                {productsError}
                            </p>
                        )}
                        {/* Campos da imagem, nome, categoria, descrição e preço do produto. */}
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
                                    className="block w-full rounded-lg border border-slate-300 text-sm text-slate-600 file:mr-4 file:border-0 file:bg-indigo-50 file:px-4 file:py-3 file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
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
                                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-800 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
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
                                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-800 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
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
                                    className="w-full resize-y rounded-lg border border-slate-300 px-4 py-3 text-slate-800 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
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
                                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-800 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>

                            {/* Ações para cancelar o formulário ou salvar o produto. */}
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
                                    className="rounded-lg bg-indigo-700 px-5 py-3 font-semibold text-white transition hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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

          </div>
            {/* Navegação inferior para cadastrar produtos e acessar o perfil da loja. */}
            <BarraDeNavegacao
                aoAdicionar={abrirModalDeCadastro}
                aoClicarNoPerfil={tratarCliqueNoPerfil}
                perfilAtivo={location.pathname.startsWith("/home/profile")}
            />
        </div>
    )
}
