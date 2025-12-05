// Test webhook with actual image data from N8N
// Using built-in fetch (Node.js 18+)

const webhookUrl = process.env.WEBHOOK_URL || 'http://localhost:3001/api/webhooks/blog';
const secret = process.env.N8N_WEBHOOK_SECRET || 'mypen-n8n-webhook-secret-2024-secure-key-change-this';

const testPayload = {
  title: "Test Article with Images",
  title_ka: "ტესტ სტატია სურათებით",
  content: `<h1>ხელოვნური ინტელექტი (AI): როგორ მუშაობს?</h1>
<p>ხშირად ისმის კითხვა...</p>
<img src="https://images.squarespace-cdn.com/content/v1/62ec2bc76a27db7b37a2b32f/b5651a5c-40cb-44ee-b5c2-112a609be80a/how-dows-ai-work.jpg" alt="აბსტრაქტული ციფრული ნამუშევარი" />
<h2>რა არის ხელოვნური ინტელექტი?</h2>
<img src="https://images.squarespace-cdn.com/content/v1/62ec2bc76a27db7b37a2b32f/0c2b161b-fe5c-446b-98ce-e62d0fbe5d80/how-does-ai-work-t-shirt-min.png" alt="მაისურის დიზაინი" />
<p>მეტი ტექსტი...</p>`,
  content_ka: `<h1>ხელოვნური ინტელექტი (AI): როგორ მუშაობს?</h1>
<p>ხშირად ისმის კითხვა...</p>
<img src="https://images.squarespace-cdn.com/content/v1/62ec2bc76a27db7b37a2b32f/b5651a5c-40cb-44ee-b5c2-112a609be80a/how-dows-ai-work.jpg" alt="აბსტრაქტული ციფრული ნამუშევარი" />
<h2>რა არის ხელოვნური ინტელექტი?</h2>
<img src="https://images.squarespace-cdn.com/content/v1/62ec2bc76a27db7b37a2b32f/0c2b161b-fe5c-446b-98ce-e62d0fbe5d80/how-does-ai-work-t-shirt-min.png" alt="მაისურის დიზაინი" />
<p>მეტი ტექსტი...</p>`,
  excerpt: "ტესტ სტატია",
  excerpt_ka: "ტესტ სტატია",
  author: "Mypen Team",
  published: true
};

async function testWebhook() {
  console.log('Testing webhook with images...\n');
  console.log('Webhook URL:', webhookUrl);
  console.log('Payload content length:', testPayload.content.length);
  console.log('Images in content:', (testPayload.content.match(/<img[^>]+src=/g) || []).length);
  console.log('\nSending request...\n');

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-n8n-webhook-secret': secret,
      },
      body: JSON.stringify(testPayload),
    });

    const result = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('\n✅ Webhook call successful!');
      console.log('Check your server logs above to see image processing.');
    } else {
      console.log('\n❌ Webhook call failed');
    }
  } catch (error) {
    console.error('Error calling webhook:', error);
  }
}

testWebhook();

