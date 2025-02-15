import { NextResponse } from 'next/server';
import { compare } from 'bcrypt';
import { db } from '@/packages/lib/prisma/client';

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  try {
    const { password } = await request.json();
    const { slug } = params;
    const project = await db.project.findUnique({
      where: { portalSlug: slug },
      select: {
        id: true,
        portalPass: true,
        portalEnabled: true
      }
    });

    if (!project || !project.portalEnabled) {
      return new NextResponse('Portal not found', { status: 404 });
    }

    const passwordMatch = await compare(password, project.portalPass);
    if (!passwordMatch) {
      return new NextResponse('Invalid password', { status: 401 });
    }

    // Create a portal view record
    await db.portalView.create({
      data: {
        projectId: project.id,
        ipAddress: request.headers.get('x-forwarded-for') || ''
      }
    });

    return new NextResponse('Success', { status: 200 });
  } catch (error) {
    return new NextResponse('Internal error', { status: 500 });
  }
}
