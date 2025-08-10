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
import type { Registro } from "../types/novedad-actualizacion-cargo-types"

interface EnvioRegistroProps {
  registros: Registro[]
  open: boolean
  onClose: () => void
}

export function EnvioRegistro({ registros, open, onClose }: EnvioRegistroProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { limpiarTodosLosRegistros, agregarRegistro } = useRegistroStore()

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
      const novedadesJson = registros.map(registro => ({
        TIPO_DOCUMENTO_EMPLEADOR: registro.tipo_doc_empleador,
        DOCUMENTO_EMPLEADOR: registro.documento_empleador,
        CODIGO_SUBEMPRESA: registro.codigo_subempresa,
        TIPO_DOCUMENTO_TRABAJADOR: registro.tipo_doc_trabajador,
        DOCUMENTO_TRABAJADOR: registro.documento_trabajador,
        TIPO_VINCULACION: registro.tipo_vinculacion,
        ID_CARGO: registro.cargo_nuevo
      }))

      const { data, error } = await supabase.rpc('procesar_novedad_actualizacion_cargo', {
        novedades_json: novedadesJson
      })

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
        let successCount = 0
        let errorCount = 0
        const errores = []
        const registrosFallidos: Registro[] = []

        for (let i = 0; i < data.length; i++) {
          const resultado = data[i]
          const registroOriginal = registros[i]
          
          if (resultado.status === 'Éxito') {
            successCount++
          } else {
            errorCount++
            errores.push(`Documento ${resultado.documento_trabajador}: ${resultado.status}`)
            registrosFallidos.push(registroOriginal)
            console.error(`Error en documento ${resultado.documento_trabajador}:`, resultado.status)
          }
        }

        if (errorCount === 0) {
          limpiarTodosLosRegistros()
          toast.success({
            title: "¡Registros procesados exitosamente!",
            description: `Se procesaron ${successCount} cambios de cargo.`,
          })
          onClose()
        } else {
          limpiarTodosLosRegistros()
          
          registrosFallidos.forEach(registro => {
            const registroFallido: Registro = {
              ...registro,
              id: `error-${Date.now()}-${Math.random()}`
            }
            agregarRegistro(registroFallido)
          })
          
          const errorMessage = errores.slice(0, 3).join('\n')
          const remainingErrors = errores.length > 3 ? ` y ${errores.length - 3} errores más` : ''
          
          toast.error({
            title: "Error en el procesamiento",
            description: `${successCount} registros procesados exitosamente, ${errorCount} fallaron.\n\n${errorMessage}${remainingErrors}\n\nLos registros fallidos se mantienen en la lista para su corrección.`,
          })
        }
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
                <li>• Se registrarán las novedades de actualización de cargo</li>
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