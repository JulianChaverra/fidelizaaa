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
      where: { id: comercioId },
    })

    if (!comercio) {
      return NextResponse.json({ error: 'Comercio no encontrado' }, { status: 404 })
    }

    const usuarios = await prisma.usuarioComercio.findMany({
      where: { comercioId: comercio.id },
      include: {
        usuario: true
      },
      orderBy: { createdAt: 'desc' }
    })

    const resultado = usuarios.map((rel) => ({
      id: rel.usuario.id,
      nombre: rel.usuario.nombre,
      correo: rel.usuario.correo,
      telefono: rel.usuario.telefono,
      puntos: rel.puntos,
      fechaAfiliacion: rel.createdAt
    }))

    return NextResponse.json({ usuarios: resultado })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
