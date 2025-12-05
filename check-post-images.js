// Check if images were replaced in the database
require('dotenv').config({ path: '.env' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkPost() {
  try {
    // Get the latest post
    const posts = await sql`
      SELECT id, title_ka, slug, content_ka 
      FROM posts 
      ORDER BY id DESC 
      LIMIT 1
    `;
    
    if (posts.length === 0) {
      console.log('No posts found');
      return;
    }
    
    const post = posts[0];
    console.log('Latest post:');
    console.log('ID:', post.id);
    console.log('Title:', post.title_ka);
    console.log('Slug:', post.slug);
    console.log('\nChecking for images in content...\n');
    
    const content = post.content_ka || '';
    const imageMatches = content.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi) || [];
    
    console.log(`Found ${imageMatches.length} image tags in content\n`);
    
    imageMatches.forEach((match, idx) => {
      const urlMatch = match.match(/src=["']([^"']+)["']/);
      const url = urlMatch ? urlMatch[1] : 'N/A';
      console.log(`Image ${idx + 1}:`);
      console.log(`  Tag: ${match.substring(0, 100)}...`);
      console.log(`  URL: ${url}`);
      
      if (url.includes('mypen.ge') || url.startsWith('/images/blog/')) {
        console.log(`  ✅ Hosted on our server`);
      } else if (url.startsWith('http')) {
        console.log(`  ❌ Still external URL (not replaced)`);
      }
      console.log('');
    });
    
    // Check for Squarespace URLs specifically
    const squarespaceUrls = content.match(/images\.squarespace-cdn\.com/g) || [];
    if (squarespaceUrls.length > 0) {
      console.log(`⚠️  Found ${squarespaceUrls.length} Squarespace URLs still in content!`);
      console.log('This means images were NOT replaced.');
    } else {
      console.log('✅ No Squarespace URLs found - images were likely replaced');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkPost();

