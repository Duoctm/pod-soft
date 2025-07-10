"use server";

import { type SupportFormData } from "../SupportPage";
import { SupportCreateDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";

export async function createSupport(input: SupportFormData) {
	try {
		const { createSupport } = await executeGraphQL(SupportCreateDocument, {
			variables: {
				input: {
					...input,
				},
			},
		});
		return createSupport;
	} catch (error) {
		throw error;
	}
}
