import { handleUpload, type HandleUploadBody, type HandleUploadOptions } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json() as HandleUploadBody;
    
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // Implement any logic needed before generating the token
        return { token: 'your-token-here' }; // Replace with actual token logic
      },
      onUploadCompleted: async (data: { blob: { url: string } }) => {
        console.log('Upload completed:', data.blob.url);
      }
    } as HandleUploadOptions);
    
    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 