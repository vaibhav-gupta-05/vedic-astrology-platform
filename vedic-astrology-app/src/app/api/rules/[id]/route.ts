import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await prisma.rule.delete({
      where: { id }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete rule:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const rule = await prisma.rule.findUnique({
      where: { id },
      include: { conditions: true }
    });

    if (!rule) {
      return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
    }

    return NextResponse.json({ rule }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch rule:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const data = await req.json();
    const { name, description, logic, conditions } = data;

    // Delete old conditions and create new ones in a transaction
    const updatedRule = await prisma.$transaction(async (tx) => {
      await tx.condition.deleteMany({
        where: { ruleId: id }
      });

      return tx.rule.update({
        where: { id },
        data: {
          name,
          description,
          logic: logic || 'AND',
          conditions: {
            create: conditions.map((cond: any) => ({
              entity: cond.entity,
              operator: cond.operator,
              value: cond.value,
            }))
          }
        },
        include: { conditions: true }
      });
    });

    return NextResponse.json({ success: true, rule: updatedRule }, { status: 200 });
  } catch (error) {
    console.error('Failed to update rule:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
