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
import { Send, Loader2, Info, File } from "lucide-react"
import type { Registro } from "../types/independiente-types"

interface EnvioRegistroProps {
  registros: Registro[]
  open: boolean
  onClose: () => void
}

export function EnvioRegistro({ registros, open, onClose }: EnvioRegistroProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { limpiarTodosLosRegistros } = useRegistroStore()

  const ensureFolderExists = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.storage
        .from('adjuntos-independientes')
        .list('independientes-voluntarios', {
          limit: 1
        })

      if (error && error.message.includes('not found')) {
        const tempFile = new Blob([''], { type: 'text/plain' })
        const { error: uploadError } = await supabase.storage
          .from('adjuntos-independientes')
          .upload('independientes-voluntarios/temp.txt', tempFile)

        if (uploadError) {
          console.error('Error al crear carpeta:', uploadError)
          return false
        }

        await supabase.storage
          .from('adjuntos-independientes')
          .remove(['independientes-voluntarios/temp.txt'])

        return true
      }

      return true
    } catch (error) {
      console.error('Error verificando carpeta:', error)
      return false
    }
  }

  const uploadFileToStorage = async (file: File, registroId: string): Promise<string | null> => {
    try {
      const folderExists = await ensureFolderExists()
      if (!folderExists) {
        console.error('No se pudo crear la carpeta independientes-voluntarios')
        return null
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${registroId}_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `independientes-voluntarios/${fileName}`

      const { data, error } = await supabase.storage
        .from('adjuntos-independientes')
        .upload(filePath, file)

      if (error) {
        console.error('Error al subir archivo:', error)
        return null
      }

      return filePath
    } catch (error) {
      console.error('Error inesperado al subir archivo:', error)
      return null
    }
  }

  const saveAttachmentMetadata = async (
    registroId: string,
    filePath: string,
    originalFileName: string,
    fileSize: number
  ) => {
    try {
      const { error } = await supabase
        .from('adjuntos_independientes')
        .insert({
          registro_id: registroId,
          tipo_independiente: 'voluntario',
          url_archivo: filePath,
          nombre_archivo: originalFileName,
          peso_bytes: fileSize,
          url_publica: `https://agjsaigtrimzgwxqldfx.supabase.co/storage/v1/object/public/adjuntos-independientes/${filePath}`
        })

      if (error) {
        console.error('Error al guardar metadatos del archivo:', error)
        throw error
      }
    } catch (error) {
      console.error('Error inesperado al guardar metadatos:', error)
      throw error
    }
  }

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

      // Insertar registros en la tabla principal
      const { data: insertedData, error } = await supabase
        .from("independiente_voluntario")
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

      // Procesar archivos adjuntos
      let archivosSubidos = 0
      let erroresArchivos = 0

      for (const registro of registros) {
        if (registro.archivos && registro.archivos.length > 0) {
          // Buscar el registro insertado correspondiente
          const registroInsertado = insertedData?.find(
            r => r.nume_doc_trabajador === registro.numeDocTrabajador &&
                 r.nombre1_trabajador === registro.nombre1Trabajador &&
                 r.apellido1_trabajador === registro.apellido1Trabajador
          )

          if (registroInsertado) {
            for (const archivo of registro.archivos) {
              try {
                const filePath = await uploadFileToStorage(archivo, registroInsertado.id)
                
                if (filePath) {
                  await saveAttachmentMetadata(
                    registroInsertado.id,
                    filePath,
                    archivo.name,
                    archivo.size
                  )
                  archivosSubidos++
                } else {
                  erroresArchivos++
                }
              } catch (error) {
                console.error('Error procesando archivo:', error)
                erroresArchivos++
              }
            }
          }
        }
      }

      limpiarTodosLosRegistros()
      
      const mensajeArchivos = archivosSubidos > 0 
        ? ` Se subieron ${archivosSubidos} archivo(s) correctamente.`
        : ""
      
      const mensajeErrores = erroresArchivos > 0
        ? ` ${erroresArchivos} archivo(s) no se pudieron subir.`
        : ""

      toast.success({
        title: "¡Registros enviados exitosamente!",
        description: `Se enviaron ${insertedData?.length || registros.length} registros correctamente.${mensajeArchivos}${mensajeErrores}`,
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

  const totalArchivos = registros.reduce((total, registro) => {
    return total + (registro.archivos?.length || 0)
  }, 0)

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
              <div className="text-sm text-black space-y-1">
                <p><strong>Resumen:</strong> Se enviarán {registros.length} registro(s) para procesamiento.</p>
                {totalArchivos > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <File className="h-4 w-4 text-blue-600" />
                    <span>{totalArchivos} archivo(s) PDF adjunto(s)</span>
                  </div>
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