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
      if (!file || !file.name) {
        console.error('Archivo inválido:', file)
        return null
      }
      
      const fileExt = file.name.split('.').pop() || 'pdf'
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

    for (const registro of registros) {
      if (!registro.sedes || registro.sedes.length === 0) {
        toast.error({
          title: "Sede requerida",
          description: "Debe registrar al menos una sede para la empresa.",
        })
        return
      }

      for (let i = 0; i < registro.sedes.length; i++) {
        const sede = registro.sedes[i]
        const sedeId = sede.id || `sede-${i}`
        
        const centrosDeEstaSede = registro.centrosTrabajo.filter(
          centro => centro.idSede === sedeId
        )
        
        if (centrosDeEstaSede.length === 0) {
          toast.error({
            title: "Centro de trabajo requerido",
            description: `Debe registrar al menos un centro de trabajo para la sede "${sede.nombreSede}".`,
          })
          return
        }
      }
    }

    setIsSubmitting(true)

    try {
      let totalRegistrosEnviados = 0
      let totalArchivosSubidos = 0
      let totalErroresArchivos = 0

      for (const registro of registros) {
        try {
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

          const representanteLegalDB = convertRepresentanteLegalToSupabaseFormat(registro.representanteLegal)
          
          representanteLegalDB.empresa_id = empleadorInsertado.id
          
          const { data: representanteInsertado, error: errorRepresentante } = await supabase
            .from("afiliacion_empleador_rep_legal")
            .insert(representanteLegalDB)
            .select()
            .single()

          if (errorRepresentante) {
            console.error("Error al insertar datos del representante legal:", errorRepresentante)
            throw new Error(`Error al insertar datos del representante legal: ${errorRepresentante.message}`)
          }

          const sedesInsertadas: { [key: string]: string } = {}
          
          for (let i = 0; i < registro.sedes.length; i++) {
            const sede = registro.sedes[i]
            const sedeDB = convertSedeToSupabaseFormat(sede)
            
            sedeDB.tipo_doc_empleador = empleadorDatosDB.tipo_doc_empleador
            sedeDB.documento_empleador = empleadorDatosDB.documento_empleador
            sedeDB.empresa_id = empleadorInsertado.id
            
            const { data: sedeInsertada, error: errorSede } = await supabase
              .from("afiliacion_empleador_sedes")
              .insert(sedeDB)
              .select()
              .single()

            if (errorSede) {
              console.error("Error al insertar sede:", errorSede)
              throw new Error(`Error al insertar sede: ${errorSede.message}`)
            }

            const idTemporal = `sede-${i}`
            sedesInsertadas[idTemporal] = sedeInsertada.id
          }

          for (const centroTrabajo of registro.centrosTrabajo) {
            const centroTrabajoDB = convertCentroTrabajoToSupabaseFormat(centroTrabajo)
            
            centroTrabajoDB.tipo_doc_empleador = empleadorDatosDB.tipo_doc_empleador
            centroTrabajoDB.documento_empleador = empleadorDatosDB.documento_empleador
            centroTrabajoDB.empresa_id = empleadorInsertado.id
            
            if (centroTrabajoDB.id_sede && sedesInsertadas[centroTrabajoDB.id_sede]) {
              centroTrabajoDB.id_sede = sedesInsertadas[centroTrabajoDB.id_sede]
            } else {
              delete centroTrabajoDB.id_sede
            }
            
            const { data: centroInsertado, error: errorCentro } = await supabase
              .from("afiliacion_empleador_centros_trabajo")
              .insert(centroTrabajoDB)
              .select()
              .single()

            if (errorCentro) {
              console.error("Error al insertar centro de trabajo:", errorCentro)
              throw new Error(`Error al insertar centro de trabajo: ${errorCentro.message}`)
            }
          }

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