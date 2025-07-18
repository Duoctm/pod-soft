/* eslint-disable import/no-cycle */
"use server"

import { GetItemToServerCookie } from "./actions";

//import { callRefreshToken } from "./callRefreshToken"

type JWTPayload = {
    exp: number;
};

export async function checkTokenExpiringSoon() {

    const accessToken = `${process.env.NEXT_PUBLIC_SALEOR_API_URL}+saleor_auth_access_token`;
    const token = await GetItemToServerCookie(accessToken);
    if (!token) return;

    try {

        const payloadBase64 = token.split('.')[1];
        if (!payloadBase64) return;

        const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');

        const payloadJson = atob(padded);
        const payload = JSON.parse(payloadJson) as JWTPayload;

        if (!payload.exp) return;


        // const currentTime = Math.floor(Date.now() / 1000);
        // const secondsLeft = payload.exp - currentTime;

        // if (secondsLeft <= 290) {
        //     const refreshTokenKey = `${process.env.NEXT_PUBLIC_SALEOR_API_URL}+saleor_auth_module_refresh_token`;
        //     const refreshToken = await GetItemToServerCookie(refreshTokenKey);
        //     await callRefreshToken(refreshTokenKey, refreshToken || "");
        // }
    } catch (error) {
        console.error("Lỗi kiểm tra token:", error);
        return false;
    }
}