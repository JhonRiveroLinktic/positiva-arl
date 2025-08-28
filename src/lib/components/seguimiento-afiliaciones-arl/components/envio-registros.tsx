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
import { FormProvider, useFormContext } from "@/lib/components/core/form/form-provider"
import { FormInput } from "@/lib/components/core/form/form-input"
import { contactValidationRules, type ContactFormData } from "../validations/contact-validation-rules"
import { Controller } from "react-hook-form"
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

function ContactFormFields() {
  const { control } = useFormContext()

  return (
    <div className="space-y-3">
      <Controller
        name="nombre"
        control={control}
        rules={contactValidationRules.nombre}
        render={({ field, fieldState }) => (
          <FormInput
            label="Nombre Completo *"
            placeholder="Ingrese su nombre completo"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={!!fieldState.error}
            errorMessage={fieldState.error?.message}
            className="border-green-300 focus:border-green-500 focus:ring-green-500"
          />
        )}
      />
      <Controller
        name="correo"
        control={control}
        rules={contactValidationRules.correo}
        render={({ field, fieldState }) => (
          <FormInput
            label="Correo Electrónico *"
            type="email"
            placeholder="Ingrese su correo electrónico"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={!!fieldState.error}
            errorMessage={fieldState.error?.message}
            className="border-green-300 focus:border-green-500 focus:ring-green-500"
          />
        )}
      />
      <Controller
        name="telefono"
        control={control}
        rules={contactValidationRules.telefono}
        render={({ field, fieldState }) => (
          <FormInput
            label="Teléfono (opcional)"
            placeholder="Ej: 3108521310 (celular) o 1234567 (fijo)"
            value={field.value}
            onChange={field.onChange}
            maxLength={10}
            onBlur={field.onBlur}
            error={!!fieldState.error}
            errorMessage={fieldState.error?.message}
            className="border-green-300 focus:border-green-500 focus:ring-green-500"
          />
        )}
      />
      <p className="text-xs text-green-700 mt-2">
        * Complete nombre y correo electrónico. Teléfono es opcional.
      </p>
    </div>
  )
}

function SubmitButton({ isSubmitting, registrosCount }: { isSubmitting: boolean, registrosCount: number }) {
  const totalLotes = Math.ceil(registrosCount / 20)
  
  return (
    <Button
      type="submit"
      disabled={isSubmitting}
      className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white"
    >
      {isSubmitting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Enviando por lotes...
        </>
      ) : (
        <>
          <Send className="h-4 w-4" />
          Sí, Enviar {registrosCount} Registro(s) en {totalLotes} Lote(s)
        </>
      )}
    </Button>
  )
}

