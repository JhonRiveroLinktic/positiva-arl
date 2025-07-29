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
import { convertToSupabaseFormat } from "../types/independiente-types"
import { Send, Loader2, Info } from "lucide-react"
import type { Registro } from "../types/independiente-types"

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
      const registrosParaEnviar = registros.map(registro => 
        convertToSupabaseFormat(registro)
      )

      const { data: insertedData, error } = await supabase
        .from("independiente_con_contrato")
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
        description: `Se enviaron ${insertedData?.length || registros.length} registros correctamente.`,
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
              <p className="font-medium text-orange-800">
                Envío de Registros:
              </p>
              <p className="text-orange-700 mt-1">
                Los registros se enviarán directamente a la base de datos.
              </p>
            </AlertDescription>
          </Alert>

          <Alert variant="destructive" className="bg-green-50">
            <AlertDescription>
              <p className="text-sm text-black">
                <strong>Resumen:</strong> Se enviarán {registros.length} registro(s) para procesamiento.
              </p>
            </AlertDescription>
          </Alert>

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
                  Sí, Enviar {registros.length} Registro(s)
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}