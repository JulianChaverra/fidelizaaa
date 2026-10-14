import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function POST(req) {
  const { comercioId, nombre, imagenUrl, valorPuntos } = await req.json()
  if (!comercioId || !nombre || !valorPuntos) {
    return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
  }
  const premio = await prisma.premio.create({
    data: { comercioId, nombre, imagenUrl, valorPuntos }
  })
  return NextResponse.json({ premio })
}
