import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { z } from 'zod';
import { revalidatePath, revalidateTag } from 'next/cache';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';
import { existsSync } from 'fs';

// Define the schema for the incoming webhook data
const blogPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  // Optional fields with defaults or fallbacks
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  author: z.string().optional().default('Mypen Team'),
  featured_image: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? null : val),
    z.string().url().nullable().optional()
  ),
  published: z.boolean().optional().default(true),
  
  // Georgian fields (optional, will fallback to English if not provided)
  title_ka: z.string().optional(),
  content_ka: z.string().optional(),
  excerpt_ka: z.string().optional(),
});

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphens
    .replace(/^-+|-+$/g, '');    // Remove leading/trailing hyphens
}

async function uploadAndHostImage(imageUrl: string): Promise<string | null> {
  try {
    console.log(`uploadAndHostImage: Starting download for ${imageUrl}`);
    
    // Download image
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MypenBot/1.0)',
        'Accept': 'image/*',
      },
    });

    if (!response.ok) {
      console.error(`Failed to download image ${imageUrl}: ${response.status} ${response.statusText}`);
      return null;
    }

    const imageBuffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    if (!contentType.startsWith('image/')) {
      console.error(`URL does not point to an image: ${imageUrl}, content-type: ${contentType}`);
      return null;
    }

    console.log(`uploadAndHostImage: Successfully downloaded ${imageUrl}, size: ${imageBuffer.length} bytes, type: ${contentType}`);

    // Ensure directories exist
    const BLOG_IMAGE_DIR = join(process.cwd(), 'public', 'images', 'blog', 'content');
    const OPTIMIZED_DIR = join(process.cwd(), 'public', 'images', 'blog', 'optimized');
    
    if (!existsSync(BLOG_IMAGE_DIR)) {
      await mkdir(BLOG_IMAGE_DIR, { recursive: true });
    }
    if (!existsSync(OPTIMIZED_DIR)) {
      await mkdir(OPTIMIZED_DIR, { recursive: true });
    }

    // Generate filename
    const timestamp = Date.now();
    const urlObj = new URL(imageUrl);
    const pathname = urlObj.pathname;
    const filename = pathname.split('/').pop() || 'image';
    const cleanName = filename.split('?')[0].replace(/[^a-zA-Z0-9.-]/g, '-');
    const ext = cleanName.includes('.') ? cleanName.split('.').pop()?.toLowerCase() : 'jpg';
    const baseName = `${timestamp}-${cleanName.replace(/\.[^/.]+$/, '')}`;
    const finalFilename = `${baseName}.${ext}`;

    // Save original
    const originalPath = join(BLOG_IMAGE_DIR, finalFilename);
    await writeFile(originalPath, imageBuffer);

    // Optimize with Sharp
    try {
      const image = sharp(imageBuffer);
      const metadata = await image.metadata();
      const width = metadata.width || 1200;
      const height = metadata.height || 800;

      // Create WebP versions
      const variants = [
        { suffix: '', width: width, height: height },
        { suffix: '-thumb', width: 400, height: 225 },
        { suffix: '-medium', width: 800, height: null },
        { suffix: '-large', width: 1200, height: null },
      ];

      for (const variant of variants) {
        let processed = image.clone().resize(variant.width, variant.height || undefined, {
          fit: 'inside',
          withoutEnlargement: true,
        });
        const webpPath = join(OPTIMIZED_DIR, `${baseName}${variant.suffix}.webp`);
        await processed.webp({ quality: 85 }).toFile(webpPath);
      }

      // Create JPEG fallback
      const jpegPath = join(OPTIMIZED_DIR, `${baseName}.jpg`);
      await image.clone().jpeg({ quality: 85 }).toFile(jpegPath);
    } catch (error) {
      console.error('Error optimizing image:', error);
    }

    return `/images/blog/optimized/${baseName}.webp`;
  } catch (error) {
    console.error(`Error uploading image ${imageUrl}:`, error);
    return null;
  }
}

function extractFirstImageFromHtml(html: string): string | null {
  // Extract the first image URL from HTML
  const imageUrlRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/i;
  const match = html.match(imageUrlRegex);
  
  if (match && match[1]) {
    const url = match[1];
    // Return the URL if it's a valid image URL
    if (url && (url.startsWith('http') || url.startsWith('/'))) {
      return url;
    }
  }
  
  return null;
}

