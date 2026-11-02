const endpoint = import.meta.env.VITE_URL_SITE

async function requisitar(path, options = {}, credentials = "include") {
    const response = await fetch(`${endpoint}${path}`, {
        credentials,
        ...options,
    })
    const data = await response.json()

    if (!response.ok) {
        throw new Error(data?.response || "Não foi possível acessar os produtos.")
    }

    return data
}

function requisitarProduto(path = "", options = {}) {
    return requisitar(`/produto${path}`, options)
}

function requisitarVitrine(path = "", options = {}) {
    return requisitar(`/vitrine${path}`, options, "omit")
}

function normalizarProduto(product, productImages = []) {
    if (!Array.isArray(productImages)) {
        throw new Error("O servidor retornou fotos de produto em formato inválido.")
    }

    const id = product?.id ?? product?.ID
    const name = product?.nome_produto ?? product?.NOME_PRODUTO
    const description = product?.descricao ?? product?.DESCRICAO
    const category = product?.categoria ?? product?.CATEGORIA
    const price = Number(product?.valor ?? product?.VALOR)
    const images = productImages.map((photo) => photo?.url_foto ?? photo?.URL_FOTO)
    const legacyImage = product?.foto_produto ?? product?.FOTO_PRODUTO

    if (
        images.some((image) => typeof image !== "string") ||
        (!images.length &&
            legacyImage &&
            legacyImage !== "nada" &&
            typeof legacyImage !== "string")
    ) {
        throw new Error("O servidor retornou fotos de produto em formato inválido.")
    }

    const normalizedImages = images.length
        ? images
        : typeof legacyImage === "string" && legacyImage !== "nada"
          ? [legacyImage]
          : []

    if (
        id === undefined ||
        typeof name !== "string" ||
        typeof description !== "string" ||
        typeof category !== "string" ||
        !Number.isFinite(price)
    ) {
        throw new Error("O servidor retornou um produto em formato inválido.")
    }

    return {
        id: String(id),
        name,
        description,
        category,
        price,
        images: normalizedImages,
        image: normalizedImages[0] || "",
    }
}

function normalizarVerPrecos(value) {
    if (value === undefined || value === null) return true
    if (typeof value === "boolean") return value
    if (value === 1 || value === "1" || value === "true") return true
    if (value === 0 || value === "0" || value === "false") return false

    throw new Error("O servidor retornou uma configuração de preços inválida.")
}

function criarFormulario(product, imageFiles, id) {
    const formData = new FormData()
    if (id !== undefined) formData.append("id", id)
    formData.append("nome_produto", product.name.trim())
    formData.append("categoria", product.category.trim())
    formData.append("descricao", product.description.trim())
    formData.append("valor", String(product.price))
    const photos = Array.isArray(imageFiles)
        ? imageFiles
        : imageFiles
          ? [imageFiles]
          : []
    photos.forEach((photo) => formData.append("fotos", photo))
    return formData
}

async function listarProdutosDaRota(idLoja, requisitarDaRota) {
    if (idLoja === undefined || idLoja === null || !String(idLoja).trim()) {
        throw new Error("Informe o identificador da loja para carregar os produtos.")
    }

    const query = new URLSearchParams({ id_loja: String(idLoja) })
    const data = await requisitarDaRota(`?${query}`)
    if (!Array.isArray(data?.produtos) || !Array.isArray(data?.foto_produtos)) {
        throw new Error("O servidor retornou uma lista de produtos inválida.")
    }

    const products = data.produtos
    const productImages = data.foto_produtos
    const whatsappNumber =
        products[0]?.contato ?? products[0]?.CONTATO ?? ""
    const storeName =
        products[0]?.nome_loja ?? products[0]?.NOME_LOJA ?? ""
    const storeImage =
        products[0]?.foto_loja ?? products[0]?.FOTO_LOJA ?? ""
    const storeBanner =
        products[0]?.banner ?? products[0]?.BANNER ?? ""
    const verPrecos = normalizarVerPrecos(
        products[0]?.ver_precos ?? products[0]?.VER_PRECOS,
    )
    if (whatsappNumber !== "" && typeof whatsappNumber !== "string") {
        throw new Error("O servidor retornou um contato de WhatsApp inválido.")
    }
    if (
        typeof storeName !== "string" ||
        typeof storeImage !== "string" ||
        typeof storeBanner !== "string"
    ) {
        throw new Error("O servidor retornou dados da loja inválidos.")
    }

    const imagesByProduct = new Map()
    for (const photo of productImages) {
        const productId = photo?.id_produto ?? photo?.ID_PRODUTO
        const url = photo?.url_foto ?? photo?.URL_FOTO
        if (productId === undefined || typeof url !== "string") {
            throw new Error("O servidor retornou fotos de produto em formato inválido.")
        }

        const key = String(productId)
        const images = imagesByProduct.get(key) || []
        images.push(photo)
        imagesByProduct.set(key, images)
    }

    return {
        products: products.map((product) => {
            const productId = product?.id ?? product?.ID
            return normalizarProduto(
                product,
                imagesByProduct.get(String(productId)) || [],
            )
        }),
        whatsappNumber,
        storeName,
        storeImage,
        storeBanner,
        verPrecos,
    }
}

export function listarProdutos(idLoja) {
    return listarProdutosDaRota(idLoja, requisitarProduto)
}

export function listarProdutosDaVitrine(idLoja) {
    return listarProdutosDaRota(idLoja, requisitarVitrine)
}

export async function criarProduto(product, imageFiles) {
    const data = await requisitarProduto("", {
        method: "POST",
        body: criarFormulario(product, imageFiles),
    })
    const createdProduct = data?.produto
    if (!createdProduct) {
        throw new Error("O servidor não retornou o produto criado.")
    }

    return normalizarProduto(createdProduct, data?.fotos_produtos)
}

export async function atualizarProduto(id, product, imageFiles) {
    const data = await requisitarProduto("", {
        method: "PUT",
        body: criarFormulario(product, imageFiles, id),
    })
    const updatedProduct = data?.produto
    if (!updatedProduct) {
        throw new Error("O servidor não retornou o produto atualizado.")
    }

    return normalizarProduto(
        updatedProduct,
        data?.fotos_produto ?? data?.fotos_produtos,
    )
}

export async function excluirProduto(id) {
    const query = new URLSearchParams({ id_produto: id })
    await requisitarProduto(`?${query}`, { method: "DELETE" })
}
