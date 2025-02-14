import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json() as HandleUploadBody;
    
    const jsonResponse = await handleUpload({
      body,
      request,
      token: process.env.BLOB_READ_WRITE_TOKEN!,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif'],
        maximumSizeInBytes: 10 * 1024 * 1024, // 10MB
      }),
    });
    
    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 