-- Retoro Landing Page Database Schema
-- English-only content (no bilingual support needed)

-- Blog posts table
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  author VARCHAR(100),
  published_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  published BOOLEAN DEFAULT false,
  featured_image VARCHAR(500),
  featured BOOLEAN DEFAULT false
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_featured ON posts(featured, published_at DESC);

-- FAQ table
CREATE TABLE IF NOT EXISTS faqs (
  id SERIAL PRIMARY KEY,
  question VARCHAR(500) NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100),
  sort_order INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_faqs_published ON faqs(published, sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category, sort_order ASC);

-- Sample Retoro FAQ data
INSERT INTO faqs (question, answer, category, sort_order, published) VALUES
('How does return deadline calculation work?', 'Retoro automatically calculates your return deadline based on the retailer''s return policy and your purchase date. We track policies for over 500 retailers to ensure accuracy.', 'General', 1, true),
('Which retailers are supported?', 'We support over 500 major retailers including Amazon, Target, Walmart, Best Buy, Zara, H&M, and many more. You can also add custom retailers with their return policies.', 'General', 2, true),
('Can I scan receipts?', 'Yes! Our receipt scanning feature uses AI to automatically extract item details, purchase date, retailer, and price from your receipts. Just snap a photo and we''ll handle the rest.', 'Features', 3, true),
('Is my purchase data private?', 'Absolutely. Your purchase data is encrypted and stored securely. We never share your information with third parties. You can delete your data at any time from the app settings.', 'Privacy', 4, true),
('How do notifications work?', 'Retoro sends you smart reminders at three key times: 7 days before the deadline (plan ahead), 2 days before (start return process), and on the deadline day (last chance). You can customize these in settings.', 'Features', 5, true),
('Can I track returns in multiple currencies?', 'Yes! Retoro supports 23 different currencies including USD, EUR, GBP, JPY, CNY, and more. Purchases are tracked in their original currency with automatic conversion for your dashboard totals.', 'Features', 6, true),
('Is Retoro free?', 'Yes, Retoro offers a free plan with unlimited return tracking, local notifications, and manual entry. Premium features like receipt scanning and cloud sync are available with our paid plans.', 'Pricing', 7, true),
('What happens to expired returns?', 'Items move to your history once the return deadline passes. You can still view them and see statistics about how much you saved by returning items on time.', 'General', 8, true);

-- Sample blog post data
INSERT INTO posts (title, slug, content, excerpt, author, published, featured, featured_image) VALUES
('Never Miss a Return Window: A Complete Guide', 'never-miss-return-window-guide',
'<h2>Introduction</h2><p>Missing return deadlines can cost you hundreds of dollars each year. According to recent studies, consumers lose an estimated $3 billion annually in unused returns. This comprehensive guide will show you how to track your purchase return windows effectively and maximize your refund opportunities.</p><h2>Understanding Return Policies</h2><p>Different retailers have vastly different return policies. While some offer generous 90-day windows, others only allow 14-30 days. Fashion retailers like Nordstrom and Zara typically offer 30-60 days, while electronics stores like Best Buy often have shorter 14-30 day windows...</p>',
'Learn how to track return deadlines effectively and never lose money on missed return windows again.',
'Retoro Team', true, true, '/images/blog/optimized/return-window-guide.webp'),

('10 Return Policy Hacks Every Shopper Should Know', 'return-policy-hacks-shoppers',
'<h2>1. Know Your Rights</h2><p>Many shoppers don''t realize that return policies often have hidden perks. For example, some retailers offer extended return windows for loyalty program members...</p><h2>2. Keep Your Receipts Digital</h2><p>Scanning and digitizing your receipts not only helps with tracking but also prevents the common problem of faded thermal receipts...</p>',
'Discover insider tips and tricks to maximize your return opportunities and save hundreds of dollars.',
'Retoro Team', true, true, '/images/blog/optimized/return-hacks.webp');
