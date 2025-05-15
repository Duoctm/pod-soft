"use server";
import { GraphQLClient, gql } from 'graphql-request';

// Endpoint từ biến môi trường
const endpoint = process.env.NEXT_PUBLIC_SALEOR_API_URL as string;

// GraphQL query để lấy metadata của checkout line
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

// Interface cho metadata trả về từ GraphQL
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

// Hàm lấy metadata của checkout line
const fetchCheckoutLineMetadata = async (checkoutId: string, checkoutLineId: string) => {
  try {
    const client = new GraphQLClient(endpoint);

    // Gửi yêu cầu và nhận dữ liệu
    const rawData = await client.request<CheckoutData>(GET_CHECKOUT_METADATA, {
      id: checkoutId,
    });

    // Lọc ra metadata của checkout line theo ID
    const checkoutLine = rawData.checkout.lines.find(line => line.id === checkoutLineId);

    // Nếu tìm thấy line, parse metadata, nếu không trả về null
    if (checkoutLine && checkoutLine.metadata && checkoutLine.metadata.length > 0) {
      const metadata = checkoutLine.metadata[0].value;
      return metadata ? JSON.parse(metadata) : null;
    }

  } catch (error) {
    console.error('Error fetching checkout line metadata:', error);
  }

  // Trả về mảng rỗng nếu không tìm thấy metadata hoặc có lỗi
  return [];
};

export { fetchCheckoutLineMetadata };