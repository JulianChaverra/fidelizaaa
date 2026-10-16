import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.FIDE_TOKEN_SECRET

export async function POST(req) {
  try {
    const body = await req.json()
    const { telefono, comercioToken, nombre, correo, usuarioId, autoAfiliacion } = body

    // 1. Validar requerimiento de token de comercio
    if (!comercioToken) {
      return NextResponse.json({ error: 'Falta token de comercio' }, { status: 400 })
    }
    
    let usuario = null

    if (autoAfiliacion) {
      if (!usuarioId) {
        return NextResponse.json({ error: 'Falta usuarioId en autoafiliación' }, { status: 400 })
      }
      // Buscar usuario existente por ID (Flujo de Autoafiliación)
      usuario = await prisma.usuario.findUnique({
        where: { id: usuarioId },
      })
      if (!usuario) {
        return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
      }
    } else {
      if (!correo || !nombre || !telefono) {
        return NextResponse.json({ error: 'Faltan datos obligatorios (correo, nombre, teléfono)' }, { status: 400 })
      }

      const cleanCorreo = correo.trim().toLowerCase()
      const cleanTelefono = telefono.trim()
      const cleanNombre = nombre.trim()

      // 2. Prioridad en la búsqueda por CORREO ELECTRÓNICO
      usuario = await prisma.usuario.findUnique({
        where: { correo: cleanCorreo },
      })

      if (!usuario) {
        // Si NO existe el correo, creamos el usuario desde cero
        usuario = await prisma.usuario.create({
          data: { 
            correo: cleanCorreo,
            telefono: cleanTelefono, 
            nombre: cleanNombre 
          },
        })
      } else {
        // Si SÍ existe por correo, actualizamos su teléfono y nombre con los valores actuales
        usuario = await prisma.usuario.update({
          where: { id: usuario.id },
          data: {
            telefono: cleanTelefono,
            nombre: cleanNombre,
          },
        })
      }
    }

    // 3. Decodificar el token de comercio
    let comercioId
    try {
      const decoded = jwt.verify(comercioToken, JWT_SECRET)
      comercioId = decoded.comercioId
    } catch {
      return NextResponse.json({ error: 'Token de comercio inválido' }, { status: 401 })
    }

    // 4. Buscar el comercio destino
    const comercio = await prisma.comercio.findUnique({
      where: { id: comercioId },
    })

    if (!comercio) {
      return NextResponse.json({ error: 'Comercio no encontrado' }, { status: 404 })
    }

    // 5. Vincular usuario y comercio si no existe la relación
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

    // 6. Generar JWT de sesión para la PWA de Tarjetas
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
    console.error('=== ERROR AL AFILIAR/REGISTRAR USUARIO ===', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', detalle: error.message },
      { status: 500 }
    )
  }
}