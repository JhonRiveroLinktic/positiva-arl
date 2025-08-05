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
import { 
  convertEmpleadorDatosToSupabaseFormat,
  convertRepresentanteLegalToSupabaseFormat,
  convertSedeToSupabaseFormat,
  convertCentroTrabajoToSupabaseFormat,
  type RegistroCompleto,
  type EmpleadorDatosDB,
  type RepresentanteLegalDB,
  type SedeDB,
  type CentroTrabajoDB
} from "../types/afiliacion-empleador-types"
import { Send, Loader2, Info, File } from "lucide-react"

interface EnvioRegistroProps {
  registros: RegistroCompleto[]
  open: boolean
  onClose: () => void
}

export function EnvioRegistro({ registros, open, onClose }: EnvioRegistroProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { limpiarTodosLosRegistros } = useRegistroStore()

  const uploadFileToStorage = async (file: File, registroId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${registroId}_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `afiliacion_empleador/${fileName}`

      const { data, error } = await supabase.storage
        .from('adjuntos-empleador')
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
        .from('adjuntos_empleador')
        .insert({ 
          registro_id: registroId,
          url_archivo: filePath,
          nombre_archivo: originalFileName,
          peso_bytes: fileSize,
          url_publica: `https://agjsaigtrimzgwxqldfx.supabase.co/storage/v1/object/public/adjuntos-empleador/${filePath}`
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
      let totalRegistrosEnviados = 0
      let totalArchivosSubidos = 0
      let totalErroresArchivos = 0

      for (const registro of registros) {
        try {
          // 1. Insertar datos del empleador en afiliacion_empleador_datos
          const empleadorDatosDB = convertEmpleadorDatosToSupabaseFormat(registro.empleadorDatos)
          
          const { data: empleadorInsertado, error: errorEmpleador } = await supabase
            .from("afiliacion_empleador_datos")
            .insert(empleadorDatosDB)
            .select()
            .single()

          if (errorEmpleador) {
            console.error("Error al insertar datos del empleador:", errorEmpleador)
            throw new Error(`Error al insertar datos del empleador: ${errorEmpleador.message}`)
          }

          // 2. Insertar datos del representante legal en afiliacion_empleador_rep_legal
          const representanteLegalDB = convertRepresentanteLegalToSupabaseFormat(registro.representanteLegal)
          
          const { data: representanteInsertado, error: errorRepresentante } = await supabase
            .from("afiliacion_empleador_rep_legal")
            .insert(representanteLegalDB)
            .select()
            .single()

          if (errorRepresentante) {
            console.error("Error al insertar datos del representante legal:", errorRepresentante)
            throw new Error(`Error al insertar datos del representante legal: ${errorRepresentante.message}`)
          }

          // 3. Insertar sedes en afiliacion_empleador_sedes
          if (registro.sedes && registro.sedes.length > 0) {
            const sedesDB = registro.sedes.map(sede => convertSedeToSupabaseFormat(sede))
            
            const { error: errorSedes } = await supabase
              .from("afiliacion_empleador_sedes")
              .insert(sedesDB)

            if (errorSedes) {
              console.error("Error al insertar sedes:", errorSedes)
              throw new Error(`Error al insertar sedes: ${errorSedes.message}`)
            }
          }

          // 4. Obtener las sedes insertadas para asociar centros de trabajo
          const { data: sedesInsertadas, error: errorObtenerSedes } = await supabase
            .from("afiliacion_empleador_sedes")
            .select("id, nombre_sede")
            .eq("tipo_doc_empleador", empleadorDatosDB.tipo_doc_empleador)
            .eq("documento_empleador", empleadorDatosDB.documento_empleador)

          if (errorObtenerSedes) {
            console.error("Error al obtener sedes:", errorObtenerSedes)
            throw new Error(`Error al obtener sedes: ${errorObtenerSedes.message}`)
          }

          // 5. Insertar centros de trabajo en afiliacion_empleador_centros_trabajo
          if (registro.centrosTrabajo && registro.centrosTrabajo.length > 0) {
            const centrosTrabajoDB = registro.centrosTrabajo.map(centro => {
              const centroDB = convertCentroTrabajoToSupabaseFormat(centro)
              
              // Si no hay sede asociada, buscar la sede principal (primera sede)
              if (!centroDB.id_sede && sedesInsertadas && sedesInsertadas.length > 0) {
                centroDB.id_sede = sedesInsertadas[0].id
              }
              
              return centroDB
            })
            
            const { error: errorCentros } = await supabase
              .from("afiliacion_empleador_centros_trabajo")
              .insert(centrosTrabajoDB)

            if (errorCentros) {
              console.error("Error al insertar centros de trabajo:", errorCentros)
              throw new Error(`Error al insertar centros de trabajo: ${errorCentros.message}`)
            }
          }

          // 6. Procesar archivos adjuntos
          if (registro.archivos && registro.archivos.length > 0) {
            for (const archivo of registro.archivos) {
              try {
                const filePath = await uploadFileToStorage(archivo, empleadorInsertado.id)
                
                if (filePath) {
                  await saveAttachmentMetadata(
                    empleadorInsertado.id,
                    filePath,
                    archivo.name,
                    archivo.size
                  )
                  totalArchivosSubidos++
                } else {
                  totalErroresArchivos++
                }
              } catch (error) {
                console.error('Error procesando archivo:', error)
                totalErroresArchivos++
              }
            }
          }

          totalRegistrosEnviados++

        } catch (error) {
          console.error("Error procesando registro:", error)
          toast.error({
            title: "Error al procesar registro",
            description: error instanceof Error ? error.message : "Error inesperado",
          })
          return
        }
      }

      limpiarTodosLosRegistros()
      
      const mensajeArchivos = totalArchivosSubidos > 0 
        ? ` Se subieron ${totalArchivosSubidos} archivo(s) correctamente.`
        : ""
      
      const mensajeErrores = totalErroresArchivos > 0
        ? ` ${totalErroresArchivos} archivo(s) no se pudieron subir.`
        : ""

      toast.success({
        title: "¡Registros enviados exitosamente!",
        description: `Se enviaron ${totalRegistrosEnviados} registros correctamente a las 5 tablas de la base de datos.${mensajeArchivos}${mensajeErrores}`,
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
                Los registros se enviarán a 5 tablas de la base de datos: empleador, representante legal, sedes, centros de trabajo y adjuntos.
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