
import { GetItemToServerCookie } from '../app/actions';

export async function fetchWithOptionalAuth(
    url: string,
    input: RequestInit,
    withAuth: boolean = true
): Promise<Response> {
    if (withAuth) {
        const accessToken = `${url}+saleor_auth_access_token`;
        const token = await GetItemToServerCookie(accessToken);

        if (!token) {
            throw new Error("Missing access token in cookies");
        }

        input.headers = {
            ...input.headers,
            Authorization: `Bearer ${token}`,
        };
    }

    return fetch(url, input);
}
