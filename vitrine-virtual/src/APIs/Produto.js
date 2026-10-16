const endpoint = `${import.meta.env.VITE_URL_SITE}/produto`

async function requisitarProduto(path = "", options = {}) {
    const response = await fetch(`${endpoint}${path}`, {
        credentials: "include",
        ...options,
    })
    const data = await response.json()

    if (!response.ok) {
        throw new Error(data?.response || "Não foi possível acessar os produtos.")
    }

    return data
}

function normalizarProduto(product) {
    const id = product?.id ?? product?.ID
    const name = product?.nome_produto ?? product?.NOME_PRODUTO
    const description = product?.descricao ?? product?.DESCRICAO
    const category = product?.categoria ?? product?.CATEGORIA
    const price = Number(product?.valor ?? product?.VALOR)
    const image = product?.foto_produto ?? product?.FOTO_PRODUTO

    if (
        id === undefined ||
        typeof name !== "string" ||
        typeof description !== "string" ||
        typeof category !== "string" ||
        !Number.isFinite(price) ||
        (image !== null && image !== undefined && typeof image !== "string")
    ) {
        throw new Error("O servidor retornou um produto em formato inválido.")
    }

    return {
        id: String(id),
        name,
        description,
        category,
        price,
        image: image || "",
    }
}

function criarFormulario(product, imageFile, id) {
    const formData = new FormData()
    if (id !== undefined) formData.append("id", id)
    formData.append("nome_produto", product.name.trim())
    formData.append("categoria", product.category.trim())
    formData.append("descricao", product.description.trim())
    formData.append("valor", String(product.price))
    if (imageFile) formData.append("foto", imageFile)
    return formData
}

export async function listarProdutos(idLoja) {
    if (idLoja === undefined || idLoja === null || !String(idLoja).trim()) {
        throw new Error("Informe o identificador da loja para carregar os produtos.")
    }

    const query = new URLSearchParams({ id_loja: String(idLoja) })
    const data = await requisitarProduto(`?${query}`)
    if (!Array.isArray(data?.response)) {
        throw new Error("O servidor retornou uma lista de produtos inválida.")
    }

    const whatsappNumber =
        data.response[0]?.contato ?? data.response[0]?.CONTATO ?? ""
    const storeName =
        data.response[0]?.nome_loja ?? data.response[0]?.NOME_LOJA ?? ""
    const storeImage =
        data.response[0]?.foto_loja ?? data.response[0]?.FOTO_LOJA ?? ""
    if (whatsappNumber !== "" && typeof whatsappNumber !== "string") {
        throw new Error("O servidor retornou um contato de WhatsApp inválido.")
    }
    if (typeof storeName !== "string" || typeof storeImage !== "string") {
        throw new Error("O servidor retornou dados da loja inválidos.")
    }

    return {
        products: data.response.map(normalizarProduto),
        whatsappNumber,
        storeName,
        storeImage,
    }
}

export async function criarProduto(product, imageFile) {
    const data = await requisitarProduto("", {
        method: "POST",
        body: criarFormulario(product, imageFile),
    })
    const createdProduct = Array.isArray(data?.response) ? data.response[0] : null
    if (!createdProduct) {
        throw new Error("O servidor não retornou o produto criado.")
    }

    return normalizarProduto(createdProduct)
}

export async function atualizarProduto(id, product, imageFile) {
    const data = await requisitarProduto("", {
        method: "PUT",
        body: criarFormulario(product, imageFile, id),
    })
    const updatedProduct = Array.isArray(data?.response) ? data.response[0] : null
    if (!updatedProduct) {
        throw new Error("O servidor não retornou o produto atualizado.")
    }

    return normalizarProduto(updatedProduct)
}

export async function excluirProduto(id) {
    const query = new URLSearchParams({ id_produto: id })
    await requisitarProduto(`?${query}`, { method: "DELETE" })
}
