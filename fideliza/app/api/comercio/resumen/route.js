import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req) {
  try {
    const body = await req.json()
    const { comercioId } = body

    if (!comercioId) {
      return NextResponse.json({ error: 'comercioId requerido' }, { status: 400 })
    }

    const comercio = await prisma.comercio.findUnique({
      where: { id: comercioId }
    })

    if (!comercio) {
      return NextResponse.json({ error: 'Comercio no encontrado' }, { status: 404 })
    }

    const totalUsuarios = await prisma.usuarioComercio.count({
      where: { comercioId }
    })

    const totalPuntos = await prisma.usuarioComercio.aggregate({
      where: { comercioId },
      _sum: { puntos: true }
    })

    const totalTransacciones = await prisma.transaccion.count({
      where: { comercioId }
    })

    return NextResponse.json({
      resumen: {
        nombre: comercio.nombre,
        color: comercio.color,
        slug: comercio.slug,
        creado: comercio.createdAt,
        totalUsuarios,
        totalTransacciones,
        puntosEnCirculacion: totalPuntos._sum.puntos || 0
      }
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
