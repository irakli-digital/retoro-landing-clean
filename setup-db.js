require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function setupDatabase() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    // Create posts table
    await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        title_ka VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        content TEXT NOT NULL,
        content_ka TEXT NOT NULL,
        excerpt TEXT,
        excerpt_ka TEXT,
        author VARCHAR(100),
        published_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        published BOOLEAN DEFAULT false,
        featured_image VARCHAR(500)
      )
    `;
    
    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published, published_at DESC)`;
    
    console.log('✅ Database tables created successfully!');
    
    // Add a sample post
    await sql`
      INSERT INTO posts (title, title_ka, slug, content, content_ka, excerpt, excerpt_ka, author, published)
      VALUES (
        'Getting Started with AI',
        'AI-ს დაწყება',
        'getting-started-with-ai',
        '<h2>Welcome to the AI Revolution</h2><p>Artificial Intelligence is transforming how we work and create. In this post, we will explore the basics of AI and how you can leverage it in your daily work.</p><h3>What is AI?</h3><p>AI refers to computer systems that can perform tasks that typically require human intelligence...</p>',
        '<h2>კეთილი იყოს თქვენი მობრძანება AI რევოლუციაში</h2><p>ხელოვნური ინტელექტი ცვლის იმას, თუ როგორ ვმუშაობთ და ვქმნით. ამ პოსტში ჩვენ შევისწავლით AI-ს საფუძვლებს და როგორ შეგიძლიათ მისი გამოყენება თქვენს ყოველდღიურ საქმიანობაში.</p><h3>რა არის AI?</h3><p>AI ეხება კომპიუტერულ სისტემებს, რომლებსაც შეუძლიათ შეასრულონ ამოცანები, რომლებიც ჩვეულებრივ ადამიანის ინტელექტს მოითხოვს...</p>',
        'Learn the basics of AI and how to use it effectively',
        'ისწავლეთ AI-ს საფუძვლები და როგორ გამოიყენოთ იგი ეფექტურად',
        'Mypen Team',
        true
      )
      ON CONFLICT (slug) DO NOTHING
    `;
    
    console.log('✅ Sample blog post added!');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
  }
}

setupDatabase();