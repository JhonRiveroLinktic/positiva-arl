import { Header } from "@/lib/components/core/components/header";
import { Banner } from "@/lib/components/core/components/banner";
import { RetiroTrabajadoresForm } from "@/lib/components/retiro-trabajadores";
import { Suspense } from "react";
import { CardDownloadExcel } from "@/lib/components/core/components/card-download-excel";

function FormularioRetiroTrabajadoresFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando formulario...</p>
      </div>
    </div>
  )
}

export default function RetiroTrabajadores() {
  return (
    <main>
      <Header />
      <div className="w-full flex flex-col items-center justify-items-center gap-6 px-4 py-8 bg-gray-50 min-h-screen">
        <Banner 
          title="Plantilla de Retiro de Trabajadores" 
          description="Complete todos los campos requeridos para procesar el retiro de trabajadores." 
        /> 
        <CardDownloadExcel
          title="¿Necesitas cargar varios registros a la vez?"
          description="Descarga nuestra plantilla base en Excel, diligénciala con la información de cada trabajador y empleador y súbela fácilmente mediante la opción de carga masiva."
          fileTitle="Descargar Plantilla de Retiro de Trabajador"
          file="https://agjsaigtrimzgwxqldfx.supabase.co/storage/v1/object/public/assets//10-PLANTILLA%20RETIRO%20TRABAJADOR.xlsx"
        />
        <Suspense fallback={<FormularioRetiroTrabajadoresFallback />}>
          <RetiroTrabajadoresForm />
        </Suspense>
      </div>
    </main>
  )
}