// app/api/comercio/config/route.js
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const FIDE_TOKEN_SECRET = process.env.FIDE_TOKEN_SECRET || "thisisthesecretkey4737593604"

export async function POST(request) {
  try {
    const { token, logoUrl, color } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 401 })
    }

    // Verificar credenciales del comercio
    const decoded = jwt.verify(token, FIDE_TOKEN_SECRET)
    const comercioId = decoded.comercioId

    if (!comercioId) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 400 })
    }

    // Actualizar registro en Postgres/Neon DB
    const comercioActualizado = await prisma.comercio.update({
      where: { id: comercioId },
      data: {
        ...(logoUrl && { logoUrl }),
        ...(color && { color }),
      },
    })

    return NextResponse.json({
      success: true,
      comercio: comercioActualizado,
    })
  } catch (error) {
    console.error('Error al actualizar configuración:', error)
    return NextResponse.json({ error: 'Error interno al guardar cambios' }, { status: 500 })
  }
}