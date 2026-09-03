import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const birthData = await req.json();

    // 1. Fetch real rules from the PostgreSQL Database
    const dbRules = await prisma.rule.findMany({
      include: {
        conditions: true
      }
    });

    // 2. Format them for the Python Astro Engine
    const formattedRules = dbRules.map(rule => ({
      id: rule.id,
      name: rule.name,
      description: rule.description,
      logic: rule.logic || "AND",
      conditions: rule.conditions.map(c => ({
        entity: c.entity,
        operator: c.operator,
        value: c.value
      }))
    }));

    // 3. Call the Python FastAPI Backend
    const response = await fetch('http://127.0.0.1:8000/api/evaluate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        birth_data: birthData,
        rules: formattedRules
      }),
    });

    if (!response.ok) {
      throw new Error(`Python API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Evaluation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
