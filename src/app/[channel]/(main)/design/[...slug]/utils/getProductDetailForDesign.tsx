"use server"

import { GetProductDetailForDesignDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";

export const fetchRawProductDetail = async (productId: string) => {
    const rawData = await executeGraphQL(GetProductDetailForDesignDocument, { variables: { channel: 'default-channel', id: productId } });
    return rawData;
}