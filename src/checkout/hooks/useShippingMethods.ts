'use server'
import { executeGraphQL } from "@/lib/graphql";
import { ShippingMethodListQuery, ShippingMethodListQueryVariables, CountryCode, ShippingMethodListDocument } from "@/gql/graphql";


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