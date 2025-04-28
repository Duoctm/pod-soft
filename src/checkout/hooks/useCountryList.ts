"use server";
import { executeGraphQL } from "@/lib/graphql";
import { CountryListDocument, type CountryListQueryVariables, type CountryListQuery } from "@/gql/graphql";

export interface Country {
    __typename?: "CountryDisplay";
    code: string;
    name: string;
}

export interface CountryList {
    countries: Country[];
}

export interface UseCountryListOptions {
    slug: string;
}

export const getCountryList = async ({ slug }: UseCountryListOptions) => {
    "use server";
    const { channel } = await executeGraphQL<CountryListQuery, CountryListQueryVariables>(CountryListDocument, {
        cache: "no-cache",
        variables: { slug } as CountryListQueryVariables,
    });
    return channel?.countries ?? [];
};
