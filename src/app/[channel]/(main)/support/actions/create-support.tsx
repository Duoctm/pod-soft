"use server";

import { SupportCreateDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";
import { SupportFormData } from "../page";

export async function createSupport(input: SupportFormData) {
	try {
		const {createSupport} = await executeGraphQL(SupportCreateDocument, {
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
