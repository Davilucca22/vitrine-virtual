import { useEffect, useState } from "react"
import { VscAccount, VscCallOutgoing } from "react-icons/vsc"
import { useAutenticacao } from "../components/auth-context.js"
import { useSearchParams } from "react-router-dom"
import { listarProdutosDaVitrine } from "../APIs/Produto.js"

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
})

// Monta o link do WhatsApp com o resumo e o valor total do carrinho.
function criarLinkDoWhatsApp(
    phoneNumber,
    cartItems,
    total,
    businessName,
    showPrices,
) {
    const phone = String(phoneNumber || "").replace(/\D/g, "")
    const items = cartItems
        .map(
            ({ product, quantity }) =>
                showPrices
                    ? `- ${product.name} (${quantity}x ${currencyFormatter.format(product.price)}): ${currencyFormatter.format(product.price * quantity)}`
                    : `- ${product.name} (${quantity}x)`,
        )
        .join("\n")
    const message = showPrices
        ? `Olá! Gostaria de fazer este pedido${businessName ? ` na ${businessName}` : ""}:\n\n${items}\n\nTotal: ${currencyFormatter.format(total)}`
        : `Olá! Gostaria de fazer este pedido${businessName ? ` na ${businessName}` : ""}:\n\n${items}`
    const recipient = phone ? `/${phone}` : ""

    return `https://wa.me${recipient}?text=${encodeURIComponent(message)}`
}

