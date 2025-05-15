import { gql, GraphQLClient } from "graphql-request";
import { fetchRawProductDetail } from './getProductDetailForDesign'


const UPDATE_META_DATA = gql`
  mutation UpdateCheckoutLineMetadata($id: ID!, $input: [MetadataInput!]!) {
    updateMetadata(id: $id, input: $input) {
      item {
        metadata {
          key
          value
        }
      }
      errors {
        field
        message
        code
      }
    }
  }
`;


interface MetadataError {
  field: string | null;
  code: string;
  message: string;
}

interface MetadataItem {
  key: string;
  value: string;
}

interface UpdateMetadataResponse {
  updateMetadata: {
    item: {
      metadata: MetadataItem[];
    };
    errors: MetadataError[];
  };
}


const fetchProductDetail = async (productId: string) => {
  const listColorVariant = new Map<string, object>();

  try {

    const rawData = await fetchRawProductDetail(productId);

    // Kiểm tra xem rawData có phải là một object và có trường 'product'
    if (rawData && typeof rawData === 'object' && 'product' in rawData) {
      const product = (rawData as { product: { variants: any[] } }).product;

      const variants = product.variants;
      for (const variant of variants) {
        const metaData = variant.metadata?.find((item: any) => item.key === "custom_json");

        if (metaData != null) {
          const colorValue = variant.attributes?.[0]?.values?.[0]?.name.split("-")[1] || '';
          if (variant.attributes?.[0]?.values?.[0]?.id && !listColorVariant.has(variant.attributes[0].values[0].id)) {
            listColorVariant.set(variant.attributes[0].values[0].id, {
              variant_id: variant.id,
              color_name: variant.attributes[0].values[0].name,
              color_value: colorValue,
              meta_data: metaData,
            });
          }
        }
      }
    } else {
      console.error("Dữ liệu không hợp lệ: không tìm thấy trường 'product'");
    }
  } catch (error) {
    console.log("Lỗi khi truy vấn dữ liệu:", error);
  }

  return listColorVariant;
}


async function updateCheckoutLineMetadata(id: string, metadata: { key: string; value: string }[]) {
  const endpoint = process.env.NEXT_PUBLIC_SALEOR_API_URL as string;

  // Khởi tạo client của GraphQL
  const client = new GraphQLClient(endpoint);

  try {
    // Gửi mutation và nhận kết quả
    const response = await client.request<UpdateMetadataResponse>(UPDATE_META_DATA, {
      id,
      input: metadata,
    });

    // Kiểm tra có lỗi trong metadata không
    if (response.updateMetadata.errors?.length > 0) {
      console.error('Metadata update errors:', response.updateMetadata.errors);
      throw new Error('Metadata update failed');
    }

    // Trả về metadata đã được cập nhật
    return response.updateMetadata.item.metadata;
  } catch (error) {
    console.error('Error updating metadata:', error);
    throw error;
  }
}


export { fetchProductDetail, updateCheckoutLineMetadata }