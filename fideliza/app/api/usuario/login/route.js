// /app/api/usuario/login/route.js
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import nodemailer from 'nodemailer'

const prisma = new PrismaClient()

export async function POST(req) {
  try {
    const { correo } = await req.json()
    if (!correo) return NextResponse.json({ error: 'Correo requerido' }, { status: 400 })

    const usuario = await prisma.usuario.findUnique({ where: { correo } })
    if (!usuario) return NextResponse.json({ error: 'No existe un usuario con este correo' }, { status: 404 })

    const codigo = Math.floor(100000 + Math.random() * 900000).toString()

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { codigoLogin: codigo } // Nuevo campo para OTP de login
    })

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    })

    await transporter.sendMail({
      from: `Fideliza <${process.env.MAIL_USER}>`,
      to: correo,
      subject: 'Tu código de acceso a Fideliza',
      html: `<p>Tu código es: <strong>${codigo}</strong></p>`
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error login usuario:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
