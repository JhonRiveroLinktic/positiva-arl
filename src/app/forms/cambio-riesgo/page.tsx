import { Header } from "@/lib/components/core/components/header";
import { Banner } from "@/lib/components/core/components/banner";
import { CardDownloadExcel } from "@/lib/components/core/components/card-download-excel";
import { CambioRiesgoForm } from "@/lib/components/cambio-riesgo"
import { Suspense } from "react";

function FormularioCambioRiesgoFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando formulario...</p>
      </div>
    </div>
  )
}

export default function CambioRiesgo() {
  return (
    <main>
      <Header />
      <div className="w-full flex flex-col items-center justify-items-center gap-6 px-4 py-8 bg-gray-50 min-h-screen">
        <Banner 
          title="Plantilla de Cambio de Riesgo - Dependiente e Independiente" 
          description="Complete todos los campos requeridos para procesar el cambio de riesgo." 
        /> 
        {/* <CardDownloadExcel /> */}
        <Suspense fallback={<FormularioCambioRiesgoFallback />}>
          <CambioRiesgoForm />
        </Suspense>
      </div>
    </main>
  )
}