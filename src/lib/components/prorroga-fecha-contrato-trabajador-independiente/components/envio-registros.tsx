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
import type { Registro } from "../types/prorroga-fecha-contrato-types"

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
  const { limpiarTodosLosRegistros, agregarRegistro } = useRegistroStore()

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
      'SC': 'S',  // Salvoconducto (asumiendo S, ajustar si es diferente)
      'TI': 'T',  // Tarjeta de identidad
      'RC': 'R'   // Registro civil (si llega a usarse)
    }
    
    return mapeo[tipoDoc] || tipoDoc
  }

  const getErrorMessage = (error: any): string => {
    if (error.message?.includes('Could not find the function')) {
      return 'Error de configuración: Función de validación no disponible. Contacte al administrador.'
    }
    if (error.message?.includes('validate_prorroga_contrato')) {
      return 'Error de configuración: Función de validación no configurada correctamente.'
    }
    return error.message || 'Error desconocido durante la validación'
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
        const tipoDocContratanteOriginal = mapTipoDocumentoToOriginal(registro.tipo_doc_contratante)
        
        const { data, error } = await supabase.rpc('validate_prorroga_contrato', {
          p_tipo_doc_trabajador: tipoDocTrabajadorOriginal,
          p_documento_trabajador: registro.documento_trabajador,
          p_tipo_doc_contratante: tipoDocContratanteOriginal,
          p_documento_contratante: registro.documento_contratante,
          p_fecha_fin_nueva: registro.fecha_fin_contrato_nueva
        })

        if (error) {
          console.error('Error en validación:', error)
          errors.push({
            registroIndex: i + 1,
            registro,
            error: getErrorMessage(error)
          })
          continue
        }

        if (data && data.length > 0) {
          const validationResult = data[0]
          
          if (!validationResult.trabajador_existe) {
            errors.push({
              registroIndex: i + 1,
              registro,
              error: `Trabajador ${registro.tipo_doc_trabajador} ${registro.documento_trabajador} no encontrado en el sistema.`
            })
          } else if (!validationResult.pertenece_a_contratante) {
            errors.push({
              registroIndex: i + 1,
              registro,
              error: `El trabajador ${registro.tipo_doc_trabajador} ${registro.documento_trabajador} existe pero no pertenece al contratante ${registro.tipo_doc_contratante} ${registro.documento_contratante}.`
            })
          } else if (validationResult.error_message) {
            errors.push({
              registroIndex: i + 1,
              registro,
              error: validationResult.error_message
            })
          }
        } else {
          errors.push({
            registroIndex: i + 1,
            registro,
            error: 'No se recibió respuesta de la validación'
          })
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
      const prorrogasJson = registros.map(registro => ({
        TIPO_DOCUMENTO_CONTRATANTE: mapTipoDocumentoToOriginal(registro.tipo_doc_contratante),
        DOCUMENTO_CONTRATANTE: registro.documento_contratante,
        RAZON_SOCIAL: registro.razon_social,
        CODIGO_SUBEMPRESA: registro.codigo_subempresa,
        TIPO_DOCUMENTO_TRABAJADOR: mapTipoDocumentoToOriginal(registro.tipo_doc_trabajador),
        DOCUMENTO_TRABAJADOR: registro.documento_trabajador,
        FECHA_INICIO_CONTRATO_ORIGINAL: registro.fecha_inicio_contrato_original,
        FECHA_FIN_CONTRATO_ANTERIOR: registro.fecha_fin_contrato_anterior,
        FECHA_FIN_CONTRATO_NUEVA: registro.fecha_fin_contrato_nueva,
        VALOR_CONTRATO_PRORROGA: registro.valor_contrato_prorroga,
        CORREO_ELECTRONICO: registro.correo_electronico
      }))

      const { data, error } = await supabase.rpc('procesar_prorroga_contrato', {
        prorrogas_json: prorrogasJson
      })

      if (error) {
        console.error("Error en el procesamiento:", error)
        toast.error({
          title: "Error al procesar registros",
          description: getErrorMessage(error),
        })
        return
      }

      if (data && Array.isArray(data)) {
        let successCount = 0
        let errorCount = 0
        const errores = []
        const registrosFallidos: Registro[] = []

        // Mapear los resultados con los registros originales
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
          // Éxito total - limpiar todo
          limpiarTodosLosRegistros()
          resetValidation()
          toast.success({
            title: "¡Registros procesados exitosamente!",
            description: `Se procesaron ${successCount} prórrogas de contrato.`,
          })
          onClose()
        } else {
          // Mantener solo los registros que fallaron
          limpiarTodosLosRegistros()
          
          // Agregar de vuelta solo los registros que fallaron
          registrosFallidos.forEach(registro => {
            // Crear una copia con nuevo ID para evitar conflictos
            const registroFallido: Registro = {
              ...registro,
              id: `error-${Date.now()}-${Math.random()}`
            }
            agregarRegistro(registroFallido)
          })
          
          resetValidation()
          
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
            Prórroga de Fecha de Contrato - {registros.length} registro(s)
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
                <li>1. Se validará que cada trabajador exista y pertenezca al contratante</li>
                <li>2. Se validará que la nueva fecha sea posterior a la fecha actual</li>
                <li>3. Se procesarán las prórrogas de contrato en la base de datos</li>
                <li>4. Se actualizará automáticamente la fecha de fin en la tabla de contratos</li>
                <li>5. Se registrará la prórroga para trazabilidad</li>
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
                        <p className="text-sm">
                          <strong>Contratante:</strong> {error.registro.tipo_doc_contratante} {error.registro.documento_contratante}
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
                  Procesar {registros.length} Prórroga(s)
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
} 