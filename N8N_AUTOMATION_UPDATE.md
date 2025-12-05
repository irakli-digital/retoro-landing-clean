# N8N Blog Automation - Updated Workflow

## Summary of Changes

The N8N workflow has been updated to:
1. ✅ Output **HTML** instead of Markdown (matching your blog's requirements)
2. ✅ Include **SEO best practices** in HTML output
3. ✅ **Extract and include images** from RSS feed articles
4. ✅ **Send data to your webhook** endpoint automatically

## Workflow Changes

### 1. Removed Markdown Conversion
- **Removed**: `Markdown` node (no longer needed)
- **Reason**: Blog expects HTML, not Markdown

### 2. Added Image Processing
- **New Node**: `Process Images`
- **Function**: Extracts images from article HTML and converts relative URLs to absolute URLs
- **Output**: Provides image list to LLM and stores image URLs for featured image selection

### 3. Updated LLM Prompt
- **Changed**: Output format from Markdown to HTML
- **Added**: SEO requirements (proper heading hierarchy, semantic HTML, alt text)
- **Added**: Image inclusion instructions
- **Added**: Featured image selection capability

### 4. Added Webhook Integration
- **New Node**: `Prepare Webhook Payload`
- **Function**: Maps LLM output to webhook schema format
- **New Node**: `Send to Webhook`
- **Function**: Posts article data to your blog webhook endpoint

## Workflow Flow

```
Manual Trigger
  ↓
Edit Fields (Brand Voice)
  ↓
Read RSS Feed
  ↓
Aggregate All Articles
  ↓
Sorting Articles (AI selects best article)
  ↓
Parse and Split URLs
  ↓
Get Article (HTTP request)
  ↓
Extract Article Content (HTML + Images)
  ↓
Process Images (Convert URLs, format for LLM)
  ↓
Rewrite and Translate Article (LLM outputs HTML)
  ↓
Prepare Webhook Payload (Map to schema)
  ↓
Send to Webhook (POST to /api/webhooks/blog)
```

## LLM Output Format

The LLM now outputs **clean, semantic HTML** with:

### HTML Structure Requirements:
- `<h2>` for main sections (never `<h1>` - reserved for page title)
- `<h3>` for subsections
- `<h4>` for sub-subsections
- `<p>` for paragraphs
- `<ul>` and `<li>` for lists
- `<blockquote>` for quotes
- `<img src="URL" alt="descriptive text in Georgian" />` for images
- `<strong>` for bold, `<em>` for italic
- `<a href="URL">` for links with descriptive anchor text

### SEO Best Practices Included:
- Proper heading hierarchy (h2 → h3 → h4)
- Semantic HTML structure
- Descriptive alt text for images (in Georgian)
- Images placed contextually within content
- Clean, readable HTML structure

## Webhook Payload Structure

The workflow sends this JSON structure to your webhook:

```json
{
  "title": "English title (fallback)",
  "title_ka": "Georgian title",
  "content": "HTML content (fallback)",
  "content_ka": "HTML content in Georgian",
  "excerpt": "Summary (fallback)",
  "excerpt_ka": "Summary in Georgian",
  "featured_image": "URL of best image or null",
  "author": "Mypen Team",
  "published": true
}
```

## Configuration Required

### 1. Environment Variables in N8N

Set these in your N8N environment:

```bash
N8N_WEBHOOK_SECRET=your-secret-key-here
WEBHOOK_URL=https://mypen.ge/api/webhooks/blog
```

**Note**: If `WEBHOOK_URL` is not set, it defaults to `https://mypen.ge/api/webhooks/blog`

### 2. Webhook Secret

Make sure your `.env.local` has:
```bash
N8N_WEBHOOK_SECRET=your-secret-key-here
```

The same secret must be used in:
- N8N environment variable `N8N_WEBHOOK_SECRET`
- Your Next.js `.env.local` file

## Image Handling

### How Images Are Processed:

1. **Extraction**: Images are extracted from the article HTML using CSS selector `img`
2. **URL Conversion**: Relative URLs are converted to absolute URLs
3. **LLM Selection**: LLM receives image list and selects the best one for `featured_image`
4. **HTML Embedding**: LLM embeds images naturally within the HTML content with proper alt text
5. **Fallback**: If LLM doesn't provide `featured_image`, first image from article is used

### Image URL Formats Supported:
- Absolute URLs: `https://example.com/image.jpg` ✅
- Protocol-relative: `//example.com/image.jpg` → `https://example.com/image.jpg` ✅
- Root-relative: `/images/photo.jpg` → `https://origin.com/images/photo.jpg` ✅
- Relative: `images/photo.jpg` → `https://origin.com/images/photo.jpg` ✅

## Testing the Workflow

### 1. Test Image Extraction
- Check `Process Images` node output
- Verify `imageUrls` array contains valid URLs
- Verify `images` string is formatted correctly for LLM

### 2. Test LLM Output
- Check `Rewrite and Translate Article` node output
- Verify `body` contains valid HTML (not Markdown)
- Verify images are included with proper `<img>` tags
- Verify `featured_image` is a valid URL or null

### 3. Test Webhook Payload
- Check `Prepare Webhook Payload` node output
- Verify all required fields are present
- Verify `featured_image` is valid URL or null (not empty string)

### 4. Test Webhook Request
- Check `Send to Webhook` node response
- Should return `{ success: true, message: 'Post created successfully', post: {...} }`
- If error, check webhook secret matches

## Troubleshooting

### Issue: Images not appearing in HTML
**Solution**: Check that `Extract Article Content` node is extracting images correctly. The CSS selector `img` should match images in the article.

### Issue: Featured image is null
**Solution**: 
- Check if article has images
- Check `Process Images` node output
- LLM should select best image, but fallback uses first image

### Issue: Webhook returns 401 Unauthorized
**Solution**: 
- Verify `N8N_WEBHOOK_SECRET` environment variable matches `.env.local`
- Check header `x-n8n-webhook-secret` is being sent correctly

### Issue: HTML contains Markdown syntax
**Solution**: 
- Check LLM prompt includes "Body must be clean, semantic HTML (NOT Markdown)"
- Verify LLM is following instructions

### Issue: Slug conflicts (409 error)
**Solution**: 
- Webhook auto-generates slug from title
- If duplicate, either change title or provide custom `slug` field in webhook payload

## Next Steps

1. **Import Updated Workflow**: Import `auto articles.json` into N8N
2. **Set Environment Variables**: Add `N8N_WEBHOOK_SECRET` and optionally `WEBHOOK_URL`
3. **Test Workflow**: Run workflow manually and verify each step
4. **Monitor**: Check webhook logs and database for successful posts

## Additional Notes

- The workflow maintains your existing brand voice guidelines
- All content is translated to Georgian following your style guide
- HTML output is optimized for SEO with proper semantic structure
- Images are automatically included and optimized for web use
- Featured images are intelligently selected by the LLM

