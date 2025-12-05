const { writeFile, mkdir } = require('fs/promises');
const { join } = require('path');
const { existsSync } = require('fs');
const sharp = require('sharp');

const imageUrl = 'https://images.squarespace-cdn.com/content/v1/62ec2bc76a27db7b37a2b32f/61f96900-3c42-4ff2-b960-d1229e733ac8/chatgpt-atlas-agent-writing-a-squarespace-blog-post.jpg';

async function uploadAndHostImage(imageUrl) {
  try {
    console.log(`Starting download for ${imageUrl}`);
    
    // Download image
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MypenBot/1.0)',
        'Accept': 'image/*',
      },
    });

    if (!response.ok) {
      console.error(`Failed to download image: ${response.status} ${response.statusText}`);
      return null;
    }

    const imageBuffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    if (!contentType.startsWith('image/')) {
      console.error(`URL does not point to an image, content-type: ${contentType}`);
      return null;
    }

    console.log(`Successfully downloaded, size: ${imageBuffer.length} bytes, type: ${contentType}`);

    // Ensure directories exist
    const BLOG_IMAGE_DIR = join(process.cwd(), 'public', 'images', 'blog', 'content');
    const OPTIMIZED_DIR = join(process.cwd(), 'public', 'images', 'blog', 'optimized');
    
    if (!existsSync(BLOG_IMAGE_DIR)) {
      await mkdir(BLOG_IMAGE_DIR, { recursive: true });
      console.log(`Created directory: ${BLOG_IMAGE_DIR}`);
    }
    if (!existsSync(OPTIMIZED_DIR)) {
      await mkdir(OPTIMIZED_DIR, { recursive: true });
      console.log(`Created directory: ${OPTIMIZED_DIR}`);
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

    console.log(`Generated filename: ${finalFilename}, baseName: ${baseName}`);

    // Save original
    const originalPath = join(BLOG_IMAGE_DIR, finalFilename);
    await writeFile(originalPath, imageBuffer);
    console.log(`Saved original to: ${originalPath}`);

    // Optimize with Sharp
    try {
      const image = sharp(imageBuffer);
      const metadata = await image.metadata();
      const width = metadata.width || 1200;
      const height = metadata.height || 800;

      console.log(`Image metadata: ${width}x${height}, format: ${metadata.format}`);

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
        console.log(`Created WebP variant: ${webpPath}`);
      }

      // Create JPEG fallback
      const jpegPath = join(OPTIMIZED_DIR, `${baseName}.jpg`);
      await image.clone().jpeg({ quality: 85 }).toFile(jpegPath);
      console.log(`Created JPEG fallback: ${jpegPath}`);
    } catch (error) {
      console.error('Error optimizing image:', error);
    }

    const hostedUrl = `/images/blog/optimized/${baseName}.webp`;
    console.log(`\n✅ Success! Hosted URL: ${hostedUrl}`);
    console.log(`Full URL: http://localhost:3001${hostedUrl}`);
    
    return hostedUrl;
  } catch (error) {
    console.error(`Error uploading image:`, error);
    return null;
  }
}

// Run the test
uploadAndHostImage(imageUrl)
  .then((url) => {
    if (url) {
      console.log(`\n🎉 Image successfully uploaded!`);
      console.log(`Access it at: http://localhost:3001${url}`);
    } else {
      console.log(`\n❌ Failed to upload image`);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });

