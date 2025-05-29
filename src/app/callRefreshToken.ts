"use server";

import { executeGraphQL } from "@/lib/graphql";
import { ExternalRefreshDocument } from "@/gql/graphql";
import { SetItemToServerCookie } from './actions';


export async function callRefreshToken(refreshTokenKey: string, refreshToken: string) {
    const result = await executeGraphQL(ExternalRefreshDocument, {
        variables: {
            pluginId: "mirumee.authentication.openidconnect",
            input: `{\"refreshToken\": \"${refreshToken}\"}`
        }
    });
    //console.log("result", result);
    const data = result.externalRefresh;
    //return data;
    const accessTokenKey = `${process.env.NEXT_PUBLIC_SALEOR_API_URL}+saleor_auth_access_token`;



    if (data && data?.token && data?.refreshToken) {
        await SetItemToServerCookie(accessTokenKey, data.token);
        await SetItemToServerCookie(refreshTokenKey, data.refreshToken);
    }
}