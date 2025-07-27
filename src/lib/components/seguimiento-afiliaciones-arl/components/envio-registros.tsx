"use client"

import { useState } from "react"
import { Button } from "@/lib/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/lib/components/ui/dialog"
import { Alert, AlertDescription } from "@/lib/components/ui/alert"
import { Input } from "@/lib/components/ui/input"
import { Label } from "@/lib/components/ui/label"
import { supabase } from "@/lib/utils/supabase"
import { toast } from "@/lib/utils/toast"
import { useRegistroStore } from "../stores/registro-store"
import { convertToSupabaseFormat } from "../types/seguimiento-arl-registration"
import { Send, Loader2, Info, Download } from "lucide-react"
import type { Registro } from "@/lib/components/seguimiento-afiliaciones-arl/types/seguimiento-arl-registration"

interface EnvioRegistroProps {
  registros: Registro[]
  open: boolean
  onClose: () => void
}

export function EnvioRegistro({ registros, open, onClose }: EnvioRegistroProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [datosContacto, setDatosContacto] = useState({
    nombre: "",
    correo: "",
    telefono: "",
  })
  const { limpiarTodosLosRegistros } = useRegistroStore()

  const handleEnviarRegistros = async () => {
    if (registros.length === 0) {
      toast.warning({
        title: "Sin registros",
        description: "No hay registros para enviar a la base de datos.",
      })
      return
    }

                   // Validar datos de contacto requeridos
      if (!datosContacto.nombre.trim() || !datosContacto.correo.trim()) {
        toast.error({
          title: "Datos de contacto requeridos",
          description: "Complete nombre y correo electrónico para continuar.",
        })
        return
      }

    setIsSubmitting(true)

    try {
             const registrosParaEnviar = registros.map(registro => ({
         ...convertToSupabaseFormat(registro),
         nombre_contacto: datosContacto.nombre,
         correo_contacto: datosContacto.correo,
         telefono_contacto: datosContacto.telefono || undefined,
       }))

      const { data, error } = await supabase
        .from("registros_arl_seguimiento")
        .insert(registrosParaEnviar)
        .select()

      if (error) {
        console.error("Error al insertar registros:", error)

        const msg = error.code === "23505"
          ? "Algunos registros ya existen en la base de datos."
          : error.code === "23502"
          ? "Faltan campos requeridos en algunos registros."
          : error.message

        toast.error({
          title: "Error al enviar registros",
          description: msg,
        })

        return
      }

      limpiarTodosLosRegistros()
      toast.success({
        title: "¡Registros enviados exitosamente!",
        description: `Se enviaron ${data?.length || registros.length} registros correctamente.`,
      })

      onClose()
    } catch (error) {
      console.error("Error inesperado:", error)
      toast.error({
        title: "Error inesperado",
        description: "Ocurrió un error inesperado. Intente nuevamente.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Confirmar envío de registros
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert className="border-orange-200 bg-orange-50">
            <Info className="h-4 w-4 !text-orange-800 mt-0.5" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium text-orange-800">
                  Si ya eres empleador afiliado a Positiva y necesitas afiliar nuevos trabajadores y/o solicitar certificados de afiliación, ten en cuenta el siguiente procedimiento temporal:
                </p>
                <a 
                  href="https://agjsaigtrimzgwxqldfx.supabase.co/storage/v1/object/public/assets//PLANTILLA%20MASIVA%20DEPENDIENTE.xlsx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-orange-700 hover:text-orange-900 underline font-medium"
                >
                  <Download className="h-4 w-4" />
                  Descargar Plantilla Masiva Dependiente
                </a>
              </div>
            </AlertDescription>
          </Alert>

          <div className="bg-green-50 p-5 rounded-md border border-gray-200">
            <p className="text-lg text-green-800 mb-4">
              Datos de Contacto:
            </p>
                         <div className="space-y-3">
               <div className="space-y-2">
                 <Label htmlFor="nombre-contacto" className="text-sm font-medium text-green-800">
                   Nombre Completo *
                 </Label>
                 <Input
                   id="nombre-contacto"
                   placeholder="Ingrese su nombre completo"
                   value={datosContacto.nombre}
                   onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDatosContacto(prev => ({ ...prev, nombre: e.target.value }))}
                   className="border-green-300 focus:border-green-500 focus:ring-green-500"
                 />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="correo-contacto" className="text-sm font-medium text-green-800">
                   Correo Electrónico *
                 </Label>
                 <Input
                   id="correo-contacto"
                   type="email"
                   placeholder="Ingrese su correo electrónico"
                   value={datosContacto.correo}
                   onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDatosContacto(prev => ({ ...prev, correo: e.target.value }))}
                   className="border-green-300 focus:border-green-500 focus:ring-green-500"
                 />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="telefono-contacto" className="text-sm font-medium text-green-800">
                   Teléfono (opcional)
                 </Label>
                 <Input
                   id="telefono-contacto"
                   placeholder="Ej: 3108521310 (celular) o 1234567 (fijo)"
                   value={datosContacto.telefono}
                   onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDatosContacto(prev => ({ ...prev, telefono: e.target.value }))}
                   className="border-green-300 focus:border-green-500 focus:ring-green-500"
                 />
               </div>
                               <p className="text-xs text-green-700 mt-2">
                  * Complete nombre y correo electrónico. Teléfono es opcional.
                </p>
             </div>
          </div>

          <Alert variant="destructive" className="bg-green-50">
            <AlertDescription>
              <p className="text-sm text-black">
                <strong>Resumen:</strong> Se enviarán {registros.length} registro(s) para procesamiento.
              </p>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="gap-2 sm:justify-end">
          <DialogClose asChild>
            <Button variant="outline" disabled={isSubmitting}>Cancelar</Button>
          </DialogClose>
          <Button
            onClick={handleEnviarRegistros}
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Sí, Enviar Registros
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}