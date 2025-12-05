require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function testQuery() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('🔍 Testing blog page query...');
    
    // This is the query used in the blog page
    const posts = await sql`
      SELECT id, title, title_ka, slug, excerpt, excerpt_ka, published_at, author, featured_image 
      FROM posts 
      WHERE published = true 
      ORDER BY published_at DESC
    `;
    
    console.log(`✅ Query successful! Found ${posts.length} published posts.`);
    if (posts.length > 0) {
        console.log('First post:', JSON.stringify(posts[0], null, 2));
    } else {
        console.log('⚠️ No published posts found. You might need to publish some posts.');
    }
    
  } catch (error) {
    console.error('❌ Error with query:', error);
  }
}

testQuery();