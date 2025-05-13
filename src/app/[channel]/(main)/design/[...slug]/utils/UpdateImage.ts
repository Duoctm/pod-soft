//import { executeGraphQL } from '@/lib/graphql'
import { gql, GraphQLClient } from "graphql-request";

const SALEOR_API_URL = process.env.NEXT_PUBLIC_SALEOR_API_URL as string;

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

async function uploadImage(data: FormData) {
    const file = data.get("file");
    console.log('iiiiiiiiiiiiiiiiiiiiiiiiiiiiii', file)
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
    if (file != null) {
        formData.append("0", file); // actual file
    }



    const client = new GraphQLClient(SALEOR_API_URL);

    // Gửi request và nhận dữ liệu
    try {
        const res = await client.request<UploadFileResponse>(UPLOAD_IMAGE, {
            file: file
        })


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
        console.log('ressssssssssssssssssss', res);
        return res;
    }
    catch (error) {
        console.log(error);
    }
}

export default uploadImage;