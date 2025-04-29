import { request, gql } from "graphql-request";

const endpoint = process.env.NEXT_PUBLIC_SALEOR_API_URL as unknown as string;

const GET_CHECKOUT_METADATA = gql`
  query CheckoutMetadata($id: ID!){
  checkout(id: $id) {
    lines {
      id
      metadata{
        value
      }
    }
  }
}

`;

const fetchCheckoutLineMetadata = async (checkoutId: string, checkoutLineId: string) => {
  try {
    const rawData = await request(endpoint, GET_CHECKOUT_METADATA, {
      id: checkoutId,
    });

    let metadata = null;
    for (const line of (rawData as any).checkout.lines) {
      if (line.id === checkoutLineId) {
        metadata = line.metadata[0]?.value;
        break;
      }
    }

    return metadata ? JSON.parse(metadata) : null;
  } catch (error) {
    console.error(error);
  }

  return [];
};



export { fetchCheckoutLineMetadata };