async function request(url, options = {}) {

    const res = await fetch(`${process.env.API_BASE}${url}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        },
        credentials: "include",
        ...options
    })

    // Handle if non-ok response
    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Request failed");
    }

    // Handle empty responses (204)
    if (res.status === 204) return null;

    return res.json();
}

export default request;
