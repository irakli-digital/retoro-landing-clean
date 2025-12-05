# Testing the Blog Webhook

## Quick Test Methods

### Method 1: Using the Test Script (Recommended)

I've created a test script that makes it easy to test your webhook:

```bash
# Test production webhook
node test-webhook.js

# Test local webhook (requires npm run dev)
node test-webhook.js --local
```

**Prerequisites:**
1. Make sure `N8N_WEBHOOK_SECRET` is set in your `.env.local` file
2. For local testing, make sure your dev server is running (`npm run dev`)

### Method 2: Using cURL

#### Test Production:
```bash
curl -X POST https://mypen.ge/api/webhooks/blog \
  -H "Content-Type: application/json" \
  -H "x-n8n-webhook-secret: YOUR_SECRET_HERE" \
  -d '{
    "title": "Test Article",
    "title_ka": "ტესტ სტატია",
    "content": "<h2>Test</h2><p>This is a test.</p>",
    "content_ka": "<h2>ტესტ</h2><p>ეს არის ტესტი.</p>",
    "excerpt": "Test excerpt",
    "excerpt_ka": "ტესტ შინაარსი"
  }'
```

#### Test Local:
```bash
curl -X POST http://localhost:3000/api/webhooks/blog \
  -H "Content-Type: application/json" \
  -H "x-n8n-webhook-secret: YOUR_SECRET_HERE" \
  -d '{
    "title": "Test Article",
    "title_ka": "ტესტ სტატია",
    "content": "<h2>Test</h2><p>This is a test.</p>",
    "content_ka": "<h2>ტესტ</h2><p>ეს არის ტესტი.</p>",
    "excerpt": "Test excerpt",
    "excerpt_ka": "ტესტ შინაარსი"
  }'
```

### Method 3: Using Postman or Similar Tools

1. **URL**: `https://mypen.ge/api/webhooks/blog` (or `http://localhost:3000/api/webhooks/blog` for local)
2. **Method**: `POST`
3. **Headers**:
   - `Content-Type: application/json`
   - `x-n8n-webhook-secret: YOUR_SECRET_HERE`
4. **Body** (JSON):
```json
{
  "title": "Test Article",
  "title_ka": "ტესტ სტატია",
  "content": "<h2>Test</h2><p>This is a test article.</p>",
  "content_ka": "<h2>ტესტ</h2><p>ეს არის ტესტ სტატია.</p>",
  "excerpt": "Test excerpt",
  "excerpt_ka": "ტესტ შინაარსი",
  "featured_image": "https://via.placeholder.com/1200x630",
  "author": "Test Bot",
  "published": true
}
```

## Expected Responses

### ✅ Success (200 OK)
```json
{
  "success": true,
  "message": "Post created successfully",
  "post": {
    "id": 123,
    "slug": "test-article"
  }
}
```

### ❌ Authentication Error (401)
```json
{
  "error": "Unauthorized"
}
```
**Fix**: Check that `N8N_WEBHOOK_SECRET` matches in both `.env.local` and your request header.

### ❌ Validation Error (400)
```json
{
  "error": "Validation Error",
  "details": [...]
}
```
**Fix**: Check that required fields (`title`, `content`) are present and valid.

### ❌ Slug Conflict (409)
```json
{
  "error": "Slug already exists. Please provide a unique slug or title."
}
```
**Fix**: Change the title or provide a unique `slug` field.

## Setup Checklist

Before testing, make sure:

- [ ] `N8N_WEBHOOK_SECRET` is set in `.env.local`
- [ ] Database connection is working (`DATABASE_URL` in `.env.local`)
- [ ] For local testing: Dev server is running (`npm run dev`)
- [ ] For production testing: Site is deployed and environment variables are set

## Troubleshooting

### "N8N_WEBHOOK_SECRET not found"
- Add `N8N_WEBHOOK_SECRET=your-secret-key` to `.env.local`
- Make sure you're running the script from the project root

### "Connection refused" (local testing)
- Make sure your dev server is running: `npm run dev`
- Check that the server is running on port 3000

### "Unauthorized" error
- Verify the secret in `.env.local` matches what you're sending
- Check that the header name is exactly `x-n8n-webhook-secret` (lowercase)

### "Validation Error"
- Ensure `title` and `content` fields are present
- Check that `content` contains valid HTML
- Verify all string fields are non-empty

## Testing from N8N

When your N8N workflow runs, it will automatically:
1. Send the payload to your webhook
2. Include the `x-n8n-webhook-secret` header
3. Receive the response with post ID and slug

Check the N8N workflow execution logs to see:
- Request payload
- Response status
- Any error messages

## Verify Post Creation

After a successful webhook call:

1. **Check the blog**: Visit `https://mypen.ge/blog` (or `http://localhost:3000/blog` locally)
2. **Check database**: Query the `posts` table to see the new entry
3. **Check slug**: Visit `https://mypen.ge/blog/[slug]` to see the full post

