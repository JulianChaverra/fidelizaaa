import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.FIDE_TOKEN_SECRET

export async function POST(req) {
  try {
    const body = await req.json()
    const { telefono, comercioToken, nombre, correo, usuarioId, autoAfiliacion } = body

    // 1. Validar datos según el flujo
    if (!comercioToken) {
      return NextResponse.json({ error: 'Falta token de comercio' }, { status: 400 })
    }
    let usuario = null

    if (autoAfiliacion) {
      if (!usuarioId) {
        return NextResponse.json({ error: 'Falta usuarioId en autoafiliación' }, { status: 400 })
      }
      // Buscar usuario existente por ID (NO crear)
      usuario = await prisma.usuario.findUnique({
        where: { id: usuarioId },
      })
      if (!usuario) {
        return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
      }
    } else {
      if (!telefono || !nombre || !correo) {
        return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
      }
      // Buscar o crear usuario por teléfono
      usuario = await prisma.usuario.findUnique({
        where: { telefono },
      })

      if (!usuario) {
        usuario = await prisma.usuario.create({
          data: { telefono, nombre, correo },
        })
      } else {
        usuario = await prisma.usuario.update({
          where: { id: usuario.id },
          data: {
            nombre: usuario.nombre || nombre,
            correo: usuario.correo || correo,
          },
        })
      }
    }

    // 2. Decodificar el token de comercio
    let comercioId
    try {
      const decoded = jwt.verify(comercioToken, JWT_SECRET)
      comercioId = decoded.comercioId
    } catch {
      return NextResponse.json({ error: 'Token de comercio inválido' }, { status: 401 })
    }

    // 3. Buscar comercio por ID
    const comercio = await prisma.comercio.findUnique({
      where: { id: comercioId },
    })

    if (!comercio) {
      return NextResponse.json({ error: 'Comercio no encontrado' }, { status: 404 })
    }

    // 4. Vincular usuario a comercio si no está vinculado
    const relacionExistente = await prisma.usuarioComercio.findUnique({
      where: {
        usuarioId_comercioId: {
          usuarioId: usuario.id,
          comercioId: comercio.id,
        },
      },
    })

    if (!relacionExistente) {
      await prisma.usuarioComercio.create({
        data: {
          usuario: { connect: { id: usuario.id } },
          comercio: { connect: { id: comercio.id } },
        },
      })
    }

    // 5. Generar token seguro de usuario+comercio
    const token = jwt.sign(
      {
        usuarioId: usuario.id,
        comercioId: comercio.id,
      },
      JWT_SECRET,
      { expiresIn: '10y' }
    )

    return NextResponse.json({
      success: true,
      token,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
