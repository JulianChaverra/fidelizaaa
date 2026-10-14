import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function POST(req) {
  try {
    const body = await req.json()
    const { correo, codigo } = body

    if (!correo || !codigo) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    const usuario = await prisma.usuario.findUnique({
      where: { correo }
    })

    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    if (usuario.codigoLogin !== codigo) {
      return NextResponse.json({ error: 'Código incorrecto' }, { status: 401 })
    }

     // Borrar el códigoLogin después de validar
     await prisma.usuario.update({where: { id: usuario.id },data: { codigoLogin: null }})

    return NextResponse.json({
      success: true,
      usuarioId: usuario.id,
      nombre: usuario.nombre || ''
    })
  } catch (error) {
    console.error('Error validando usuario:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
