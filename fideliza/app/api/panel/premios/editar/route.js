import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function POST(req) {
  const { id, nombre, imagenUrl, valorPuntos, activo } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
  const premio = await prisma.premio.update({
    where: { id },
    data: { nombre, imagenUrl, valorPuntos, activo }
  })
  return NextResponse.json({ premio })
}
