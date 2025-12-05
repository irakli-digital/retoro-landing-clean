require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function checkFeatured() {
  const sql = neon(process.env.DATABASE_URL);
  const slug = 'save-tokens-on-mypen';
  try {
    const res = await sql`SELECT slug, featured_image FROM posts WHERE slug = ${slug}`;
    console.log(res[0] || 'Not found');
  } catch (e) {
    console.error('Error:', e);
  }
}

checkFeatured();
