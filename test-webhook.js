const axios = require('axios');
require('dotenv').config({ path: '.env' });

async function testWebhook() {
  // Allow testing both local and production
  const args = process.argv.slice(2);
  const isLocal = args.includes('--local') || args.includes('-l');
  const localPort = process.env.LOCAL_PORT || '3001';
  const webhookUrl = isLocal 
    ? `http://localhost:${localPort}/api/webhooks/blog`
    : (process.env.WEBHOOK_URL || 'https://mypen.ge/api/webhooks/blog');
  
  const secret = process.env.N8N_WEBHOOK_SECRET;

  if (!secret) {
    console.error('❌ N8N_WEBHOOK_SECRET not found in .env');
    console.log('\nPlease add to .env:');
    console.log('N8N_WEBHOOK_SECRET=your-secret-key-here\n');
    process.exit(1);
  }

  // Test payload matching your webhook schema
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const testPayload = {
    title: 'Test Article - ' + timestamp,
    title_ka: 'ტესტ სტატია - ' + timestamp,
    content: '<h2>Test Content</h2><p>This is a test article to verify the webhook works correctly.</p><p>If you see this post, the webhook integration is working!</p>',
    content_ka: '<h2>ტესტ კონტენტი</h2><p>ეს არის ტესტ სტატია, რომ შევამოწმოთ webhook-ის მუშაობა.</p><p>თუ ხედავთ ამ პოსტს, webhook ინტეგრაცია მუშაობს!</p>',
    excerpt: 'A test article to verify webhook functionality',
    excerpt_ka: 'ტესტ სტატია webhook-ის მუშაობის შესამოწმებლად',
    featured_image: 'https://via.placeholder.com/1200x630',
    author: 'Test Bot',
    published: true
  };

  try {
    console.log('🚀 Testing webhook:', webhookUrl);
    console.log('🔐 Using secret:', secret.substring(0, 8) + '...');
    console.log('📝 Payload:', JSON.stringify(testPayload, null, 2));
    console.log('\n⏳ Sending request...\n');

    const response = await axios.post(webhookUrl, testPayload, {
      headers: {
        'Content-Type': 'application/json',
        'x-n8n-webhook-secret': secret
      }
    });

    console.log('✅ SUCCESS!');
    console.log('📊 Response:', JSON.stringify(response.data, null, 2));
    console.log('\n🎉 Blog post created successfully!');
    
    if (isLocal) {
      console.log(`🔗 Check your blog at: http://localhost:${localPort}/blog`);
    } else {
      console.log('🔗 Check your blog at: https://mypen.ge/blog');
    }

  } catch (error) {
    if (error.response) {
      // Server responded with error
      console.error('❌ ERROR:', error.response.status, error.response.statusText);
      console.error('📊 Response:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 401) {
        console.error('\n🔐 Authentication failed.');
        console.error('   Check that N8N_WEBHOOK_SECRET in .env matches your server.');
      } else if (error.response.status === 400) {
        console.error('\n📝 Validation error.');
        console.error('   Check the payload structure matches the webhook schema.');
      } else if (error.response.status === 409) {
        console.error('\n⚠️  Slug conflict.');
        console.error('   The test article already exists. Try again (timestamp will be different).');
      }
    } else if (error.request) {
      // Request made but no response
      console.error('❌ No response from server');
      console.error('🌐 Connection error. Check:');
      console.error('   - Is the server running?');
      if (isLocal) {
        console.error(`   - Run: npm run dev (or check server is on port ${localPort})`);
      } else {
        console.error('   - Is the URL correct?');
        console.error('   - Try local testing: node test-webhook.js --local');
      }
    } else {
      console.error('❌ Request failed:', error.message);
    }
  }
}

// Show usage
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Usage: node test-webhook.js [options]');
  console.log('\nOptions:');
  console.log('  --local, -l    Test against local server (default: localhost:3001)');
  console.log('  --help, -h     Show this help message');
  console.log('\nEnvironment Variables:');
  console.log('  LOCAL_PORT     Port for local server (default: 3001)');
  console.log('  WEBHOOK_URL     Production webhook URL');
  console.log('\nExamples:');
  console.log('  node test-webhook.js              # Test production');
  console.log('  node test-webhook.js --local      # Test local server on port 3001');
  process.exit(0);
}

testWebhook();

