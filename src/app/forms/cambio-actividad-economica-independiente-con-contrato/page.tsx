import { Header } from "@/lib/components/core/components/header";
import { Banner } from "@/lib/components/core/components/banner";
import { CardDownloadExcel } from "@/lib/components/core/components/card-download-excel";
import { CambioActividadEconomicaIndependienteConContratoForm } from "@/lib/components/cambio-actividad-economica-independiente-con-contrato";
import { Suspense } from "react";

function FormularioCambioActividadEconomicaIndependienteConContratoFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando formulario...</p>
      </div>
    </div>
  )
}

export default function CambioActividadEconomicaIndependienteConContrato() {
  return (
    <main>
      <Header />
      <div className="w-full flex flex-col items-center justify-items-center gap-6 px-4 py-8 bg-gray-50 min-h-screen">
        <Banner 
          title="Cambio Actividad Económica a Ejecutar - Independiente con contrato" 
          description="Complete todos los campos requeridos para procesar el cambio de Actividad Económica a ejecutar del trabajador." 
        /> 
        <CardDownloadExcel
          title="¿Necesitas cargar varios registros a la vez?"
          description="Descarga nuestra plantilla base en Excel, diligénciala con la información de cada trabajador y contratante y súbela fácilmente mediante la opción de carga masiva."
          fileTitle="Descargar Plantilla Cambio de Actividad Económica a Ejecutar - Trabajador Independiente con Contrato"
          file="https://agjsaigtrimzgwxqldfx.supabase.co/storage/v1/object/public/assets/05-PLANTILLA%20CAMBIO%20ACTIVIDAD%20ECONOMICA%20A%20EJECUTAR%20TRABAJADOR%20INDEPENDIENTE%20CON%20CONTRATO.xlsx"
        />
        <Suspense fallback={<FormularioCambioActividadEconomicaIndependienteConContratoFallback />}>
          <CambioActividadEconomicaIndependienteConContratoForm />
        </Suspense>
      </div>
    </main>
  )
}