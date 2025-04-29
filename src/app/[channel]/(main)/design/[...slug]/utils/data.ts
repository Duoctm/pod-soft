import { request, gql } from "graphql-request";
import { PrintFaceData } from "./type";

const endpoint = process.env.NEXT_PUBLIC_SALEOR_API_URL as unknown as string;

const GET_PRODUCT_DETAIL = gql`
  query GetProductDetails($id: ID!, $channel: String!) {
  product(id: $id, channel: $channel) {
    id
    name
    variants {
      id
      name
      sku
      attributes {
        attribute {
          id
          name
          slug
        }
        values {
          id
          name
          slug
          value
        }
      }
      metadata {
        key
        value
      }
    }
  }
}
`;


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


`

// const GET_PRODUCT_VARIANT = gql`
//   query GetProductVariantById($id: ID!, $channel: String!) {
//     productVariant(id: $id, channel: $channel) {
//       id
//       name
//       sku
//       metadata {
//         key
//         value
//       }
//     }
//   }
// `;

const UPLOAD_IMAGE = gql`
        mutation UploadFile($file: Upload!) {
          uploadFile(file: $file) {
            message
            result
            file {
              id
              name
              cloudinary_url
              file_type
              file_extension
            }
          }
        }
      `;

// const fetchProductVariantData = async () => {
  
//   const rawData = await request(endpoint, GET_PRODUCT_VARIANT, {
//     id: "UHJvZHVjdFZhcmlhbnQ6ODk3",
//     channel: "default-channel",
//   });//UHJvZHVjdFZhcmlhbnQ6NDU4MA==
 

//   const data: PrintFaceData[] = [];

//   // Kiểm tra xem productVariant có tồn tại trong rawData không
//   if (rawData?.productVariant) {
//     const metadata = rawData.productVariant.metadata;
//     const config = metadata?.find((item) => item.key === "custom_json");

//     if (config && config.value) {
//       try {
//         const correctedValue = config.value.replace(/'/g, '"');
//         const parsed = JSON.parse(correctedValue);

//         parsed.data.forEach((item) => {
//           data.push({
//             name: item.name,
//             code: item.code,
//             position: {
//               x: item.position.x,
//               y: item.position.y,
//             },
//             width: item.width,
//             height: item.height, // Sửa lỗi chính tả
//             z_index: item.ordinal,
//             image: item.image_url,
//           });
//         });
//       } catch (error) {
//         console.error("Error parsing JSON:", error);
//       }
//     }
//   }
//   return data;

// };

const fetchProductDetail = async (productId: string) => {
  const listColorVariant = new Map<string, object>();
  
  try {
    // Gửi request và nhận dữ liệu
    const rawData: unknown = await request(endpoint, GET_PRODUCT_DETAIL, {
      id: productId,
      channel: "default-channel",
    });

    // Kiểm tra xem rawData có phải là một object và có trường 'product'
    if (rawData && typeof rawData === 'object' && 'product' in rawData) {
      const product = (rawData as { product: { variants: any[] } }).product;

      const variants = product.variants;
      for (const variant of variants) {
        const metaData = variant.metadata?.find((item : any) => item.key === "custom_json");

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
    console.error("Lỗi khi truy vấn dữ liệu:", error);
  }

  return listColorVariant;
}


const getVariantIdFromColorVariant = (colorId: string, listColorVariant: Map<string, object>) => {
  const colorVariant = listColorVariant.get(colorId);

  if (colorVariant) {
    // Kiểm tra và trả về variant_id nếu colorVariant không phải là undefined
    return (colorVariant as any).variant_id;
  } else {
    // Xử lý trường hợp colorVariant không tồn tại trong Map
    console.error(`Không tìm thấy variant cho colorId: ${colorId}`);
    return null; // Hoặc trả về giá trị mặc định nếu không tìm thấy
  }
}


const getMetaDtataFromColorVariant = (colorId: string, listColorVariant: Map<string, object>) => {
  const colorVariant = listColorVariant.get(colorId);
  if (colorVariant && (colorVariant as any).meta_data) {
    const metadata = (colorVariant as any).meta_data;
    const config = metadata;
    const data: PrintFaceData[] = [];
   
    if (config && config.value) {
      try {
        const correctedValue = config.value.replace(/'/g, '"');
        const parsed = JSON.parse(correctedValue) as { data: { name: string, code: string, position: { x: number, y: number }, width: number, height: number, ordinal: number, image_url: string }[] }; // Type assertion

        parsed.data.forEach((item) => {
          data.push({
            name: item.name,
            code: item.code,
            position: {
              x: item.position.x,
              y: item.position.y,
            },
            width: item.width,
            height: item.height,
            z_index: item.ordinal,
            image: item.image_url,
          });
        });
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    }
    
    return data;
  } else {
  
    return []; // Trả về mảng rỗng nếu không tìm thấy dữ liệu
  }
}

async function uploadImage(file: File) {
  const endpoint = process.env.NEXT_PUBLIC_SALEOR_API_URL;

  const formData = new FormData();

  formData.append("operations", JSON.stringify({
    query: UPLOAD_IMAGE,
    variables: {
      file: null,
    },
  }));

  formData.append("map", JSON.stringify({
    "0": ["variables.file"]
  }));

  formData.append("0", file); // actual file

  const res = await fetch(endpoint!, {
    method: "POST",
    body: formData,
  });

  const json = await res.json() as { data: any, errors?: any[] };

  if (json.errors) {
    console.error("Upload failed", json.errors);
    throw new Error("Upload failed");
  }

  return json.data.uploadFile;
}


async function updateCheckoutLineMetadata(id: string, metadata: { key: string; value: string }[]) {
  try {
    const response = await request(endpoint, UPDATE_META_DATA, {
      id,
      input: metadata,
    });

    // Ép kiểu response thành object với kiểu đã biết
    const typedResponse = response as {
      updateMetadata: {
        metadataErrors: {
          field: string | null;
          code: string;
        }[];
        item: {
          metadata: {
            key: string;
            value: string;
          }[];
        };
      };
    };

    if (typedResponse.updateMetadata.metadataErrors?.length > 0) {
      console.error("Metadata update errors:", typedResponse.updateMetadata.metadataErrors);
      throw new Error("Metadata update failed");
    }

    return typedResponse.updateMetadata.item.metadata;
  } catch (error) {
    console.error("Error updating metadata:", error);
    throw error;
  }
}


export {fetchProductDetail, getMetaDtataFromColorVariant, getVariantIdFromColorVariant, uploadImage, updateCheckoutLineMetadata};