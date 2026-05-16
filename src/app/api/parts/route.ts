import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const parts = await prisma.part.findMany({
      orderBy: { name: 'asc' },
    });

    const payload = parts.map((part) => ({
      id: part.id,
      sku: part.sku,
      name: part.name,
      warehouseLocation: part.warehouseLocation,
      price: Number(part.price),
      quantity: part.quantity,
      reserved: part.reserved,
    }));

    return NextResponse.json(payload);
  } catch (error) {
    console.error('Failed to fetch parts for quotes', error);
    return NextResponse.json(
      { error: 'Nie udało się pobrać części z magazynu' },
      { status: 500 },
    );
  }
}

