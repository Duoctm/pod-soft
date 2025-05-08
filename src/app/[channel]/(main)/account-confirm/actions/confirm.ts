import { ConfirmAccountDocument } from "@/gql/graphql"
import { executeGraphQL } from "@/lib/graphql"

export async function confirmAccountOnServer(email: string, token: string) {
	try {
		const {confirmAccount} = await executeGraphQL(ConfirmAccountDocument, {
			variables: {
				email: email,
				token: token
			}
		})
	 return confirmAccount


	} catch (error) {
		throw error
	}
}