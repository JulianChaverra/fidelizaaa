// /api/comercio/login/route.js
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import nodemailer from 'nodemailer'

const prisma = new PrismaClient()

export async function POST(req) {
  try {
    const { correo } = await req.json()
    if (!correo) return NextResponse.json({ error: 'Correo requerido' }, { status: 400 })

    const comercio = await prisma.comercio.findUnique({ where: { correo } })
    if (!comercio) return NextResponse.json({ error: 'No existe un comercio con este correo' }, { status: 404 })

    const codigo = Math.floor(100000 + Math.random() * 900000).toString()
    await prisma.comercio.update({ where: { id: comercio.id }, data: { codigoLogin: codigo } })

    console.log('🔐 Credenciales SMTP:', {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
      })

    // ENVÍA CORREO (configura tus credenciales en .env)
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // true para 465, false para 587
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    })

    await transporter.sendMail({
      from: 'Fideliza <no-reply@fideliza.com>',
      to: correo,
      subject: 'Tu código de acceso a Fideliza',
      text: `Hola, tu código de acceso es: ${codigo}`
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error login comercio:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
