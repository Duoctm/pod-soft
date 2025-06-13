"use server"
//import { UploadFileDocument } from "@/gql/graphql";

const uploadImageRaw = async (data: FormData) => {
    const file = data.get('file') as File;
    console.log('file', file);

    const operations = JSON.stringify({
        query: `
            mutation UploadFile($input: FileUploadInput!) {
                uploadFile(input: $input) {
                    message
                    result
                    file {
                        file_url
                    }
                }
            }
        `,
        variables: {
            input: {
                file: null
            }
        },
    });

    const map = JSON.stringify({ "0": ["variables.input.file"] });

    const formData = new FormData();
    formData.append("operations", operations);
    formData.append("map", map);
    formData.append("0", file, file.name);

    const res = await fetch(process.env.NEXT_PUBLIC_SALEOR_API_URL!, {
        method: "POST",
        body: formData,
    });

    const json = await res.json() as { data?: { uploadFile?: { message: string, result: boolean, file: { file_url: string } } } };
    //console.log("json", json);
    return json.data?.uploadFile;
}

export { uploadImageRaw };