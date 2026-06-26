import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEFAULT_PLANT_PRESETS = [
  { label: "Sayuran & Buah", keringPct: 70, basahPct: 95, icon: "🍅" },
  { label: "Tanaman Hias", keringPct: 50, basahPct: 90, icon: "🌿" },
  { label: "Kaktus/Sukulen", keringPct: 20, basahPct: 40, icon: "🌵" },
  { label: "Tanaman Air", keringPct: 80, basahPct: 100, icon: "🌾" }
];

// GET: Ambil semua preset berdasarkan deviceId
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');

    if (!deviceId) {
      return NextResponse.json({ error: 'deviceId is required' }, { status: 400 });
    }

    const presets = await prisma.plantPreset.findMany({
      where: { deviceId },
      orderBy: { urutan: 'asc' }
    });

    if (presets.length === 0) {
      const defaults = DEFAULT_PLANT_PRESETS.map((p, index) => ({
        ...p,
        deviceId,
        urutan: index
      }));
      
      await prisma.plantPreset.createMany({
        data: defaults
      });

      const newPresets = await prisma.plantPreset.findMany({
        where: { deviceId },
        orderBy: { urutan: 'asc' }
      });
      return NextResponse.json({ presets: newPresets });
    }

    return NextResponse.json({ presets });
  } catch (error) {
    console.error('Error fetching presets:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Buat preset baru
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { deviceId, label, icon, keringPct, basahPct } = body;

    if (!deviceId || !label || !icon || keringPct === undefined || basahPct === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Hitung urutan terakhir
    const lastPreset = await prisma.plantPreset.findFirst({
      where: { deviceId },
      orderBy: { urutan: 'desc' }
    });
    
    const newUrutan = lastPreset ? lastPreset.urutan + 1 : 0;

    const newPreset = await prisma.plantPreset.create({
      data: {
        deviceId,
        label,
        icon,
        keringPct,
        basahPct,
        urutan: newUrutan
      }
    });

    return NextResponse.json({ preset: newPreset }, { status: 201 });
  } catch (error) {
    console.error('Error creating preset:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT: Update urutan secara bulk (untuk drag & drop)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { presets } = body; // array of { id, urutan }

    if (!presets || !Array.isArray(presets)) {
      return NextResponse.json({ error: 'Invalid presets array' }, { status: 400 });
    }

    // Gunakan transaksi agar atomic
    const updates = presets.map((p: any) => 
      prisma.plantPreset.update({
        where: { id: p.id },
        data: { urutan: p.urutan }
      })
    );

    await prisma.$transaction(updates);

    return NextResponse.json({ message: 'Presets reordered successfully' });
  } catch (error) {
    console.error('Error reordering presets:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE: Hapus preset berdasarkan id
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    await prisma.plantPreset.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Preset deleted' });
  } catch (error) {
    console.error('Error deleting preset:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
