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
import { supabase } from "@/lib/utils/supabase"
import { toast } from "@/lib/utils/toast"
import { useRegistroStore } from "../stores/registro-store"
import { Send, Loader2, Info } from "lucide-react"
import type { Registro } from "../types/novedad-actualizacion-datos-types"

interface EnvioRegistroProps {
  registros: Registro[]
  open: boolean
  onClose: () => void
}

export function EnvioRegistro({ registros, open, onClose }: EnvioRegistroProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { limpiarTodosLosRegistros } = useRegistroStore()

  const handleEnviarRegistros = async () => {
    if (registros.length === 0) {
      toast.warning({
        title: "Sin registros",
        description: "No hay registros para enviar a la base de datos.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const { data, error } = await supabase
        .from('novedad_actualizacion_datos_trabajador')
        .insert(registros.map(registro => ({
          tipo_documento_trabajador: registro.tipo_documento_trabajador,
          documento_trabajador: registro.documento_trabajador,
          codigo_eps: registro.codigo_eps,
          codigo_afp: registro.codigo_afp,
          correo_electronico_trabajador: registro.correo_electronico_trabajador,
          fecha_de_nacimiento: registro.fecha_de_nacimiento,
          direccion_de_residencia: registro.direccion_de_residencia,
          telefono_de_residencia: registro.telefono_de_residencia,
          departamento_de_residencia: registro.departamento_de_residencia,
          municipio_de_residencia: registro.municipio_de_residencia,
          metodo_subida: registro.metodo_subida,
        })))
        .select()

      if (error) {
        console.error("Error en el procesamiento:", error)

        const msg = error.code === "23505"
          ? "Algunos registros ya existen en la base de datos."
          : error.code === "23502"
          ? "Faltan campos requeridos en algunos registros."
          : error.message

        toast.error({
          title: "Error al procesar registros",
          description: msg,
        })
        return
      }

      if (data && Array.isArray(data)) {
        limpiarTodosLosRegistros()
        toast.success({
          title: "¡Registros procesados exitosamente!",
          description: `Se procesaron ${data.length} prórrogas de contrato.`,
        })
        onClose()
      }
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
      <DialogContent className="max-w-md">
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
              <p className="font-medium text-orange-800">
                Proceso de envío:
              </p>
              <ul className="text-orange-700 mt-1 text-sm space-y-1">
                <li>• Se registrarán las prórrogas de fecha de contrato</li>
                <li>• Los datos se guardarán para trazabilidad</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              ¿Está seguro de que desea enviar <strong>{registros.length}</strong> registro(s) a la base de datos?
            </p>
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <DialogClose asChild>
              <Button variant="outline" disabled={isSubmitting}>
                Cancelar
              </Button>
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
                  Enviar {registros.length} Registro(s)
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
} 