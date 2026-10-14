import { NextResponse } from 'next/server'
import { PrismaClient, TipoTransaccion } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.FIDE_TOKEN_SECRET

export async function POST(req) {
  try {
    const body = await req.json()
    const { token, puntos, nota } = body

    if (!token || typeof puntos !== 'number' || puntos <= 0) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }

    const data = jwt.verify(token, JWT_SECRET)
    const { usuarioId, comercioId } = data

    const relacion = await prisma.usuarioComercio.findUnique({
      where: {
        usuarioId_comercioId: {
          usuarioId,
          comercioId
        }
      }
    })

    if (!relacion) {
      return NextResponse.json({ error: 'El usuario no está afiliado a este comercio' }, { status: 404 })
    }

    await prisma.usuarioComercio.update({
      where: {
        usuarioId_comercioId: {
          usuarioId,
          comercioId
        }
      },
      data: {
        puntos: { increment: puntos }
      }
    })

    await prisma.transaccion.create({
      data: {
        usuarioComercio: { connect: { id: relacion.id } },
        comercio: { connect: { id: comercioId } },
        tipo: TipoTransaccion.add,
        puntos,
        nota: nota || null
      }
    })

    return NextResponse.json({ success: true, mensaje: 'Puntos cargados correctamente' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Token inválido o error interno' }, { status: 500 })
  }
}
