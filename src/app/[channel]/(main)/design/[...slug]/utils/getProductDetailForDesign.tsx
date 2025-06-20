"use server"

import { GetProductDetailForDesignDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";

export const fetchRawProductDetail = async (productId: string, channel: string) => {
    const rawData = await executeGraphQL(GetProductDetailForDesignDocument, { variables: { channel: channel, id: productId } });
    return rawData;
}