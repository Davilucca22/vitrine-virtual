export const getauthHeaders = (extraHeaders = {}) => ({
    credentials: "include",
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...extraHeaders,
    }
});

export const logout = async () => {
    await fetch(`${import.meta.env.VITE_URL_SITE}/logout`, {
        method: "POST",
        credentials: "include",
    });
};