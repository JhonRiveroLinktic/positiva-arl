"use client"

import { useState } from "react"
import { Button } from "@/lib/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/lib/components/ui/dialog"
import { useRegistroStore } from "../stores/registro-store"
import { supabase } from "@/lib/utils/supabase"
import { toast } from "@/lib/utils/toast"
import { Info, Loader2, Send } from "lucide-react"
import type { Registro } from "../types/novedad-actualizacion-datos-empleador-types"
import { Alert, AlertDescription } from "../../ui/alert"

interface EnvioRegistroProps {
  registros: Registro[]
  open: boolean
  onClose: () => void
}

export function EnvioRegistro({ registros, open, onClose }: EnvioRegistroProps) {
  const { limpiarTodosLosRegistros } = useRegistroStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleEnviarRegistros = async () => {
    if (registros.length === 0) {
      toast.error({
        title: "No hay registros",
        description: "No hay registros para enviar.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from("novedad_actualizacion_datos_empleador")
        .insert(registros.map(registro => ({
          tipo_documento_empleador: registro.tipo_documento_empleador,
          documento_empleador: registro.documento_empleador,
          codigo_subempresa: registro.codigo_subempresa,
          correo_electronico: registro.correo_electronico,
          direccion: registro.direccion,
          telefono: registro.telefono,
          departamento: registro.departamento,
          municipio: registro.municipio,
          representante_legal: registro.representante_legal,
          metodo_subida: registro.metodo_subida,
        })))
        
      if (error) {
        console.error("Error al enviar registros:", error)
        toast.error({
          title: "Error al enviar",
          description: "Ocurrió un error al enviar los registros.",
        })
        return
      }

      toast.success({
        title: "Registros enviados",
        description: `${registros.length} registros se enviaron correctamente.`,
      })

      limpiarTodosLosRegistros()
      onClose()
    } catch (error) {
      console.error("Error al enviar registros:", error)
      toast.error({
        title: "Error al enviar",
        description: "Ocurrió un error al enviar los registros.",
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
                <li>• Los datos se guardarán en la base de datos</li>
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