import { Suspense } from "react"
import { ProtectedRoute } from "@/lib/components/core/auth/protected-route"
import { Header } from "@/lib/components/core/components/header"
import { ActualizacionValorContratoForm } from "@/lib/components/actualizacion-valor-contrato"
import { Banner } from "@/lib/components/core/components/banner";

function FormularioActualizacionValorContratoFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-600 border-r-transparent"></div>
        <p className="mt-4 text-gray-600">Cargando formulario...</p>
      </div>
    </div>
  )
}

export default function ActualizacionValorContratoPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="w-full flex flex-col items-center justify-items-center gap-6 px-4 py-8 bg-gray-50 min-h-screen">
            <Banner 
                title="Actualización de Valor de Contrato" 
                description="Actualice el valor del contrato de trabajadores dependientes e independientes" 
            /> 
            <Suspense fallback={<FormularioActualizacionValorContratoFallback />}>
              <ActualizacionValorContratoForm />
            </Suspense>
        </div>
      </div>
    </ProtectedRoute>
  )
}



