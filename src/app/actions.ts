"use server";

import { getServerAuthClient } from "@/app/config";
import { cookies } from 'next/headers'
export async function logout() {
	"use server";
	getServerAuthClient().signOut();
	const clean = await cookies();
	clean.delete("checkoutId-default-channel")
	
	
}