// Apresenta os produtos, filtros por categoria e carrinho de compras.
export default function Vitrine() {
    const { user } = useAutenticacao()
    const [searchParams] = useSearchParams()
    const idLoja = searchParams.get("id_loja")
    const [products, setProducts] = useState([])
    const [whatsappNumber, setWhatsappNumber] = useState("")
    const [storeDetails, setStoreDetails] = useState(null)
    const [showPrices, setShowPrices] = useState(true)
    const [productsError, setProductsError] = useState("")
    const [isLoadingProducts, setIsLoadingProducts] = useState(true)
    const profile = storeDetails || {
        businessName: user?.nome_loja || "",
        image: user?.foto_loja || "",
    }
    const [cart, setCart] = useState({})
    const [isCartExpanded, setIsCartExpanded] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState("")
    const [selectedProduct, setSelectedProduct] = useState(null)

    useEffect(() => {
        if (!selectedProduct) return

        function handleKeyDown(event) {
            if (event.key === "Escape") setSelectedProduct(null)
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [selectedProduct])

    useEffect(() => {
        let isCurrent = true

        async function carregarProdutos() {
            setIsLoadingProducts(true)
            setProductsError("")
            setStoreDetails(null)
            try {
                const catalog = await listarProdutosDaVitrine(idLoja)
                if (isCurrent) {
                    setProducts(catalog.products)
                    setWhatsappNumber(catalog.whatsappNumber)
                    setShowPrices(catalog.verPrecos)
                    setStoreDetails({
                        businessName: catalog.storeName,
                        image: catalog.storeImage,
                    })
                }
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
    }, [idLoja])
    const categories = [...new Set(
        products
            .map((product) => product.category?.trim())
            .filter(Boolean),
    )].sort((first, second) => first.localeCompare(second, "pt-BR"))
    const visibleProducts = selectedCategory
        ? products.filter((product) => product.category?.trim() === selectedCategory)
        : products
    const cartItems = products
        .filter((product) => cart[product.id] > 0)
        .map((product) => ({
            product,
            quantity: cart[product.id],
        }))
    const cartTotal = cartItems.reduce(
        (total, { product, quantity }) =>
            showPrices ? total + product.price * quantity : total,
        0,
    )
    const cartQuantity = cartItems.reduce(
        (total, { quantity }) => total + quantity,
        0,
    )

    // Atualiza a quantidade do produto ou o remove quando ela chega a zero.
    function atualizarCarrinho(productId, quantity) {
        setCart((currentCart) => {
            const nextCart = { ...currentCart }
            if (quantity < 1) {
                delete nextCart[productId]
            } else {
                nextCart[productId] = quantity
            }
            return nextCart
        })
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Contêiner geral da página da vitrine. */}
            {/* Cabeçalho com a imagem, o nome e a apresentação da loja. */}
            <header className="bg-indigo-700 px-6 py-5 text-center text-white shadow-sm">
                {/* Agrupa a identidade visual e as informações da loja. */}
                <div className="mx-auto flex max-w-6xl flex-col items-center">
                    {profile.image ? (
                        <img
                            src={profile.image}
                            alt={`Foto de ${profile.businessName || "seu comércio"}`}
                            className="h-24 w-24 rounded-full object-cover ring-4 ring-white/40"
                        />
                    ) : (
                        <div className="mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-white/15 text-white">
                            <VscAccount aria-hidden="true" className="text-5xl" />
                        </div>
                    )}
                    <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
                        {profile.businessName || "Nossos produtos"}
                    </h1>
                    <p className="mt-2 text-indigo-100">
                        Confira nossos produtos e fale com a loja pelo WhatsApp.
                    </p>
                </div>
            </header>

            {/* Área principal com avisos, filtros, carrinho e catálogo. */}
            <main className="mx-auto max-w-6xl px-4 py-6 pb-80 sm:px-6 sm:py-8 sm:pb-80">
                {/* Exibe falhas ocorridas ao carregar os produtos. */}
                {productsError && (
                    <p role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
                        {productsError}
                    </p>
                )}
                {/* Informa quando não há WhatsApp disponível para finalizar pedidos. */}
                {!whatsappNumber && (
                    <p className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-center text-sm text-amber-900">
                        Não foi possível obter o WhatsApp da loja. O contato não está
                        disponível para finalizar o pedido.
                    </p>
                )}
                {/* Filtro para selecionar quais categorias de produtos são exibidas. */}
                {products.length > 0 && (
                    <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <label
                            htmlFor="category-filter"
                            className="mb-2 block text-sm font-medium text-slate-700"
                        >
                            Buscar por categoria
                        </label>
                        <select
                            id="category-filter"
                            value={selectedCategory}
                            onChange={(event) => setSelectedCategory(event.target.value)}
                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 sm:max-w-sm"
                        >
                            <option value="">Todas as categorias</option>
                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                {/* Carrinho fixo com resumo, itens selecionados e opção de finalizar o pedido. */}
                <section
                    aria-label="Carrinho de compras"
                    className={`fixed inset-x-3 bottom-3 z-40 mx-auto flex w-auto max-w-md flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl transition-[max-height] duration-200 sm:inset-x-auto sm:right-6 sm:mx-0 sm:w-96 ${
                        isCartExpanded ? "max-h-[75vh]" : "h-[76px]"
                    }`}
                >
                    <button
                        type="button"
                        aria-expanded={isCartExpanded}
                        aria-controls="cart-content"
                        onClick={() => setIsCartExpanded((expanded) => !expanded)}
                        className="flex min-h-[76px] w-full shrink-0 items-center justify-between gap-2 px-4 text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:px-5"
                    >
                        <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-slate-800 sm:text-base">
                                Carrinho · {cartQuantity} {cartQuantity === 1 ? "item" : "itens"}
                            </span>
                            {!isCartExpanded && (
                                <span className="mt-1 block truncate text-xs font-medium text-indigo-700">
                                    Toque aqui para revisar e finalizar
                                </span>
                            )}
                        </span>
                        {showPrices && (
                            <span className="shrink-0 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-bold text-indigo-700 sm:text-base">
                                {currencyFormatter.format(cartTotal)}
                            </span>
                        )}
                        <span className="sr-only">
                            {isCartExpanded ? "Recolher carrinho" : "Expandir carrinho"}
                        </span>
                    </button>
                    {isCartExpanded && (
                        <div
                            id="cart-content"
                            className="flex min-h-0 flex-col border-t border-slate-200 bg-slate-50/70"
                        >
                            {cartItems.length === 0 ? (
                                <p className="p-4 text-sm text-slate-500 sm:px-5">
                                    Adicione produtos para montar seu pedido.
                                </p>
                            ) : (
                                <>
                                    {/* Lista os itens do carrinho e seus controles de quantidade. */}
                                    <ul className="min-h-0 flex-1 divide-y divide-slate-200 overflow-y-auto px-4 sm:px-5">
                                        {cartItems.map(({ product, quantity }) => (
                                            <li
                                                key={product.id}
                                                className="flex min-w-0 flex-col gap-2 py-3"
                                            >
                                                <div className="flex min-w-0 items-start justify-between gap-2">
                                                    <p className="min-w-0 break-words font-medium text-slate-800">
                                                        {product.name}
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={() => atualizarCarrinho(product.id, 0)}
                                                        className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-600"
                                                        aria-label={`Remover ${product.name} do carrinho`}
                                                    >
                                                        Remover
                                                    </button>
                                                </div>
                                                <div className="flex min-w-0 items-center justify-between gap-2">
                                                    <div className="flex items-center gap-1.5">
                                                        <label
                                                            htmlFor={`quantity-${product.id}`}
                                                            className="text-xs text-slate-600 sm:text-sm"
                                                        >
                                                            Qtd.
                                                        </label>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                atualizarCarrinho(
                                                                    product.id,
                                                                    quantity - 1,
                                                                )
                                                            }
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-lg font-semibold text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                                            aria-label={`Diminuir quantidade de ${product.name}`}
                                                        >
                                                            -
                                                        </button>
                                                        <input
                                                            id={`quantity-${product.id}`}
                                                            type="number"
                                                            min="1"
                                                            step="1"
                                                            value={quantity}
                                                            onChange={(event) => {
                                                                const nextQuantity = Number(
                                                                    event.target.value,
                                                                )
                                                                if (
                                                                    event.target.value &&
                                                                    Number.isInteger(nextQuantity) &&
                                                                    nextQuantity > 0
                                                                ) {
                                                                    atualizarCarrinho(
                                                                        product.id,
                                                                        nextQuantity,
                                                                    )
                                                                }
                                                            }}
                                                            className="w-14 rounded-lg border border-slate-300 px-1 py-1.5 text-center text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                atualizarCarrinho(
                                                                    product.id,
                                                                    quantity + 1,
                                                                )
                                                            }
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-lg font-semibold text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                                            aria-label={`Aumentar quantidade de ${product.name}`}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                    {showPrices && (
                                                        <div className="min-w-0 text-right">
                                                            <p className="truncate text-xs text-slate-500">
                                                                {currencyFormatter.format(product.price)}{" "}
                                                                cada
                                                            </p>
                                                            <p className="font-semibold text-slate-800">
                                                                {currencyFormatter.format(
                                                                    product.price * quantity,
                                                                )}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                    <a
                                        href={criarLinkDoWhatsApp(
                                            whatsappNumber,
                                            cartItems,
                                            cartTotal,
                                            profile.businessName,
                                            showPrices,
                                        )}
                                        target="_blank"
                                        rel="noreferrer"
                                        aria-disabled={!whatsappNumber}
                                        onClick={(event) => {
                                            if (!whatsappNumber) event.preventDefault()
                                        }}
                                        className={`m-4 mt-2 flex shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-3 text-center text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 sm:mx-5 sm:mb-5 ${
                                            whatsappNumber
                                                ? "bg-green-600 hover:bg-green-700"
                                                : "cursor-not-allowed bg-slate-400"
                                        }`}
                                    >
                                        <VscCallOutgoing aria-hidden="true" />
                                        Finalizar pedido pelo WhatsApp
                                    </a>
                                </>
                            )}
                        </div>
                    )}
                </section>
                {/* Mostra o carregamento, estados vazios ou os produtos filtrados. */}
                {isLoadingProducts ? (
                    <p role="status" className="rounded-lg bg-white p-6 text-center text-slate-600">
                        Carregando produtos...
                    </p>
                ) : products.length === 0 ? (
                    /* Estado vazio quando a loja não possui produtos cadastrados. */
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                        <h2 className="text-xl font-semibold text-slate-800">
                            Nenhum produto disponível
                        </h2>
                        <p className="mt-2 text-slate-500">
                            Volte mais tarde para conferir as novidades.
                        </p>
                    </div>
                ) : visibleProducts.length === 0 ? (
                    /* Estado vazio quando a categoria selecionada não tem produtos. */
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                        <h2 className="text-xl font-semibold text-slate-800">
                            Nenhum produto nesta categoria
                        </h2>
                        <p className="mt-2 text-slate-500">
                            Escolha outra categoria para ver mais produtos.
                        </p>
                    </div>
                ) : (
                    /* Grade com os produtos disponíveis na categoria selecionada. */
                    <section
                        aria-label="Produtos da loja"
                        className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                    >
                        {visibleProducts.map((product) => (
                            <article
                                key={product.id}
                                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-gray-500 shadow-sm"
                            >
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className=" w-full bg-black/50 object-contain lg:aspect-auto lg:h-56"
                                />
                                <div className="p-3 lg:p-5">
                                    <h2 className="line-clamp-2 min-h-10 text-center text-sm font-semibold text-slate-800 lg:truncate lg:text-xl">
                                        {product.name}
                                    </h2>
                                    <p className="mt-1 truncate text-center text-xs font-medium text-indigo-700 lg:text-left lg:text-sm">
                                        {product.category || "Sem categoria"}
                                    </p>
                                    <div className="mt-3 hidden lg:block">
                                        <p className="min-h-12 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                                            {product.description}
                                        </p>
                                    </div>
                                    {showPrices && (
                                        <p className="mt-3 hidden text-lg font-bold text-indigo-700 lg:block">
                                            {currencyFormatter.format(product.price)}
                                        </p>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setSelectedProduct(product)}
                                        className="mt-3 flex w-full items-center justify-center rounded-lg border border-indigo-700 px-2 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 lg:hidden"
                                    >
                                        Ver detalhes
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            atualizarCarrinho(
                                                product.id,
                                                (cart[product.id] || 0) + 1,
                                            )
                                        }
                                        className="mt-5 hidden w-full items-center justify-center gap-2 rounded-lg bg-indigo-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 lg:flex"
                                    >
                                        Adicionar ao carrinho
                                    </button>
                                </div>
                            </article>
                        ))}
                    </section>
                )}
            </main>
            {selectedProduct && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 lg:hidden"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setSelectedProduct(null)
                        }
                    }}
                >
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
                            {showPrices && (
                                <p className="mt-4 text-lg font-bold text-indigo-700">
                                    {currencyFormatter.format(selectedProduct.price)}
                                </p>
                            )}
                            <button
                                type="button"
                                onClick={() => {
                                    atualizarCarrinho(
                                        selectedProduct.id,
                                        (cart[selectedProduct.id] || 0) + 1,
                                    )
                                    setSelectedProduct(null)
                                }}
                                className="mt-4 flex w-full items-center justify-center rounded-lg bg-indigo-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                            >
                                Adicionar ao carrinho
                            </button>
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
        </div>
    )
}
