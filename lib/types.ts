export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  author: string | null;
  published_at: string | Date;
  updated_at: string | Date;
  published: boolean;
  featured_image: string | null;
  featured: boolean;
}

export type BlogPostPreview = Pick<
  BlogPost,
  'id' | 'title' | 'slug' | 'excerpt' | 'published_at' | 'author' | 'featured_image' | 'featured'
>;

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string | null;
  sort_order: number;
  published: boolean;
  created_at: string | Date;
  updated_at: string | Date;
}