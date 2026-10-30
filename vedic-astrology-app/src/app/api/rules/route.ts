import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const data = await req.json();
    const { name, description, logic, conditions } = data;

    if (!name || !description || !conditions || !Array.isArray(conditions)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newRule = await prisma.rule.create({
      data: {
        name,
        description,
        logic: logic || 'AND',
        authorId: (session.user as any).id,
        conditions: {
          create: conditions.map((cond: any) => ({
            entity: cond.entity,
            operator: cond.operator,
            value: cond.value,
          }))
        }
      },
      include: {
        conditions: true
      }
    });

    return NextResponse.json({ success: true, rule: newRule }, { status: 201 });
  } catch (error) {
    console.error('Failed to create rule:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const rules = await prisma.rule.findMany({
      orderBy: {
        updatedAt: 'desc'
      },
      include: {
        conditions: true
      }
    });

    return NextResponse.json({ rules }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch rules:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
