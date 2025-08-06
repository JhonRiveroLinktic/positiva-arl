import { Header } from "@/lib/components/core/components/header";
import { Banner } from "@/lib/components/core/components/banner";
import { CardDownloadExcel } from "@/lib/components/core/components/card-download-excel";
import { ProrrogaFechaContratoTrabajadorIndependienteForm } from "@/lib/components/prorroga-fecha-contrato-trabajador-independiente";
import { Suspense } from "react";

function FormularioProrrogaFechaContratoTrabajadorIndependienteFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando formulario...</p>
      </div>
    </div>
  )
}

export default function ProrrogaFechaContratoTrabajadorIndependiente() {
  return (
    <main>
      <Header />
      <div className="w-full flex flex-col items-center justify-items-center gap-6 px-4 py-8 bg-gray-50 min-h-screen">
        <Banner 
          title="Prorroga de Fecha de Contrato Trabajador Independiente" 
          description="Complete todos los campos requeridos para procesar la prórroga de fecha de contrato del trabajador independiente." 
        /> 
        <CardDownloadExcel
          title="¿Necesitas cargar varios registros a la vez?"
          description="Descarga nuestra plantilla base en Excel, diligénciala con la información de cada trabajador y contratante y súbela fácilmente mediante la opción de carga masiva."
          fileTitle="Descargar Plantilla Prorroga de Fecha de Contrato Trabajador Independiente"
          file="https://agjsaigtrimzgwxqldfx.supabase.co/storage/v1/object/public/assets/07-AJUSTE%20FECHA%20DE%20CONTRATO%20PRORROGA%20TRABAJADOR%20INDEPENDIENTE.xlsx"
        />
        <Suspense fallback={<FormularioProrrogaFechaContratoTrabajadorIndependienteFallback />}>
          <ProrrogaFechaContratoTrabajadorIndependienteForm />
        </Suspense>
      </div>
    </main>
  )
}