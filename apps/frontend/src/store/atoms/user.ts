import { atom, selector } from "recoil"
import { api } from "../../lib/api";
import { getAuthToken, setAuthToken } from "../../lib/auth";
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

export const userAtom = atom<User | null>({
    key: 'user',
    default: selector({
        key: "user/default",
        get: async () => {
            try {
                const token = getAuthToken();
                if (!token) {
                    return null;
                }
                const response = await api.get("/auth/refresh");
                if (response.status === 200) {
                    const data = response.data;
                    if (data.token) {
                        setAuthToken(data.token);
                    }
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
