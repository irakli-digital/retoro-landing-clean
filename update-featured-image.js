require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function updateFeatured() {
  const sql = neon(process.env.DATABASE_URL);
  const slug = 'save-tokens-on-mypen';
  const imagePath = '/images/blog/save-tokens-on-mypen.png';
  try {
    const res = await sql`
      UPDATE posts SET featured_image = ${imagePath}, updated_at = NOW()
      WHERE slug = ${slug}
      RETURNING id, slug, featured_image
    `;
    if (res.length === 0) {
      console.log('No post found for slug:', slug);
      return;
    }
    console.log('✅ Updated featured image:', res[0]);
  } catch (e) {
    console.error('❌ Error updating featured image:', e);
  }
}

updateFeatured();
