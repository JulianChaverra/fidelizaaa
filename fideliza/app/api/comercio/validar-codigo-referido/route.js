// /app/api/comercio/validar-codigo-referido/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const VALOR_BASE = 24900;

export async function POST(req) {
  try {
    const { codigo } = await req.json();

    if (!codigo) {
      return NextResponse.json({
        success: true,
        tipo: null,
        valorAPagar: VALOR_BASE,
      });
    }

    // Busca el código en la tabla CodigoReferido y que esté activo
    const cod = await prisma.codigoReferido.findFirst({
      where: {
        codigo: codigo.trim(),
        activo: true,
      },
      include: { comercio: true },
    });

    if (!cod) {
      return NextResponse.json({
        success: false,
        error: "Código no válido",
        valorAPagar: VALOR_BASE,
      });
    }

    // Si es tipo fideliza => GRATIS
    if (cod.tipo === "fideliza") {
      return NextResponse.json({
        success: true,
        tipo: "fideliza",
        valorAPagar: 0,
        descripcion: cod.descripcion,
      });
    }

    // Si es tipo comercio => cobra, pero válido
    if (cod.tipo === "comercio") {
      return NextResponse.json({
        success: true,
        tipo: "comercio",
        valorAPagar: VALOR_BASE,
        comercioId: cod.comercioId,
        slug: cod.comercio?.slug || null,
        descripcion: cod.descripcion,
      });
    }

    // Si en un futuro tienes otros tipos de código...
    // Ejemplo: promos
    if (cod.tipo === "promo") {
      // Puedes definir lógica para descuentos distintos aquí
      return NextResponse.json({
        success: true,
        tipo: "promo",
        valorAPagar: cod.descuentoValor ?? VALOR_BASE,
        descripcion: cod.descripcion,
      });
    }

    // Default (por si acaso)
    return NextResponse.json({
      success: false,
      error: "Código no válido",
      valorAPagar: VALOR_BASE,
    });
  } catch (error) {
    console.error("Error validando código referido:", error);
    return NextResponse.json({
      success: false,
      error: "Error interno del servidor",
      valorAPagar: VALOR_BASE,
    }, { status: 500 });
  }
}
