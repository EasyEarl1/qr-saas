import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Simple rate limiting
const RATE_LIMIT_DURATION = 60 * 1000; // 1 minute
const MAX_UPLOADS_PER_MINUTE = 5;
const uploadCounts = new Map<string, { count: number; timestamp: number }>();

export async function POST(request: Request): Promise<NextResponse> {
  // Get IP address for rate limiting
  const headersList = headers();
  const ip = headersList.get('x-forwarded-for') || 'unknown';
  
  // Check rate limit
  const now = Date.now();
  const userUploads = uploadCounts.get(ip);
  
  if (userUploads) {
    if (now - userUploads.timestamp < RATE_LIMIT_DURATION) {
      if (userUploads.count >= MAX_UPLOADS_PER_MINUTE) {
        return NextResponse.json(
          { error: 'Too many uploads. Please try again later.' },
          { status: 429 }
        );
      }
      userUploads.count++;
    } else {
      uploadCounts.set(ip, { count: 1, timestamp: now });
    }
  } else {
    uploadCounts.set(ip, { count: 1, timestamp: now });
  }

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