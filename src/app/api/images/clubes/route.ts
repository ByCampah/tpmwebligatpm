import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const imagesDirectory = path.join(process.cwd(), 'public/img/clubes');
    
    // Check if directory exists
    try {
      await fs.access(imagesDirectory);
    } catch {
      return NextResponse.json({ images: [] });
    }

    const files = await fs.readdir(imagesDirectory);
    
    // Filter only image files
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif'].includes(ext);
    });

    // Create the public paths
    const imageUrls = imageFiles.map(file => `/img/clubes/${file}`);

    return NextResponse.json({ images: imageUrls });
  } catch (error) {
    console.error('Error reading images directory:', error);
    return NextResponse.json({ error: 'Failed to read images' }, { status: 500 });
  }
}
