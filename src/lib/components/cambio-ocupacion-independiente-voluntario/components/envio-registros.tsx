"use client"

import { useState, useEffect } from "react"
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
import { Send, Loader2, Info, AlertTriangle, CheckCircle, X } from "lucide-react"
import {
  convertToSupabaseFormat,
} from "../types/cambio-ocupacion-types"
import type { CambioOcupacionIndependienteVoluntarioFormData as Registro } from "../types/cambio-ocupacion-types"

interface ValidationError {
  registroIndex: number
  registro: Registro
  error: string
}

interface EnvioRegistroProps {
  registros: Registro[]
  open: boolean
  onClose: () => void
}

export function EnvioRegistro({ registros, open, onClose }: EnvioRegistroProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [hasValidated, setHasValidated] = useState(false)
  const { limpiarTodosLosRegistros } = useRegistroStore()

  useEffect(() => {
    resetValidation()
  }, [registros.length, open])

  const handleClose = () => {
    resetValidation()
    onClose()
  }

  const mapTipoDocumentoToOriginal = (tipoDoc: string): string => {
    const mapeo: Record<string, string> = {
      'CC': 'C',  // Cédula Ciudadanía
      'CD': 'D',  // Carnet Diplomático  
      'CE': 'E',  // Cédula Extranjería
      'NI': 'N',  // NIT
      'PT': 'L',  // Permiso Protección Temporal
      'SC': 'S',  // Salvoconducto
      'TI': 'T',  // Tarjeta de identidad
      'RC': 'R'   // Registro civil
    }
    
    return mapeo[tipoDoc] || tipoDoc
  }

  const validateRegistros = async () => {
    if (registros.length === 0) return

    setIsValidating(true)
    setValidationErrors([])
    setHasValidated(false)

    try {
      const errors: ValidationError[] = []

      for (let i = 0; i < registros.length; i++) {
        const registro = registros[i]
        
        const tipoDocTrabajadorOriginal = mapTipoDocumentoToOriginal(registro.tipo_doc_trabajador)
        
        const { data, error } = await supabase.rpc('validate_trabajador_voluntario', {
          p_tipo_doc_trabajador: tipoDocTrabajadorOriginal,
          p_nume_doc_trabajador: registro.documento_trabajador
        })

        if (error) {
          errors.push({
            registroIndex: i + 1,
            registro,
            error: `Error de validación: ${error.message}`
          })
          continue
        }

        if (data && data.length > 0) {
          const validationResult = data[0]
          
          if (!validationResult.exists_trabajador) {
            errors.push({
              registroIndex: i + 1,
              registro,
              error: validationResult.error_message || 'Trabajador no encontrado'
            })
          }
        }
      }

      setValidationErrors(errors)
      setHasValidated(true)

      if (errors.length === 0) {
        toast.success({
          title: "Validación exitosa",
          description: "Todos los registros son válidos. Puede proceder con el envío.",
        })
      }

    } catch (error) {
      console.error("Error durante la validación:", error)
      toast.error({
        title: "Error de validación",
        description: "Ocurrió un error durante la validación. Intente nuevamente.",
      })
    } finally {
      setIsValidating(false)
    }
  }

  const handleEnviarRegistros = async () => {
    if (validationErrors.length > 0) {
      toast.error({
        title: "Errores de validación",
        description: "Corrija los errores antes de enviar los registros.",
      })
      return
    }

    if (!hasValidated) {
      toast.warning({
        title: "Validación requerida",
        description: "Debe validar los registros antes de enviarlos.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Formatear los registros para Supabase
      const registrosParaInsertar = registros.map((registro) => ({
        ...convertToSupabaseFormat(registro),
        tipo_novedad: registro.tipo_novedad,
      }));

      // Intentar una inserción masiva
      const { data: insertedData, error: insertError } = await supabase
        .from("cambio_ocupacion_independiente_voluntario")
        .insert(registrosParaInsertar)
        .select()

      if (insertError) {
        console.error("Error al insertar registros:", insertError)
        toast.error({
          title: "Error al enviar registros",
          description: insertError.message,
        })
        return
      }

      limpiarTodosLosRegistros()
      resetValidation()
      toast.success({
        title: "¡Registros procesados exitosamente!",
        description: `Se procesaron ${insertedData?.length || registros.length} cambios de ocupación.`,
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

  const resetValidation = () => {
    setValidationErrors([])
    setHasValidated(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Cambio de Ocupación - {registros.length} registro(s)
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
                <li>1. Se validará que cada trabajador exista</li>
                <li>2. Se registrará el cambio de ocupación en la trazabilidad</li>
                <li>3. Se actualizará la ocupación principal del trabajador</li>
              </ul>
            </AlertDescription>
          </Alert>

          {!hasValidated && (
            <div className="flex justify-center">
              <Button
                onClick={validateRegistros}
                disabled={isValidating}
                variant="outline"
                className="flex items-center gap-2"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Validando registros...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Validar Registros
                  </>
                )}
              </Button>
            </div>
          )}

          {hasValidated && validationErrors.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-red-600 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Errores encontrados ({validationErrors.length})
                </h3>
                <Button
                  onClick={resetValidation}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Limpiar
                </Button>
              </div>
              
              <div className="max-h-60 overflow-y-auto space-y-2">
                {validationErrors.map((error, index) => (
                  <Alert key={index} variant="destructive" className="bg-red-50">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <p className="font-medium">
                          Registro #{error.registroIndex} - Error de validación
                        </p>
                        <p className="text-sm">
                          <strong>Trabajador:</strong> {error.registro.tipo_doc_trabajador} {error.registro.documento_trabajador}
                        </p>
                        <p className="text-sm text-red-700 font-medium">
                          {error.error}
                        </p>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          )}

          {hasValidated && validationErrors.length === 0 && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 !text-green-800 mt-0.5" />
              <AlertDescription>
                <p className="font-medium text-green-800">
                  ✅ Validación exitosa
                </p>
                <p className="text-green-700 mt-1">
                  Todos los registros son válidos y están listos para ser procesados.
                </p>
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter className="gap-2 sm:justify-end">
            <DialogClose asChild>
              <Button variant="outline" disabled={isSubmitting || isValidating} onClick={handleClose}>
                Cancelar
              </Button>
            </DialogClose>
            
            <Button
              onClick={handleEnviarRegistros}
              disabled={isSubmitting || isValidating || !hasValidated || validationErrors.length > 0}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Procesar {registros.length} Cambio(s)
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}