async function replaceImageUrlsInHtml(html: string): Promise<string> {
  if (!html || typeof html !== 'string') {
    console.log('replaceImageUrlsInHtml: No HTML content provided');
    return html;
  }

  // Extract all image URLs from HTML - handle both single and double quotes
  const imageUrlRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  const imageUrls = new Set<string>();
  let match;

  while ((match = imageUrlRegex.exec(html)) !== null) {
    const url = match[1];
    if (url && url.startsWith('http') && !url.includes('mypen.ge')) {
      imageUrls.add(url);
      console.log(`Found external image URL: ${url}`);
    }
  }

  if (imageUrls.size === 0) {
    console.log('replaceImageUrlsInHtml: No external images found to process');
    return html;
  }

  console.log(`replaceImageUrlsInHtml: Processing ${imageUrls.size} images`);

  // Upload and replace each image
  const urlMap = new Map<string, string>();
  
  for (const originalUrl of Array.from(imageUrls)) {
    console.log(`Attempting to download and host: ${originalUrl}`);
    try {
      const hostedUrl = await uploadAndHostImage(originalUrl);
      if (hostedUrl) {
        urlMap.set(originalUrl, hostedUrl);
        console.log(`Successfully hosted image: ${originalUrl} -> ${hostedUrl}`);
      } else {
        console.error(`Failed to host image: ${originalUrl}`);
      }
    } catch (error) {
      console.error(`Error processing image ${originalUrl}:`, error);
    }
  }

  if (urlMap.size === 0) {
    console.log('replaceImageUrlsInHtml: No images were successfully hosted');
    return html;
  }

  // Replace URLs in HTML - need to replace in img src attributes
  // Handle both lowercase 'src' and uppercase 'SRC' attributes
  let updatedHtml = html;
  for (const [originalUrl, hostedUrl] of urlMap.entries()) {
    // Replace in img src attributes (case-insensitive)
    const escapedUrl = originalUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Replace in img tags with src (lowercase)
    const imgTagRegexLower = new RegExp(`(<img[^>]+src=["'])${escapedUrl}(["'][^>]*>)`, 'gi');
    updatedHtml = updatedHtml.replace(imgTagRegexLower, `$1${hostedUrl}$2`);
    
    // Replace in img tags with SRC (uppercase)
    const imgTagRegexUpper = new RegExp(`(<img[^>]+SRC=["'])${escapedUrl}(["'][^>]*>)`, 'gi');
    updatedHtml = updatedHtml.replace(imgTagRegexUpper, `$1${hostedUrl}$2`);
    
    // Also replace standalone URLs (in case they appear outside img tags)
    updatedHtml = updatedHtml.replace(new RegExp(escapedUrl, 'g'), hostedUrl);
    
    console.log(`Replaced URL: ${originalUrl.substring(0, 50)}... -> ${hostedUrl}`);
  }

  return updatedHtml;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Security Check
    const authHeader = req.headers.get('x-n8n-webhook-secret');
    if (authHeader !== process.env.N8N_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse and Validate Body
    const body = await req.json();
    const validatedData = blogPostSchema.parse(body);

    // 3. Prepare Data - Generate unique slug with auto-numbering if exists
    let slug = validatedData.slug || generateSlug(validatedData.title);
    
    // Check if slug exists and append number if needed
    let slugExists = true;
    let attempt = 1;
    const originalSlug = slug;
    
    while (slugExists && attempt < 100) { // Max 100 attempts to prevent infinite loop
      const existingPost = await sql`
        SELECT id FROM posts WHERE slug = ${slug} LIMIT 1
      `;
      
      if (existingPost.length === 0) {
        slugExists = false;
      } else {
        attempt++;
        slug = `${originalSlug}-${attempt}`;
      }
    }
    
    // Bilingual Fallbacks
    const title_ka = validatedData.title_ka || validatedData.title;
    let content_ka = validatedData.content_ka || validatedData.content;
    let content = validatedData.content;
    const excerpt_ka = validatedData.excerpt_ka || validatedData.excerpt || '';
    const excerpt = validatedData.excerpt || '';
    
    // Replace external image URLs with hosted versions in both content and content_ka
    console.log('Starting image processing...');
    if (content && typeof content === 'string') {
      console.log(`Processing English content, length: ${content.length}`);
      try {
        content = await replaceImageUrlsInHtml(content);
        console.log(`English content processed, new length: ${content.length}`);
      } catch (error) {
        console.error('Error processing English content images:', error);
      }
    }
    if (content_ka && typeof content_ka === 'string') {
      console.log(`Processing Georgian content, length: ${content_ka.length}`);
      try {
        const originalContentKa = content_ka;
        content_ka = await replaceImageUrlsInHtml(content_ka);
        console.log(`Georgian content processed, new length: ${content_ka.length}`);
        if (originalContentKa !== content_ka) {
          console.log('Content was modified - images were replaced');
        } else {
          console.log('Content was NOT modified - no images replaced');
        }
      } catch (error) {
        console.error('Error processing Georgian content images:', error);
      }
    }
    
    // Handle featured_image: upload if external URL, convert empty string to null
    // If no featured_image provided, extract first image from content_ka (or content as fallback)
    let featuredImage = validatedData.featured_image;
    
    // If no featured_image provided, try to extract from content
    if (featuredImage === '' || featuredImage === null || featuredImage === undefined) {
      // Try content_ka first, then content as fallback
      const firstImageUrl = extractFirstImageFromHtml(content_ka || content || '');
      if (firstImageUrl) {
        featuredImage = firstImageUrl;
      } else {
        featuredImage = null;
      }
    }
    
    // Process featured_image if we have one
    if (featuredImage && typeof featuredImage === 'string') {
      // If it's an external URL, upload and host it
      if (featuredImage.startsWith('http') && !featuredImage.includes('mypen.ge')) {
        const hostedUrl = await uploadAndHostImage(featuredImage);
        featuredImage = hostedUrl || null;
      } else if (featuredImage.startsWith('/')) {
        // Already a relative path (hosted image), keep it as is
        // No need to process further
      } else {
        // Validate it's a proper URL or relative path
        try {
          if (featuredImage.startsWith('http')) {
            new URL(featuredImage);
          }
        } catch {
          featuredImage = null; // Invalid URL, set to null
        }
      }
    }

    // 4. Database Insertion
    // Using the same table structure as defined in schema.sql
    const result = await sql`
      INSERT INTO posts (
        title, title_ka, 
        slug, 
        content, content_ka, 
        excerpt, excerpt_ka, 
        author, 
        published, 
        featured_image,
        published_at
      )
      VALUES (
        ${validatedData.title}, ${title_ka},
        ${slug},
        ${content}, ${content_ka || content},
        ${excerpt}, ${excerpt_ka},
        ${validatedData.author},
        ${validatedData.published},
        ${featuredImage},
        NOW()
      )
      RETURNING id, slug
    `;

    // 5. Revalidate cache so new post appears immediately
    revalidatePath('/blog');
    revalidateTag('blog-posts');
    if (result[0]?.slug) {
      revalidatePath(`/blog/${result[0].slug}`);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Post created successfully', 
      post: result[0] 
    });

  } catch (error) {
    console.error('Webhook Error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation Error', details: error.errors }, { status: 400 });
    }
    // Handle unique constraint violation for slug (shouldn't happen with auto-numbering, but keep as safety)
    if ((error as any).code === '23505') { // Postgres unique violation code
      // Try one more time with timestamp
      try {
        const timestampSlug = `${validatedData.slug || generateSlug(validatedData.title)}-${Date.now()}`;
        const retryResult = await sql`
          INSERT INTO posts (
            title, title_ka, slug, content, content_ka, 
            excerpt, excerpt_ka, author, published, 
            featured_image, published_at
          )
          VALUES (
            ${validatedData.title}, ${title_ka}, ${timestampSlug},
            ${content}, ${content_ka || content},
            ${excerpt}, ${excerpt_ka},
            ${validatedData.author}, ${validatedData.published},
            ${featuredImage}, NOW()
          )
          RETURNING id, slug
        `;
        
        revalidatePath('/blog');
        revalidateTag('blog-posts');
        if (retryResult[0]?.slug) {
          revalidatePath(`/blog/${retryResult[0].slug}`);
        }
        
        return NextResponse.json({ 
          success: true, 
          message: 'Post created successfully (slug auto-numbered)', 
          post: retryResult[0] 
        });
      } catch (retryError) {
        return NextResponse.json({ error: 'Slug conflict - please try again' }, { status: 409 });
      }
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

