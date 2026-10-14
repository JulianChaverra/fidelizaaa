import { Suspense } from "react";
import ValidandoPagoComercio from "./ValidandoPagoComercio";

export default function Page() {
  return (
    <Suspense fallback={<div className="registro-main validando-main"><div className="loader"></div><p>Validando tu pago...</p></div>}>
      <ValidandoPagoComercio />
    </Suspense>
  )
}
