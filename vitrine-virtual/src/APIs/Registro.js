export default async function Registro({ formData }) {
    const res = await fetch(`${import.meta.env.VITE_URL_SITE}/register`, {
        method: "POST",
        credentials: "include",
        body: formData,
    })

    const data = await res.json()

    if (!res.ok) {
        throw new Error(data?.response || "Não foi possível criar a conta.")
    }

    return data
}