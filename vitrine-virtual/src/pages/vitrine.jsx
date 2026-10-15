import { useState } from "react"
import { VscAccount, VscCallOutgoing } from "react-icons/vsc"
import { useAutenticacao } from "../components/auth-context.js"
import { PRODUCTS_STORAGE_KEY } from "../constants/storage-keys.js"
import useEstadoNoArmazenamentoLocal from "../hooks/use-local-storage-state.js"

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
})

// Garante que os produtos salvos tenham os campos usados pela vitrine.
function validarListaDeProdutos(value) {
    return (
        Array.isArray(value) &&
        value.every(
            (product) =>
                product !== null &&
                typeof product === "object" &&
                typeof product.id === "string" &&
                typeof product.name === "string" &&
                typeof product.description === "string" &&
                typeof product.image === "string" &&
                (product.category === undefined ||
                    typeof product.category === "string") &&
                Number.isFinite(product.price),
        )
    )
}

// Monta o link do WhatsApp com o resumo e o valor total do carrinho.
function criarLinkDoWhatsApp(phoneNumber, cartItems, total, businessName) {
    const phone = String(phoneNumber || "").replace(/\D/g, "")
    const items = cartItems
        .map(
            ({ product, quantity }) =>
                `- ${product.name} (${quantity}x ${currencyFormatter.format(product.price)}): ${currencyFormatter.format(product.price * quantity)}`,
        )
        .join("\n")
    const message = `Olá! Gostaria de fazer este pedido${businessName ? ` na ${businessName}` : ""}:\n\n${items}\n\nTotal: ${currencyFormatter.format(total)}`
    const recipient = phone ? `/${phone}` : ""

    return `https://wa.me${recipient}?text=${encodeURIComponent(message)}`
}

