import { VscAccount, VscCallOutgoing } from "react-icons/vsc"
import { PRODUCTS_STORAGE_KEY, STORE_PROFILE_STORAGE_KEY } from "../constants/storage-keys.js"
import useLocalStorageState from "../hooks/use-local-storage-state.js"

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
})

function isProductList(value) {
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
                Number.isFinite(product.price),
        )
    )
}

function isStoreProfile(value) {
    return (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        typeof value.businessName === "string" &&
        typeof value.image === "string" &&
        (value.whatsappNumber === undefined ||
            typeof value.whatsappNumber === "string")
    )
}

function createWhatsappLink(phoneNumber, productName) {
    const phone = String(phoneNumber || "").replace(/\D/g, "")
    const message = `ola estou interessado neste produto: \n${productName}`
    const recipient = phone ? `/${phone}` : ""

    return `https://wa.me${recipient}?text=${encodeURIComponent(message)}`
}

export default function Vitrine() {
    const [products, , productsStorageError] = useLocalStorageState(
        PRODUCTS_STORAGE_KEY,
        [],
        isProductList,
    )
    const [profile, , profileStorageError] = useLocalStorageState(
        STORE_PROFILE_STORAGE_KEY,
        { businessName: "", image: "", whatsappNumber: "" },
        isStoreProfile,
    )
    const storageError = productsStorageError || profileStorageError

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

            <main className="mx-auto max-w-6xl px-6 py-8">
                {storageError && (
                    <p role="alert" className="mb-6 rounded-lg bg-amber-50 p-4 text-amber-900">
                        {storageError} A vitrine pode não mostrar os dados atualizados.
                    </p>
                )}
                {!profile.whatsappNumber && (
                    <p className="mb-6 rounded-lg bg-blue-50 p-4 text-center text-sm text-blue-900">
                        O WhatsApp da loja ainda não foi configurado. O botão abrirá o
                        WhatsApp para você escolher um contato.
                    </p>
                )}
                {products.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                        <h2 className="text-xl font-semibold text-slate-800">
                            Nenhum produto disponível
                        </h2>
                        <p className="mt-2 text-slate-500">
                            Volte mais tarde para conferir as novidades.
                        </p>
                    </div>
                ) : (
                    <section
                        aria-label="Produtos da loja"
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
                                    <p className="mt-2 min-h-12 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                                        {product.description}
                                    </p>
                                    <p className="mt-4 text-lg font-bold text-blue-700">
                                        {currencyFormatter.format(product.price)}
                                    </p>
                                    <a
                                        href={createWhatsappLink(
                                            profile.whatsappNumber || "",
                                            product.name,
                                        )}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
                                    >
                                        <VscCallOutgoing aria-hidden="true" />
                                        Quero esse
                                    </a>
                                </div>
                            </article>
                        ))}
                    </section>
                )}
            </main>
        </div>
    )
}
