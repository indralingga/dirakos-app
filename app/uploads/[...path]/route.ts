import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: Request, props: { params: Promise<{ path: string[] }> }) {
  try {
    const params = await props.params;
    const pathSegments = params.path || [];

    // Sanitize path segments to prevent directory traversal
    const safeSegments = pathSegments.map(s => path.basename(s));
    const fullPath = path.join(process.cwd(), 'public', 'uploads', ...safeSegments);

    if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
      return new NextResponse('File Tidak Ditemukan', { status: 404 });
    }

    const fileBuffer = fs.readFileSync(fullPath);
    const ext = path.extname(fullPath).toLowerCase();

    let contentType = 'application/octet-stream';
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.pdf') contentType = 'application/pdf';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving upload file:', error);
    return new NextResponse('Terjadi kesalahan server', { status: 500 });
  }
}
