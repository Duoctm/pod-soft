'use server'
import { executeGraphQL } from "@/lib/graphql";
import { CountryListDocument, CountryListQueryVariables } from "@/gql/graphql";

export interface Country {
    __typename?: "CountryDisplay";
    code: string;
    name: string;
}

export interface CountryList {
    countries: Country[];
}

interface UseCountryListOptions {
    slug: string;
}

export const useCountryList = async ({ slug }: UseCountryListOptions) => {
    'use server'
    const { channel } = await executeGraphQL(CountryListDocument, { cache: "no-cache", variables: { slug } as CountryListQueryVariables });
    return channel?.countries ?? [];
}