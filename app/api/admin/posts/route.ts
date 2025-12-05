import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { cookies } from 'next/headers';
import { revalidatePath, revalidateTag } from 'next/cache';

// Check admin authentication
async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  return !!session;
}

// GET - List all posts
export async function GET() {
  const isAuthenticated = await checkAuth();
  
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const posts = await sql`
      SELECT id, title, title_ka, slug, published, published_at, author, featured_image
      FROM posts 
      ORDER BY published_at DESC
    `;

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - Delete a post
export async function DELETE(req: NextRequest) {
  const isAuthenticated = await checkAuth();
  
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get('id');

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    // Delete the post
    await sql`
      DELETE FROM posts WHERE id = ${parseInt(postId)}
    `;

    // Revalidate cache
    revalidatePath('/blog');
    revalidateTag('blog-posts');

    return NextResponse.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

