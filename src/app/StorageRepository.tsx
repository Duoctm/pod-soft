"use server";

import { cookies } from "next/headers";

export async function getItem(key: string): Promise<string | null> {
    const cookie = cookies().get(key);
    return cookie?.value ?? null;
}

export async function setItem(key: string, value: string): Promise<void> {
    cookies().set({
        name: key,
        value,
        // path: "/",
        httpOnly: true
        // secure: process.env.NODE_ENV === "production",
        // sameSite: "lax",
        // maxAge: 60 * 60 * 24 * 30, // 30 days
    });
}

export async function removeItem(key: string): Promise<void> {
    cookies().delete(key);
}
