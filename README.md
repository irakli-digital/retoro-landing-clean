# Retoro Landing Page

Never miss a return deadline again. Retoro helps you track purchase return windows, sends timely reminders, and maximizes your refund opportunities.

## Overview

Retoro is a return tracking platform that helps shoppers manage return deadlines across multiple retailers. The landing page is built with Next.js 14, TypeScript, and Tailwind CSS, featuring a clean design that matches our native iOS app.

## Features

- **Smart Deadline Tracking**: Automatically calculates return windows based on retailer policies
- **Urgency Indicators**: Color-coded system (Green → Orange → Red) for priority management
- **Receipt Scanning**: Upload invoices for automatic item extraction
- **Multi-Currency Support**: Track purchases in 23 different currencies
- **Push Notifications**: Timely reminders at 7 days, 2 days, and deadline day
- **Money Saved Tracker**: Monitor savings from timely returns

## Tech Stack

- **Framework**: Next.js 14.2.16 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS with CSS variables
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Animations**: Framer Motion
- **Database**: Neon PostgreSQL (serverless)

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
retoro-landing/
├── app/              # Next.js App Router pages
├── components/       # React components
├── lib/             # Utility functions and database
├── config/          # Configuration files
├── public/          # Static assets
└── styles/          # Global CSS
```

## Environment Variables

Create a `.env` file based on `.env.local.example`:

```env
DATABASE_URL=your_neon_database_url
NEXT_PUBLIC_GTM_ID=your_gtm_id
NEXT_PUBLIC_GA_ID=your_ga_id
NEXT_PUBLIC_FB_PIXEL_ID=your_fb_pixel_id
NEXT_PUBLIC_HOTJAR_ID=your_hotjar_id
```

## License

Copyright © 2025 Retoro. All rights reserved.
