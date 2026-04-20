export const AUTH_TOKEN_KEY = "auth_token";

export const setAuthToken = (token: string) => {
    if (typeof window === "undefined") {
        return;
    }
    localStorage.setItem(AUTH_TOKEN_KEY, token);
};

export const clearAuthToken = () => {
    if (typeof window === "undefined") {
        return;
    }
    localStorage.removeItem(AUTH_TOKEN_KEY);
};

const hydrateTokenFromUrl = () => {
    if (typeof window === "undefined") {
        return null;
    }
    const url = new URL(window.location.href);
    const tokenFromQuery = url.searchParams.get("token");
    if (!tokenFromQuery) {
        return null;
    }
    setAuthToken(tokenFromQuery);
    url.searchParams.delete("token");
    window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
    return tokenFromQuery;
};

export const getAuthToken = () => {
    if (typeof window === "undefined") {
        return null;
    }
    const tokenFromUrl = hydrateTokenFromUrl();
    if (tokenFromUrl) {
        return tokenFromUrl;
    }
    return localStorage.getItem(AUTH_TOKEN_KEY);
};
