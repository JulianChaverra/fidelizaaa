import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import QRCode from 'qrcode'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.FIDE_TOKEN_SECRET

const VALOR_BASE = 24900
const DIAS_VIGENCIA = 30

// Función para generar código de referido único con dos dígitos aleatorios
async function generarCodigoReferidoUnico(slug) {
  let codigo, existe
  do {
    const randomNum = Math.floor(10 + Math.random() * 90) // dos dígitos entre 10 y 99
    codigo = `${slug}${randomNum}`
    existe = await prisma.codigoReferido.findUnique({ where: { codigo } })
  } while (existe)
  return codigo
}

export async function POST(req) {
  try {
    const body = await req.json()
    const {
      nombre,
      slug,
      tipoDocumento,
      numeroDocumento,
      celular,
      correo,
      nombreContacto,
      correoContacto,
      celularContacto,
      logoUrl,
      color,
      codigoReferido
    } = body

    // Validación básica
    if (
      !nombre || !slug || !tipoDocumento || !numeroDocumento ||
      !celular || !correo || !nombreContacto || !correoContacto || !celularContacto
    ) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 })
    }

    // Validación de slug duplicado
    const existeSlug = await prisma.comercio.findUnique({ where: { slug } })
    if (existeSlug) {
      return NextResponse.json({ error: 'slug-duplicado' }, { status: 409 })
    }

    // Validación de número de documento duplicado
    const existeDocumento = await prisma.comercio.findFirst({
      where: { numeroDocumento }
    })
    if (existeDocumento) {
      return NextResponse.json({ error: 'El comercio ya está registrado' }, { status: 409 })
    }

    // Validación de correo duplicado
    const existeCorreo = await prisma.comercio.findFirst({
      where: { correo }
    })
    if (existeCorreo) {
      return NextResponse.json({ error: 'El comercio ya está registrado' }, { status: 409 })
    }

    // -- Validación de código de referido --
    let esExentoDeCobro = false
    let codigoReferidoId = null
    let tipoCodigoReferido = null
    let descripcionCodigoReferido = null

    if (codigoReferido) {
      const codigo = await prisma.codigoReferido.findFirst({
        where: {
          codigo: codigoReferido.trim(),
          activo: true
        }
      })

      if (!codigo) {
        return NextResponse.json({ error: 'Código de referido no válido' }, { status: 400 })
      }
      codigoReferidoId = codigo.id
      tipoCodigoReferido = codigo.tipo
      descripcionCodigoReferido = codigo.descripcion

      if (codigo.tipo === "fideliza") {
        esExentoDeCobro = true
      } else if (codigo.tipo !== "comercio") {
        // Solo permitimos códigos fideliza o comercio (otros, error)
        return NextResponse.json({ error: 'Código de referido no válido' }, { status: 400 })
      }
    }

    // Calcula fechas de pago/vencimiento si es exento de cobro
    let fechaPago = null
    let fechaVencimiento = null
    if (esExentoDeCobro) {
      fechaPago = new Date()
      fechaVencimiento = new Date(Date.now() + DIAS_VIGENCIA * 24 * 60 * 60 * 1000)
    }

    // Crea el nuevo comercio
    const nuevo = await prisma.comercio.create({
      data: {
        nombre,
        slug,
        tipoDocumento,
        numeroDocumento,
        celular,
        correo,
        nombreContacto,
        correoContacto,
        celularContacto,
        logoUrl: logoUrl || null,
        color: color || null,
        codigoReferido: codigoReferido?.trim() || null,
        esExentoDeCobro,
        activo: esExentoDeCobro,
        fechaPago,
        fechaVencimiento,
      }
    })

    // Genera el propio código de referido del comercio (slug + 2 dígitos aleatorios únicos)
    const codigoReferidoPropio = await generarCodigoReferidoUnico(slug.trim())
    await prisma.codigoReferido.create({
      data: {
        codigo: codigoReferidoPropio,
        tipo: "comercio",
        comercioId: nuevo.id,
        descripcion: `Código de referido de ${nombre}`,
        activo: true
      }
    })

    // Token con slug para el QR
    const token = jwt.sign({ slug }, JWT_SECRET, { expiresIn: '10y' })
    const urlAfiliacion = `https://fidelizaaa.com/afiliar?token=${token}`
    const qrBase64 = await QRCode.toDataURL(urlAfiliacion)
    await prisma.comercio.update({
      where: { id: nuevo.id },
      data: { qrUrl: qrBase64 }
    })

    return NextResponse.json({
      success: true,
      comercioId: nuevo.id,
      slug: nuevo.slug,
      qrUrl: qrBase64,
      esExentoDeCobro,
      fechaPago,
      fechaVencimiento,
      descripcionCodigoReferido,
      requierePago: !esExentoDeCobro
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
