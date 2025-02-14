import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Simple rate limiting
const RATE_LIMIT_DURATION = 60 * 1000; // 1 minute
const MAX_UPLOADS_PER_MINUTE = 5;
const uploadCounts = new Map<string, { count: number; timestamp: number }>();

export async function POST(request: Request): Promise<NextResponse> {
  // Get IP address for rate limiting
  const ip = headers().get('x-forwarded-for') || 'unknown';
  
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

  const body = await request.json() as HandleUploadBody;

  try {
    // Validate file size before upload
    const contentLength = parseInt(headers().get('content-length') || '0');
    if (contentLength > 10 * 1024 * 1024) { // 10MB limit
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 413 }
      );
    }

    const jsonResponse = await handleUpload({
      body,
      request,
      token: process.env.BLOB_READ_WRITE_TOKEN,
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