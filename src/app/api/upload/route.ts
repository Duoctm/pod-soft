// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { executeGraphQL } from '@/lib/graphql';
import { UploadFileDocument } from '@/gql/graphql';

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    const result = await executeGraphQL(UploadFileDocument, {
        variables: { file }
    });
    console.log('000000000000000000000000000000000000000', result);

    return NextResponse.json({ uploaded: result.uploadFile });
}
