"use server";
import { CheckoutDeliveryMethodUpdateDocument, type CheckoutDeliveryMethodUpdateMutation, type CheckoutDeliveryMethodUpdateMutationVariables } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";

interface DeliveryMethodUpdateParams {
    id: string;
    deliveryMethodId: string;
}

export const updateDeliveryMethod = async ({ id, deliveryMethodId }: DeliveryMethodUpdateParams): Promise<CheckoutDeliveryMethodUpdateMutation> => {
    try {
        const data = await executeGraphQL<CheckoutDeliveryMethodUpdateMutation, CheckoutDeliveryMethodUpdateMutationVariables>(
            CheckoutDeliveryMethodUpdateDocument,
            {
                variables: { id, deliveryMethodId },
            }
        );

        return data;
    } catch (error) {
        console.error('Error updating delivery method:', error);
        throw error;
    }
};