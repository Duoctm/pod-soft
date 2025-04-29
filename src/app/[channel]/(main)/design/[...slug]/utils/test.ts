"use server";


import { gql, GraphQLClient } from "graphql-request";

const SALEOR_API_URL = process.env.NEXT_PUBLIC_SALEOR_API_URL as string;

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

interface UploadedFile {
    id: string;
    name: string;
    cloudinary_url: string;
    file_type: string;
    file_extension: string;
  }
  
  interface UploadFileResponse {
    message: string;
    result: string;
    file: UploadedFile;
  }
  
  // Dùng cho GraphQL request
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
  



interface ProductDetail {
    product: {
      id: string;
      name: string;
      variants: {
        id: string;
        name: string;
        sku: string;
        attributes: {
          attribute: {
            id: string;
            name: string;
            slug: string;
          };
          values: {
            id: string;
            name: string;
            slug: string;
            value: string;
          }[];
        }[];
        metadata: {
          key: string;
          value: string;
        }[];
      }[];
    };
  }


  const fetchProductDetail = async (productId: string) => {
    const listColorVariant = new Map<string, object>();
    
    try {
      const client = new GraphQLClient(SALEOR_API_URL);
  
      // Gửi request và nhận dữ liệu
      const rawData = await client.request<ProductDetail>(GET_PRODUCT_DETAIL,{
        id: productId,
        channel: 'default-channel', // Có thể thay đổi channel nếu cần
      })
      
      
      
      
  
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


  async function uploadImage(file: File) {
  
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


    const client = new GraphQLClient(SALEOR_API_URL);
  
      // Gửi request và nhận dữ liệu
      const res = await client.request<UploadFileResponse>(UPLOAD_IMAGE,{
        file: file
      })
      console.log('chay vo day roi');
      
  
    // const res = await fetch(endpoint!, {
    //   method: "POST",
    //   body: formData,
    // });
  
    // const json = await res.json() as { data: any, errors?: any[] };
  
    // if (json.errors) {
    //   console.error("Upload failed", json.errors);
    //   throw new Error("Upload failed");
    // }
  
   // return json.data.uploadFile;
   return res;
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
  

  export {fetchProductDetail, uploadImage, updateCheckoutLineMetadata}