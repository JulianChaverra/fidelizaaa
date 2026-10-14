// /app/api/usuario/tarjetas/route.js
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req) {
  try {
    const { usuarioId } = await req.json()

    if (!usuarioId) {
      return NextResponse.json({ error: 'usuarioId requerido' }, { status: 400 })
    }

    const tarjetas = await prisma.usuarioComercio.findMany({
      where: { usuarioId },
      include: {
        comercio: {
          select: {
            id: true,
            slug:true,
            nombre: true,
            logoUrl: true,
            color: true
          }
        }
      }
    })

    const resultado = tarjetas.map(t => ({
      comercioId: t.comercio.id,
      nombre: t.comercio.nombre,
      slug: t.comercio.slug,
      logoUrl: t.comercio.logoUrl,
      color: t.comercio.color,
      puntos: t.puntos
    }))

    return NextResponse.json({ tarjetas: resultado })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
