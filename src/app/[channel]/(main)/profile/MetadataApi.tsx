"use server";

//import { gql, GraphQLClient } from "graphql-request";
import { GetMetadataOfMeDocument, UpdateMetadatAccountDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";



async function updateUserMetadata(metadata: { key: string; value: any }[]) {
    return executeGraphQL(UpdateMetadatAccountDocument, { variables: { metadata } });

}




async function getUserMetadata() {
    return executeGraphQL(GetMetadataOfMeDocument, {});

}





export { updateUserMetadata, getUserMetadata }