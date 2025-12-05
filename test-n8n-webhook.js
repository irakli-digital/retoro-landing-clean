const axios = require('axios');
require('dotenv').config({ path: '.env' });

async function testWebhook() {
  const secret = process.env.N8N_WEBHOOK_SECRET;
  if (!secret) {
    console.error('❌ N8N_WEBHOOK_SECRET is not set in .env');
    console.log('   Please add N8N_WEBHOOK_SECRET=your-secret to .env');
    return;
  }

  const url = 'http://localhost:3000/api/webhooks/blog';
  
  const payload = {
    title: "Automated Test Post",
    content: "<h2>It Works!</h2><p>This post was created via the N8N webhook API.</p>",
    excerpt: "A test post to verify the webhook integration.",
    published: true,
    author: "Test Script"
  };

  console.log('🚀 Sending test request to:', url);
  console.log('📦 Payload:', JSON.stringify(payload, null, 2));

  try {
    const response = await axios.post(url, payload, {
      headers: {
        'x-n8n-webhook-secret': secret,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Success!');
    console.log('Response:', response.data);
    console.log('\nVisit http://localhost:3000/blog to see your new post.');

  } catch (error) {
    console.error('❌ Error:', error.response ? error.response.data : error.message);
    if (error.code === 'ECONNREFUSED') {
        console.log('⚠️ Make sure your Next.js server is running locally (npm run dev)');
    }
  }
}

testWebhook();
