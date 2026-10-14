import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.FIDE_TOKEN_SECRET

export async function POST(req) {
  try {
    const body = await req.json()
    const { token } = body

    if (!token) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 400 })
    }

    const data = jwt.verify(token, JWT_SECRET)
    const { usuarioId, comercioId } = data

    // Buscar relación
    const relacion = await prisma.usuarioComercio.findUnique({
      where: {
        usuarioId_comercioId: {
          usuarioId,
          comercioId
        }
      }
    })

    if (!relacion) {
      return NextResponse.json({ error: 'Relación no encontrada' }, { status: 404 })
    }

    // Traer historial
    const transacciones = await prisma.transaccion.findMany({
      where: {
        usuarioComercioId: relacion.id
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ transacciones })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Token inválido o error interno' }, { status: 500 })
  }
}
