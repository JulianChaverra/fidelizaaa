import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req) {
  try {
    const { usuarioId, playerId } = await req.json()

    if (!usuarioId || !playerId) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    await prisma.usuario.update({
      where: { id: usuarioId },
      data: { tokenNotificaciones: playerId }
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('❌ Error en /api/usuario/push:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
