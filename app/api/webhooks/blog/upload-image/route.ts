import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

// Route segment config for Next.js App Router
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds timeout for large images
export const dynamic = 'force-dynamic'; // Disable caching

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: false, // Use virtual-hosted-style URLs
  useAccelerateEndpoint: false,
});

// Define the schema for the incoming image upload request
const imageUploadSchema = {
  imageUrl: (val: any) => typeof val === 'string' && val.startsWith('http'),
};

export async function POST(req: NextRequest) {
  try {
    console.log('=== Upload Image Request Start ===');

    // 1. Security Check
    const authHeader = req.headers.get('x-n8n-webhook-secret');
    console.log('Auth header present:', !!authHeader);

    if (authHeader !== process.env.N8N_WEBHOOK_SECRET) {
      console.error('Unauthorized: Invalid webhook secret');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentType = req.headers.get('content-type') || '';
    const originalUrl = req.headers.get('x-original-url') || '';

    console.log('Upload Image - Content-Type:', contentType);
    console.log('Upload Image - Original URL:', originalUrl);

    // 2. Handle binary upload or URL-based upload (JSON)
    let imageBuffer: Buffer;
    let filename: string;

    // Check if it's binary data (image/* or application/octet-stream)
    if (contentType.startsWith('image/') || contentType === 'application/octet-stream' || contentType.includes('multipart/form-data')) {
      try {
        let file: File | null = null;
        
        // If multipart/form-data, extract file from form
        if (contentType.includes('multipart/form-data')) {
          const formData = await req.formData();
          file = formData.get('image') as File | null;
          if (!file) {
            return NextResponse.json({ error: 'No image file in form data' }, { status: 400 });
          }
        } else {
          // Direct binary upload - convert request body to File
          const arrayBuffer = await req.arrayBuffer();
          if (arrayBuffer.byteLength === 0) {
            return NextResponse.json({ error: 'No image data provided' }, { status: 400 });
          }
          // Create a File-like object from the binary data
          const blob = new Blob([arrayBuffer], { type: contentType });
          file = blob as unknown as File;
        }

        const arrayBuffer = await file.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuffer);
        filename = file.name || originalUrl.split('/').pop()?.split('?')[0] || 'image';

        if (imageBuffer.length === 0) {
          console.error('Binary data is empty after reading file');
          return NextResponse.json({ error: 'Empty image data' }, { status: 400 });
        }

        console.log(`Received binary upload: ${filename}, size: ${imageBuffer.length} bytes`);

      } catch (binaryError) {
        console.error('Error processing binary data:', binaryError);
        console.error('Binary error stack:', binaryError instanceof Error ? binaryError.stack : 'No stack trace');
        return NextResponse.json({
          error: 'Failed to process binary data',
          details: binaryError instanceof Error ? binaryError.message : 'Unknown error'
        }, { status: 400 });
      }
    } else {
      // JSON approach (backward compatibility - URL-based upload)
      try {
        const body = await req.json();
        const { imageUrl } = body;

        console.log('JSON body received:', JSON.stringify(body));
        console.log('ImageUrl extracted:', imageUrl);

        if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
          console.error('Invalid imageUrl:', imageUrl);
          return NextResponse.json({ error: 'Invalid imageUrl' }, { status: 400 });
        }

        console.log(`Starting download from: ${imageUrl}`);

        // Download image
        const response = await fetch(imageUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; MypenBot/1.0)',
            'Accept': 'image/*',
          },
        });

        console.log(`Download response status: ${response.status}`);

        if (!response.ok) {
          console.error(`Failed to download image ${imageUrl}: ${response.status} ${response.statusText}`);
          return NextResponse.json({
            error: 'Failed to download image',
            details: `${response.status} ${response.statusText}`
          }, { status: 500 });
        }

        const arrayBuffer = await response.arrayBuffer();
        console.log(`Downloaded arrayBuffer size: ${arrayBuffer.byteLength} bytes`);

        imageBuffer = Buffer.from(arrayBuffer);
        filename = imageUrl.split('/').pop()?.split('?')[0] || 'image';
        console.log(`Downloaded image from URL: ${imageUrl}, size: ${imageBuffer.length} bytes, filename: ${filename}`);
      } catch (jsonError) {
        console.error('Error parsing JSON body:', jsonError);
        return NextResponse.json({ 
          error: 'Invalid request format',
          details: jsonError instanceof Error ? jsonError.message : 'Expected binary image data or JSON with imageUrl'
        }, { status: 400 });
      }
    }

    // 3. Validate we have imageBuffer
    if (!imageBuffer || imageBuffer.length === 0) {
      return NextResponse.json({ error: 'No image data received' }, { status: 400 });
    }

    // Use originalUrl from header, or fallback to filename
    const finalOriginalUrl = originalUrl || filename;

    // 4. Upload to S3 and optimize
    console.log(`About to process and upload image: ${filename}, size: ${imageBuffer.length} bytes`);

    const s3Url = await uploadToS3(imageBuffer, finalOriginalUrl, filename);

    if (!s3Url) {
      console.error('uploadToS3 returned null - check logs above for details');
      return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
    }

    console.log('Image uploaded successfully to S3:', s3Url);

    return NextResponse.json({
      success: true,
      originalUrl: finalOriginalUrl,
      hostedUrl: s3Url,
      fullUrl: s3Url
    });

  } catch (error) {
    console.error('=== Image Upload Error ===');
    console.error('Error:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function uploadToS3(imageBuffer: Buffer, originalUrl: string, filename: string): Promise<string | null> {
  try {
    console.log(`uploadToS3: Processing image, size: ${imageBuffer.length} bytes`);

    // Generate filename - preserve original name as much as possible
    const timestamp = Date.now();
    const cleanName = filename.split('?')[0].replace(/[^a-zA-Z0-9.-]/g, '-');
    const ext = cleanName.includes('.') ? cleanName.split('.').pop()?.toLowerCase() : 'jpg';
    const baseName = `${timestamp}-${cleanName.replace(/\.[^/.]+$/, '')}`;

    // Optimize image with Sharp
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();

    console.log(`Image metadata: ${metadata.width}x${metadata.height}, format: ${metadata.format}`);

    // Create optimized WebP version
    const optimizedBuffer = await image
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer();

    console.log(`Optimized image size: ${optimizedBuffer.length} bytes (${Math.round((optimizedBuffer.length / imageBuffer.length) * 100)}% of original)`);

    // Upload to S3
    const s3Key = `images/blog/${baseName}.webp`;
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: s3Key,
      Body: optimizedBuffer,
      ContentType: 'image/webp',
      CacheControl: 'public, max-age=31536000', // Cache for 1 year
    });

    await s3Client.send(uploadCommand);
    console.log(`Uploaded to S3: ${s3Key}`);

    // Return public S3 URL
    const s3Url = `${process.env.AWS_S3_BASE_URL}/${s3Key}`;
    return s3Url;

  } catch (error) {
    console.error(`Error uploading to S3:`, error);
    return null;
  }
}
