import { atom, selector } from "recoil"
export interface User {
    id: string;
    name?: string | null;
    email?: string;
    provider?: string;
    rating?: number;
    createdAt?: string;
    lastLogin?: string | null;
    token?: string;
}
export const BACKEND_URL = 'http://localhost:3000'
export const userAtom = atom<User | null>({
    key: 'user',
    default: selector({
        key: "user/default",
        get: async () => {
            try {
                const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    return {
                        id: data.id,
                        name: data.name,
                        email: data.email,
                        provider: data.provider,
                        rating: data.rating,
                        createdAt: data.createdAt,
                        lastLogin: data.lastLogin,
                        token: data.token,
                    };
                }
            } catch (e) {
                console.error(e);
            }
            return null;
        }
    })
})
