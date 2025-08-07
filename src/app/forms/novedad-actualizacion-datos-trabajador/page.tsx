import { Header } from "@/lib/components/core/components/header";
import { Banner } from "@/lib/components/core/components/banner";
import { CardDownloadExcel } from "@/lib/components/core/components/card-download-excel";
import { NovedadActualizacionDatosTrabajadorForm } from "@/lib/components/novedad-actualizacion-datos-trabajador";
import { Suspense } from "react";

function FormularioNovedadActualizacionDatosTrabajadorFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando formulario...</p>
      </div>
    </div>
  )
}

export default function NovedadActualizacionDatosTrabajador() {
  return (
    <main>
      <Header />
      <div className="w-full flex flex-col items-center justify-items-center gap-6 px-4 py-8 bg-gray-50 min-h-screen">
        <Banner 
          title="Actualización de Datos de Trabajador" 
          description="Complete todos los campos requeridos para procesar el cambio de Datos de Trabajador." 
        /> 
        <CardDownloadExcel
          title="¿Necesitas cargar varios registros a la vez?"
          description="Descarga nuestra plantilla base en Excel, diligénciala con la información de cada trabajador y súbela fácilmente mediante la opción de carga masiva."
          fileTitle="Descargar Plantilla Actualización de Datos de Trabajador"
          file=""
        />
        <Suspense fallback={<FormularioNovedadActualizacionDatosTrabajadorFallback />}>
          <NovedadActualizacionDatosTrabajadorForm />
        </Suspense>
      </div>
    </main>
  )
}