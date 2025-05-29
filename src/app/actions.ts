"use server";

import { cookies } from 'next/headers'
import { getServerAuthClient } from "@/app/config";
import { setItem, getItem, removeItem } from './StorageRepository';
import { checkTokenExpiringSoon } from "./checkTokenExpiringSoon";
export async function logout() {
	"use server";
	getServerAuthClient().signOut();
	const clean = await cookies();
	clean.delete("checkoutId-default-channel")


}


export async function SetItemToServerCookie(key: string, value: string) {
	await setItem(key, value);
}

export async function GetItemToServerCookie(key: string) {
	const value = await getItem(key);
	return value;
}

export async function DeleteItemToServerCookie(key: string) {
	await removeItem(key);
}

export async function checkTokenServerAction() {
	await checkTokenExpiringSoon();
}