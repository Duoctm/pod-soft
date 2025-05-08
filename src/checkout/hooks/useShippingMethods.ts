'use server'
import { executeGraphQL } from "@/lib/graphql";
import { type ShippingMethodListQuery, type ShippingMethodListQueryVariables, type CountryCode, ShippingMethodListDocument } from "@/gql/graphql";


type ShippingMethodListOptions = {
    slug: string;
    countries: Array<CountryCode>;
};

export const useShippingMethodList = async ({ slug, countries }: ShippingMethodListOptions) => {
    'use server'
    const { channel } = await executeGraphQL<ShippingMethodListQuery, ShippingMethodListQueryVariables>(ShippingMethodListDocument, {
        variables: {
            slug,
            countries
        }
    });
    return channel?.availableShippingMethodsPerCountry?.[0] || null;
}