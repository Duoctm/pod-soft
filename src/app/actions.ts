"use server";

import { cookies } from 'next/headers'
import { getServerAuthClient } from "@/app/config";
export async function logout() {
	"use server";
	getServerAuthClient().signOut();
	const clean = await cookies();
	clean.delete("checkoutId-default-channel")


}
