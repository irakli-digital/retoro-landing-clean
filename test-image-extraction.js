// Test the image extraction regex with the actual HTML from N8N
const html = `<h1>ხელოვნური ინტელექტი (AI): როგორ მუშაობს?</h1>
<p>ხშირად ისმის კითხვა...</p>
<img src="https://images.squarespace-cdn.com/content/v1/62ec2bc76a27db7b37a2b32f/b5651a5c-40cb-44ee-b5c2-112a609be80a/how-dows-ai-work.jpg" alt="აბსტრაქტული ციფრული ნამუშევარი" />
<h2>რა არის ხელოვნური ინტელექტი?</h2>
<img src="https://images.squarespace-cdn.com/content/v1/62ec2bc76a27db7b37a2b32f/0c2b161b-fe5c-446b-98ce-e62d0fbe5d80/how-does-ai-work-t-shirt-min.png" alt="მაისურის დიზაინი" />`;

// Test the regex used in replaceImageUrlsInHtml
const imageUrlRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
const imageUrls = new Set();
let match;

console.log('Testing image extraction regex...\n');
console.log('HTML length:', html.length);
console.log('HTML sample:', html.substring(0, 200), '...\n');

while ((match = imageUrlRegex.exec(html)) !== null) {
  const url = match[1];
  console.log('Match found:', match[0]);
  console.log('URL extracted:', url);
  if (url && url.startsWith('http') && !url.includes('mypen.ge')) {
    imageUrls.add(url);
    console.log('✅ Added to set');
  } else {
    console.log('❌ Not added (doesn\'t start with http or contains mypen.ge)');
  }
  console.log('');
}

console.log(`\nTotal unique images found: ${imageUrls.size}`);
console.log('Image URLs:', Array.from(imageUrls));

