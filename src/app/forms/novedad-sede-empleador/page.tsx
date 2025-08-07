import { Header } from "@/lib/components/core/components/header";
import { Banner } from "@/lib/components/core/components/banner";
import { CardDownloadExcel } from "@/lib/components/core/components/card-download-excel";
import { NovedadSedeEmpleadorForm } from "@/lib/components/novedad-sede-empleador";
import { Suspense } from "react";

function FormularioNovedadSedeEmpleadorFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando formulario...</p>
      </div>
    </div>
  )
}

export default function NovedadSedeEmpleador() {
  return (
    <main>
      <Header />
      <div className="w-full flex flex-col items-center justify-items-center gap-6 px-4 py-8 bg-gray-50 min-h-screen">
        <Banner
          title="Novedad Sede Empleador"
          description="Complete todos los campos requeridos para registrar la información de la sede del empleador."
        />
        <CardDownloadExcel
          title="¿Necesitas cargar varios registros a la vez?"
          description="Descarga nuestra plantilla base en Excel, diligénciala con la información de cada sede de empleador y súbela fácilmente mediante la opción de carga masiva."
          fileTitle="Descargar Plantilla Novedad Sede Empleador"
          file="https://agjsaigtrimzgwxqldfx.supabase.co/storage/v1/object/public/assets/12-PLANTILLA%20NOVEDAD%20SEDE%20EMPLEADOR.xlsx"
        />
        <Suspense fallback={<FormularioNovedadSedeEmpleadorFallback />}>
          <NovedadSedeEmpleadorForm />
        </Suspense>
      </div>
    </main>
  )
} 