# N8N Auto-Blogging Setup Guide

This guide explains how to connect N8N to your Next.js blog to automatically post articles.

## 1. Configuration

First, you need to set a secret key to secure your webhook endpoint.

1. Open your `.env.local` file.
2. Add the following line (replace `your-secure-secret-key` with a strong password):
   ```bash
   N8N_WEBHOOK_SECRET=your-secure-secret-key
   ```
3. **Redeploy** your application if it's already running on Vercel or another host.

## 2. N8N HTTP Request Node Setup

In your N8N workflow, add an **HTTP Request** node with the following settings:

*   **Method:** `POST`
*   **URL:** `https://your-website.com/api/webhooks/blog`
    *   *For local testing:* `http://localhost:3000/api/webhooks/blog`
*   **Authentication:** None (we handle it via headers)
*   **Headers:**
    *   Name: `x-n8n-webhook-secret`
    *   Value: `your-secure-secret-key` (The one you added to .env.local)
*   **Body Content Type:** `JSON`

## 3. JSON Payload Structure

In the **Body Parameters** section of the HTTP Request node, construct a JSON object with the following fields.

### Essential Fields
```json
{
  "title": "My Automated Post",
  "content": "<h2>Introduction</h2><p>This is an automated post from N8N.</p>"
}
```
*   **content:** This supports full HTML. You can use `<h1>`, `<h2>`, `<p>`, `<ul>`, `<img>`, etc. Styling will be handled by your website's CSS (Tailwind Typography).

### Full Options
You can also provide optional fields. If Georgian fields (`_ka`) are omitted, the system will automatically copy the English content to them to prevent errors.

```json
{
  "title": "Future of AI",
  "slug": "future-of-ai-2025",
  "content": "<h2>The Future</h2><p>AI is growing...</p>",
  "excerpt": "A short summary displayed on the blog card.",
  "featured_image": "https://example.com/image.jpg",
  "author": "AI Bot",
  "published": true,
  
  "title_ka": "AI-ის მომავალი",
  "content_ka": "<h2>მომავალი</h2><p>AI იზრდება...</p>",
  "excerpt_ka": "მოკლე შინაარსი..."
}
```

## 4. Testing

You can test this endpoint using `curl` or Postman before setting up N8N.

```bash
curl -X POST http://localhost:3000/api/webhooks/blog \
  -H "Content-Type: application/json" \
  -H "x-n8n-webhook-secret: your-secure-secret-key" \
  -d '{"title": "Test Post", "content": "<p>Hello World</p>"}'
```
