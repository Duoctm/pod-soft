"use server";

//import { gql, GraphQLClient } from "graphql-request";
import { GetMetadataOfMeDocument, UpdateMetadatAccountDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";



async function updateUserMetadata(metadata: { key: string; value: any }[]) {
    const result = await executeGraphQL(UpdateMetadatAccountDocument, { variables: { metadata } });
    console.log("testupdateMatadata", result.accountUpdate);
}




async function getUserMetadata() {
    const data = await executeGraphQL(GetMetadataOfMeDocument, {});
    console.log("testMatadata", data.me?.metadata);
}





export { updateUserMetadata, getUserMetadata }