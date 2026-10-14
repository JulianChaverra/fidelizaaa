import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function POST(req) {
  try {
    const { usuarioId, comercioId } = await req.json()

    if (!usuarioId || !comercioId) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    const token = jwt.sign(
      { usuarioId, comercioId },
      process.env.FIDE_TOKEN_SECRET,
      { expiresIn: '10y' }
    )

    return NextResponse.json({ token })
  } catch (err) {
    console.error('Error generando token:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
