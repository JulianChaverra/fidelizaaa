import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function POST(req) {
  const { comercioId } = await req.json()
  if (!comercioId) return NextResponse.json({ error: 'ComercioId requerido' }, { status: 400 })

  const premios = await prisma.premio.findMany({
    where: { comercioId },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json({ premios })
}
