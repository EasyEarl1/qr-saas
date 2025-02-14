import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    // Log environment check
    console.log('Environment check:', {
      hasToken: !!process.env.BLOB_READ_WRITE_TOKEN,
      nodeEnv: process.env.NODE_ENV
    });

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.log('No file received');
      return NextResponse.json(
        { error: 'No file received' },
        { status: 400 }
      );
    }

    // Log file details
    console.log('File details:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.log('Token missing in environment');
      return NextResponse.json(
        { error: 'Storage configuration missing' },
        { status: 500 }
      );
    }

    // Attempt blob upload
    try {
      const blob = await put(file.name, file, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
        addRandomSuffix: true // Add this to prevent name collisions
      });
      
      console.log('Upload successful:', blob.url);
      return NextResponse.json(blob);
    } catch (uploadError) {
      console.error('Blob upload error:', uploadError);
      throw uploadError; // Re-throw to be caught by outer try-catch
    }

  } catch (error) {
    // Detailed error logging
    console.error('Upload error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: error instanceof Error ? error.constructor.name : typeof error
    });

    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Upload failed',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false, // Disable body parsing, we'll use formData
  },
}; 