import { Header } from "@/lib/components/core/components/header";
import { Banner } from "@/lib/components/core/components/banner";
import { CardDownloadExcel } from "@/lib/components/core/components/card-download-excel";
import { NotificacionDesplazamientoTrabajadorForm } from "@/lib/components/notificacion-desplazamiento-trabajador";
import { Suspense } from "react";

function FormularioNotificacionDesplazamientoTrabajadorFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando formulario...</p>
      </div>
    </div>
  )
}

export default function NotificacionDesplazamientoTrabajador() {
  return (
    <main>
      <Header />
      <div className="w-full flex flex-col items-center justify-items-center gap-6 px-4 py-8 bg-gray-50 min-h-screen">
        <Banner
          title="Notificación Desplazamiento Trabajador"
          description="Complete todos los campos requeridos para registrar la notificación de desplazamiento del trabajador."
        />
        <CardDownloadExcel
          title="¿Necesitas cargar varios registros a la vez?"
          description="Descarga nuestra plantilla base en Excel, diligénciala con la información de cada notificación de desplazamiento y súbela fácilmente mediante la opción de carga masiva."
          fileTitle="Descargar Plantilla Notificación Desplazamiento Trabajador"
          file="https://agjsaigtrimzgwxqldfx.supabase.co/storage/v1/object/public/assets/14-PLANTILLA%20NOTIFICACION%20DESPLAZAMIENTO%20TRABAJADOR%20(1).xlsx"
        />
        <Suspense fallback={<FormularioNotificacionDesplazamientoTrabajadorFallback />}>
          <NotificacionDesplazamientoTrabajadorForm />
        </Suspense>
      </div>
    </main>
  )
} 