// Apresenta os produtos, filtros por categoria e carrinho de compras.
export default function Vitrine() {
    const { user } = useAutenticacao()
    const [products, , productsStorageError] = useEstadoNoArmazenamentoLocal(
        PRODUCTS_STORAGE_KEY,
        [],
        validarListaDeProdutos,
    )
    const profile = {
        businessName: user?.nome_loja || "",
        image: user?.foto_loja || "",
        whatsappNumber: user?.contato || "",
    }
    const [cart, setCart] = useState({})
    const [isCartExpanded, setIsCartExpanded] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState("")
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
        (total, { product, quantity }) => total + product.price * quantity,
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
        <div className="min-h-screen bg-slate-100">
            <header className="bg-blue-700 px-6 py-4 text-center text-white shadow-md">
                <div className="mx-auto flex max-w-6xl flex-col items-center">
                    {profile.image ? (
                        <img
                            src={profile.image}
                            alt={`Foto de ${profile.businessName || "seu comércio"}`}
                            className="h-24 w-24 rounded-full object-cover ring-4 ring-white/30"
                        />
                    ) : (
                        <div className="mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-white/15 text-white">
                            <VscAccount aria-hidden="true" className="text-5xl" />
                        </div>
                    )}
                    <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
                        {profile.businessName || "Nossos produtos"}
                    </h1>
                    <p className="mt-2 text-blue-100">
                        Confira nossos produtos e fale com a loja pelo WhatsApp.
                    </p>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-4 py-6 pb-80 sm:px-6 sm:py-8 sm:pb-80">
                {productsStorageError && (
                    <p role="alert" className="mb-6 rounded-lg bg-amber-50 p-4 text-amber-900">
                        {productsStorageError} A vitrine pode não mostrar os dados atualizados.
                    </p>
                )}
                {!profile.whatsappNumber && (
                    <p className="mb-6 rounded-lg bg-blue-50 p-4 text-center text-sm text-blue-900">
                        O WhatsApp da loja ainda não foi configurado. O botão abrirá o
                        WhatsApp para você escolher um contato.
                    </p>
                )}
                {products.length > 0 && (
                    <div className="mb-6 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
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
                            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 sm:max-w-sm"
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
                <section
                    aria-label="Carrinho de compras"
                    className={`fixed inset-x-3 bottom-3 z-40 mx-auto flex w-auto max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 transition-[max-height] duration-200 sm:inset-x-auto sm:right-6 sm:mx-0 sm:w-96 ${
                        isCartExpanded ? "max-h-[75vh]" : "h-[76px]"
                    }`}
                >
                    <button
                        type="button"
                        aria-expanded={isCartExpanded}
                        aria-controls="cart-content"
                        onClick={() => setIsCartExpanded((expanded) => !expanded)}
                        className="flex min-h-[76px] w-full shrink-0 items-center justify-between gap-2 px-4 text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:px-5"
                    >
                        <span className="min-w-0 truncate text-sm font-semibold text-slate-900 sm:text-base">
                            Carrinho · {cartQuantity} {cartQuantity === 1 ? "item" : "itens"}
                        </span>
                        <span className="shrink-0 text-sm font-bold text-blue-700 sm:text-base">
                            {currencyFormatter.format(cartTotal)}
                        </span>
                        <span className="sr-only">
                            {isCartExpanded ? "Recolher carrinho" : "Expandir carrinho"}
                        </span>
                    </button>
                    {isCartExpanded && (
                        <div
                            id="cart-content"
                            className="flex min-h-0 flex-col border-t border-slate-200"
                        >
                            {cartItems.length === 0 ? (
                                <p className="p-4 text-sm text-slate-500 sm:px-5">
                                    Adicione produtos para montar seu pedido.
                                </p>
                            ) : (
                                <>
                                    <ul className="min-h-0 flex-1 divide-y divide-slate-200 overflow-y-auto px-4 sm:px-5">
                                        {cartItems.map(({ product, quantity }) => (
                                            <li
                                                key={product.id}
                                                className="flex min-w-0 flex-col gap-2 py-3"
                                            >
                                                <div className="flex min-w-0 items-start justify-between gap-2">
                                                    <p className="min-w-0 break-words font-medium text-slate-900">
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
                                                    <div className="flex items-center gap-2">
                                                        <label
                                                            htmlFor={`quantity-${product.id}`}
                                                            className="text-xs text-slate-600 sm:text-sm"
                                                        >
                                                            Qtd.
                                                        </label>
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
                                                            className="w-16 rounded-lg border border-slate-300 px-2 py-1.5 text-center text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                                                        />
                                                    </div>
                                                    <div className="min-w-0 text-right">
                                                        <p className="truncate text-xs text-slate-500">
                                                            {currencyFormatter.format(product.price)}{" "}
                                                            cada
                                                        </p>
                                                        <p className="font-semibold text-slate-900">
                                                            {currencyFormatter.format(
                                                                product.price * quantity,
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                    <a
                                        href={criarLinkDoWhatsApp(
                                            profile.whatsappNumber || "",
                                            cartItems,
                                            cartTotal,
                                            profile.businessName,
                                        )}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="m-4 mt-2 flex shrink-0 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 sm:mx-5 sm:mb-5"
                                    >
                                        <VscCallOutgoing aria-hidden="true" />
                                        Finalizar pedido pelo WhatsApp
                                    </a>
                                </>
                            )}
                        </div>
                    )}
                </section>
                {products.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                        <h2 className="text-xl font-semibold text-slate-800">
                            Nenhum produto disponível
                        </h2>
                        <p className="mt-2 text-slate-500">
                            Volte mais tarde para conferir as novidades.
                        </p>
                    </div>
                ) : visibleProducts.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                        <h2 className="text-xl font-semibold text-slate-800">
                            Nenhum produto nesta categoria
                        </h2>
                        <p className="mt-2 text-slate-500">
                            Escolha outra categoria para ver mais produtos.
                        </p>
                    </div>
                ) : (
                    <section
                        aria-label="Produtos da loja"
                        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                    >
                        {visibleProducts.map((product) => (
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
                                    <button
                                        type="button"
                                        onClick={() =>
                                            atualizarCarrinho(
                                                product.id,
                                                (cart[product.id] || 0) + 1,
                                            )
                                        }
                                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                                    >
                                        Adicionar ao carrinho
                                    </button>
                                </div>
                            </article>
                        ))}
                    </section>
                )}
            </main>
        </div>
    )
}
