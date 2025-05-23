"use server"
import { UploadFileDocument } from "@/gql/graphql";

const uploadPdf = async (data: FormData) => {
    const file = data.get('file') as File;

    const operations = JSON.stringify({
        query: UploadFileDocument,
        variables: { file: null },
    });

    const map = JSON.stringify({ "0": ["variables.file"] });

    const formData = new FormData();
    formData.append("operations", operations);
    formData.append("map", map);
    formData.append("0", file, file.name);

    const res = await fetch(process.env.NEXT_PUBLIC_SALEOR_API_URL!, {
        method: "POST",
        body: formData,
    });

    //const json = await res.json();
    const json = await res.json() as { data?: { uploadFile?: { message: string, result: boolean, file: { cloudinary_url: string } } } };
    return json.data?.uploadFile;
}

export { uploadPdf };