export function EnvioRegistro({ registros, open, onClose }: EnvioRegistroProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { limpiarTodosLosRegistros } = useRegistroStore()

  const handleEnviarRegistros = async (data: ContactFormData, form: any) => {
    if (registros.length === 0) {
      toast.warning({
        title: "Sin registros",
        description: "No hay registros para enviar a la base de datos.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const registrosParaEnviar = registros.map(registro => ({
        ...convertToSupabaseFormat(registro),
        nombre_contacto: data.nombre,
        correo_contacto: data.correo,
        telefono_contacto: data.telefono || undefined,
      }))

      // Implementar carga por lotes (batching) - máximo 20 registros por lote
      const BATCH_SIZE = 20
      const totalRegistros = registrosParaEnviar.length
      const totalLotes = Math.ceil(totalRegistros / BATCH_SIZE)
      let registrosEnviados = 0
      let registrosFallidos = 0
      const errores: string[] = []

             toast.info({
         title: "Iniciando envío por lotes",
         description: `Enviando ${totalRegistros} registros en ${totalLotes} lote(s) de máximo ${BATCH_SIZE} registros cada uno.`,
       })

      // Procesar registros por lotes
      for (let i = 0; i < totalLotes; i++) {
        const inicio = i * BATCH_SIZE
        const fin = Math.min(inicio + BATCH_SIZE, totalRegistros)
        const loteActual = registrosParaEnviar.slice(inicio, fin)
        const numeroLote = i + 1

        try {
          console.log(`Enviando lote ${numeroLote}/${totalLotes} con ${loteActual.length} registros`)

          const { data: insertedData, error } = await supabase
            .from("registros_arl_seguimiento")
            .insert(loteActual)
            .select()

          if (error) {
            console.error(`Error en lote ${numeroLote}:`, error)
            
            const msg = error.code === "23505"
              ? `Lote ${numeroLote}: Algunos registros ya existen en la base de datos.`
              : error.code === "23502"
              ? `Lote ${numeroLote}: Faltan campos requeridos en algunos registros.`
              : `Lote ${numeroLote}: ${error.message}`

            errores.push(msg)
            registrosFallidos += loteActual.length

            // Continuar con el siguiente lote en lugar de detener todo el proceso
            continue
          }

          registrosEnviados += insertedData?.length || loteActual.length

                     // Mostrar progreso del lote actual
           if (totalLotes > 1) {
             toast.info({
               title: `Lote ${numeroLote}/${totalLotes} completado`,
               description: `${registrosEnviados} registros enviados exitosamente.`,
             })
           }

           // Pausa entre lotes (sin notificación)
           if (i < totalLotes - 1) {
             await new Promise(resolve => setTimeout(resolve, 2000)) // 2 segundos de pausa
           }

        } catch (error) {
          console.error(`Error inesperado en lote ${numeroLote}:`, error)
          errores.push(`Lote ${numeroLote}: Error inesperado`)
          registrosFallidos += loteActual.length
        }
      }

      // Mostrar resultado final
      if (registrosFallidos === 0) {
        // Todos los registros se enviaron exitosamente
        limpiarTodosLosRegistros()
        toast.success({
          title: "¡Registros enviados exitosamente!",
          description: `Se enviaron ${registrosEnviados} registros correctamente en ${totalLotes} lote(s).`,
        })
        onClose()
      } else if (registrosEnviados > 0) {
        // Algunos registros se enviaron, otros fallaron
        toast.warning({
          title: "Envío parcial",
          description: `${registrosEnviados} registros enviados exitosamente, ${registrosFallidos} fallaron. Revisa los errores en la consola.`,
        })
        console.error("Errores durante el envío por lotes:", errores)
      } else {
        // Todos los registros fallaron
        toast.error({
          title: "Error en el envío",
          description: `Ningún registro se pudo enviar. Revisa los errores en la consola.`,
        })
        console.error("Errores durante el envío por lotes:", errores)
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

  const handleInvalidSubmit = (errors: any) => {
    const errorMessages = []
    if (errors.nombre) errorMessages.push(`Nombre: ${errors.nombre.message}`)
    if (errors.correo) errorMessages.push(`Correo: ${errors.correo.message}`)
    if (errors.telefono) errorMessages.push(`Teléfono: ${errors.telefono.message}`)

    toast.error({
      title: "Campos requeridos",
      description: errorMessages.length > 0 
        ? errorMessages.join(". ")
        : "Complete todos los campos obligatorios antes de continuar.",
    })
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

          <FormProvider<ContactFormData>
            onSubmit={handleEnviarRegistros}
            onInvalidSubmit={handleInvalidSubmit}
            defaultValues={{
              nombre: "",
              correo: "",
              telefono: "",
            }}
            mode="all"
            reValidateMode="onChange"
          >
            <div className="space-y-4">
              <div className="p-5 rounded-md border border-gray-200">
                <p className="text-lg text-green-800 mb-4">
                  Datos de Contacto:
                </p>
                <ContactFormFields />
              </div>

              <Alert variant="destructive" className="bg-green-50">
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="text-sm text-black">
                      <strong>Resumen:</strong> Se enviarán {registros.length} registro(s) para procesamiento.
                    </p>
                    {registros.length > 25 && (
                      <p className="text-sm text-blue-700">
                        <strong>Proceso por lotes:</strong> Los datos se enviarán en lotes de 20 registros.
                      </p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>

              <DialogFooter className="gap-2 sm:justify-end">
                <DialogClose asChild>
                  <Button variant="outline" disabled={isSubmitting}>
                    Cancelar
                  </Button>
                </DialogClose>
                <SubmitButton isSubmitting={isSubmitting} registrosCount={registros.length} />
              </DialogFooter>
            </div>
          </FormProvider>
        </div>
      </DialogContent>
    </Dialog>
  )
}