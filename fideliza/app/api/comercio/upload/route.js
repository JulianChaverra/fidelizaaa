import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url)
    const rawFilename = searchParams.get('filename') || 'comercio-logo'

    // Normalizar el nombre del archivo (minúsculas, eliminar caracteres especiales)
    const extension = rawFilename.split('.').pop() || 'png'
    const nameWithoutExt = rawFilename.substring(0, rawFilename.lastIndexOf('.')) || rawFilename

    const cleanSlug = nameWithoutExt
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')

    const finalFilename = `${cleanSlug}-logo.${extension}`

    if (!request.body) {
      return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400 })
    }

    // Subir a Vercel Blob (addRandomSuffix: false garantiza que si se vuelve a subir
    // con el mismo nombre, mantenga el reemplazo del logo existente)
    const blob = await put(finalFilename, request.body, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true
    })

    return NextResponse.json(blob)
  } catch (error) {
    console.error('Error al subir imagen a Vercel Blob:', error)
    return NextResponse.json({ error: 'Error al procesar la imagen' }, { status: 500 })
  }
}