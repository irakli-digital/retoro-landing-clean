# Blog Setup Guide

## Prerequisites

1. Create a Neon PostgreSQL database at [neon.tech](https://neon.tech)
2. Copy your database connection string

## Setup Steps

1. **Create environment file**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Add your Neon database URL**
   Edit `.env.local` and add your database URL:
   ```
   DATABASE_URL=postgresql://username:password@hostname/database?sslmode=require
   ```

3. **Create database tables**
   Run the SQL schema in your Neon console:
   ```bash
   # Copy contents of schema.sql and run in Neon SQL editor
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## Blog Features

- **Bilingual Support**: Georgian (primary) and English content
- **Server-Side Rendering**: Excellent SEO and performance
- **Dynamic Routes**: Clean URLs with slugs
- **Dark Mode**: Consistent with site theme
- **Responsive Design**: Works on all devices

## Content Management

Currently, blog posts are managed directly in the database. Each post has:
- `title` / `title_ka`: Post titles
- `content` / `content_ka`: HTML content
- `excerpt` / `excerpt_ka`: Short description
- `slug`: URL-friendly identifier
- `featured_image`: Optional image URL
- `published`: Boolean to control visibility

## Adding Posts

Insert posts directly into your Neon database:

```sql
INSERT INTO posts (
  title, title_ka, slug, 
  content, content_ka, 
  excerpt, excerpt_ka, 
  author, published
) VALUES (
  'Your English Title',
  'თქვენი ქართული სათაური',
  'your-url-slug',
  '<p>Your HTML content...</p>',
  '<p>თქვენი HTML კონტენტი...</p>',
  'Short description',
  'მოკლე აღწერა',
  'Author Name',
  true
);
```