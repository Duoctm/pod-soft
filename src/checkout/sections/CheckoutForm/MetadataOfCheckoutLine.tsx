"use server";
import { GraphQLClient, gql } from 'graphql-request';

const endpoint = process.env.NEXT_PUBLIC_SALEOR_API_URL as string;

const GET_CHECKOUT_METADATA = gql`
  query CheckoutMetadata($id: ID!) {
    checkout(id: $id) {
      lines {
        id
        metadata {
          value
        }
      }
    }
  }
`;

interface CheckoutLineMetadata {
    id: string;
    metadata: {
        value: string;
    }[];
}

interface CheckoutData {
    checkout: {
        lines: CheckoutLineMetadata[];
    };
}

const fetchCheckoutLineMetadata = async (checkoutId: string, checkoutLineId: string) => {
    try {
        const client = new GraphQLClient(endpoint);

        const rawData = await client.request<CheckoutData>(GET_CHECKOUT_METADATA, {
            id: checkoutId,
        });

        const checkoutLine = rawData.checkout.lines.find(line => line.id === checkoutLineId);

        if (checkoutLine && checkoutLine.metadata && checkoutLine.metadata.length > 0) {
            const metadata = checkoutLine.metadata[0].value;
            return metadata ? JSON.parse(metadata) : null;
        }

    } catch (error) {
        console.error('Error fetching checkout line metadata:', error);
    }

    return [];
};

export { fetchCheckoutLineMetadata };