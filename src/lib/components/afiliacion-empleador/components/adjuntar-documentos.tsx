"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
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
import { toast } from "@/lib/utils/toast"
import { useRegistroStore } from "../stores/registro-store"
import { File, Upload, X, Download, Trash2, Info } from "lucide-react"
import type { RegistroCompleto } from "../types/afiliacion-empleador-types"

interface AdjuntarDocumentosProps {
  registro: RegistroCompleto
  open: boolean
  onClose: () => void
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_FILES = 10

export function AdjuntarDocumentos({ registro, open, onClose }: AdjuntarDocumentosProps) {
  const { actualizarRegistro, getRegistroById } = useRegistroStore()
  
  const [currentRegistro, setCurrentRegistro] = useState<RegistroCompleto>(registro)

  useEffect(() => {
    const updatedRegistro = getRegistroById(registro.id)
    if (updatedRegistro) {
      setCurrentRegistro(updatedRegistro)
    } else {
      setCurrentRegistro(registro)
    }
  }, [registro, getRegistroById])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const currentFiles = currentRegistro.archivos || []
    
    if (currentFiles.length + acceptedFiles.length > MAX_FILES) {
      toast.error({
        title: "Límite de archivos excedido",
        description: `Máximo ${MAX_FILES} archivos por registro.`,
      })
      return
    }

    const validFiles: File[] = []
    const errors: string[] = []

    acceptedFiles.forEach((file: File) => {
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: Excede el tamaño máximo de 5MB`)
        return
      }

      if (!file.type.includes('pdf')) {
        errors.push(`${file.name}: Solo se permiten archivos PDF`)
        return
      }

      const existingFile = currentFiles.find(f => f.name === file.name)
      if (existingFile) {
        errors.push(`${file.name}: Ya existe un archivo con este nombre`)
        return
      }

      validFiles.push(file)
    })

    if (errors.length > 0) {
      toast.error({
        title: "Errores en archivos",
        description: errors.join('\n'),
      })
    }

    if (validFiles.length > 0) {
      const updatedRegistro: RegistroCompleto = {
        ...currentRegistro,
        archivos: [...currentFiles, ...validFiles],
      }
      actualizarRegistro(updatedRegistro)
      setCurrentRegistro(updatedRegistro)
      
      toast.success({
        title: "Archivos adjuntados",
        description: `${validFiles.length} archivo(s) agregado(s) correctamente.`,
      })
    }
  }, [currentRegistro, actualizarRegistro])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxSize: MAX_FILE_SIZE,
    multiple: true,
  })

  const removeFile = (fileName: string) => {
    const currentFiles = currentRegistro.archivos || []
    const updatedFiles = currentFiles.filter((file: File) => file.name !== fileName)
    
    const updatedRegistro: RegistroCompleto = {
      ...currentRegistro,
      archivos: updatedFiles,
    }
    actualizarRegistro(updatedRegistro)
    setCurrentRegistro(updatedRegistro)
    
    toast.success({
      title: "Archivo eliminado",
      description: "El archivo se eliminó correctamente.",
    })
  }

  const downloadFile = (file: File) => {
    const url = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const currentFiles = currentRegistro.archivos || []

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <File className="h-5 w-5" />
            Adjuntar Documentos - {currentRegistro.empleadorDatos?.razonSocialEmpleador || 'Sin razón social'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 !text-blue-800 mt-0.5" />
            <AlertDescription>
              <p className="font-medium text-blue-800">
                Información de archivos:
              </p>
              <p className="text-blue-700 mt-1">
                Solo archivos PDF, máximo 5MB cada uno. Máximo {MAX_FILES} archivos por registro.
              </p>
            </AlertDescription>
          </Alert>

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-300 hover:border-orange-400 hover:bg-orange-50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            {isDragActive ? (
              <p className="text-orange-600 font-medium">Suelta los archivos aquí...</p>
            ) : (
              <div>
                <p className="text-gray-600 font-medium">
                  Arrastra archivos PDF aquí o haz clic para seleccionar
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Máximo {MAX_FILES} archivos, 5MB cada uno
                </p>
              </div>
            )}
          </div>

          {currentFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Archivos adjuntos ({currentFiles.length})</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {currentFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <File className="h-5 w-5 text-red-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadFile(file)}
                        className="h-8 w-8 p-0"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.name)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:justify-end">
            <DialogClose asChild>
              <Button variant="outline">
                Cerrar
              </Button>
            </DialogClose>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
} 