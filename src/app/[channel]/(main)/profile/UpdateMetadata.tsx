import { gql, GraphQLClient } from "graphql-request";

const UPDATE_META_DATA = gql`
  mutation UpdateUserMetadata($id: ID!, $input: [MetadataInput!]!) {
    updateMetadata(id: $id, input: $input) {
        item {
        metadata {
            key
            value
        }
        }
        errors {
        field
        message
        codea
        }
    }
    }
`;


interface MetadataError {
    field: string | null;
    code: string;
    message: string;
}

interface MetadataItem {
    key: string;
    value: string;
}

interface UpdateMetadataResponse {
    updateMetadata: {
        item: {
            metadata: MetadataItem[];
        };
        errors: MetadataError[];
    };
}


async function updateUserMetadata(id: string, metadata: { key: string; value: any }[]) {
    const endpoint = process.env.NEXT_PUBLIC_SALEOR_API_URL as string;

    const client = new GraphQLClient(endpoint);

    try {
        const response = await client.request<UpdateMetadataResponse>(UPDATE_META_DATA, {
            id,
            input: metadata,
        });

        if (response.updateMetadata.errors?.length > 0) {
            console.error('Metadata update errors:', response.updateMetadata.errors);
            throw new Error('Metadata update failed');
        }

        return response.updateMetadata.item.metadata;
    } catch (error) {
        console.error('Error updating metadata:', error);
        throw error;
    }
}


export { updateUserMetadata }