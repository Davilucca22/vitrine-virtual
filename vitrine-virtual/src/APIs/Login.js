export default async function Login({ email, senha }) {
    const res = await fetch(`${import.meta.env.VITE_URL_SITE}/login`, {
        method: "POST",
        credentials: "include",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            form: {
                email,
                senha,
            },
        }),
    })

    const data = await res.json()

    if (!res.ok) {
        throw new Error(data?.response || "Não foi possível entrar na conta.")
    }

    return data
}
