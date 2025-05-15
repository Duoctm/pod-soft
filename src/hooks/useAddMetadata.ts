"use server";

import { UpdateCheckoutLineMetadataDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";

interface MetadataInput {
	key: string;
	value: string;
}

interface MetadataResponse {
	success: boolean;
	metadata?: any;
	error?: {
		error: number;
		type: string;
		messages: Array<{
			field: string;
			message: string;
		}>;
	};
}

const updateCheckoutLineMetadata = async (
	id: string,
	metadata: MetadataInput[],
): Promise<MetadataResponse> => {
	try {
		const { updateMetadata } = await executeGraphQL(UpdateCheckoutLineMetadataDocument, {
			variables: {
				id,
				input: metadata,
			},
		});

		if (!updateMetadata) {
			throw new Error("Failed to update metadata");
		}

		if (updateMetadata.errors?.length > 0) {
			return {
				success: false,
				error: {
					error: 2,
					type: "Checkout",
					messages: updateMetadata.errors.map((error) => ({
						field: error.field || "",
						message: error.message || "",
					})),
				},
			};
		}

		return {
			success: true,
			metadata: updateMetadata,
		};
	} catch (error) {
		return {
			success: false,
			error: {
				error: 1,
				type: "System",
				messages: [
					{
						field: "system",
						message: error instanceof Error ? error.message : "Unknown error occurred",
					},
				],
			},
		};
	}
};

export default updateCheckoutLineMetadata;
