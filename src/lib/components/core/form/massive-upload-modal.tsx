"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/lib/components/ui/dialog"
import { Button } from "@/lib/components/ui/button"
import { Input } from "@/lib/components/ui/input"
import { Label } from "@/lib/components/ui/label"
import { Alert, AlertDescription } from "@/lib/components/ui/alert"
import { Progress } from "@/lib/components/ui/progress"
import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle, X } from "lucide-react"
import * as XLSX from "xlsx"
import { toast } from "@/lib/utils/toast"

export interface ProcessingResult {
  success: number
  errors: Array<{
    row: number
    errors: string[]
    rawData?: any
  }>
  total: number
}

export interface ContactInfo {
  nombre: string
  correo: string
  telefono: string
}

export interface MassiveUploadConfig {
  acceptedFileTypes?: string[]
  requiredSheetName?: string 

  title?: string
  instructions?: string[]

  processData: (data: any[], setProgress: (progress: number) => void) => Promise<ProcessingResult>
  getContactInfo?: () => ContactInfo | null

  validateFileStructure?: (headers: string[]) => {
    isValid: boolean
    missingColumns?: string[]
    extraColumns?: string[]
  }
}

export interface MassiveUploadModalProps {
  config: MassiveUploadConfig
  trigger?: React.ReactNode
  onSuccess?: (result: ProcessingResult) => void
  onError?: (error: string) => void
}

export function MassiveUploadModal({ config, trigger, onSuccess, onError }: MassiveUploadModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<ProcessingResult | null>(null)
  const [error, setError] = useState<string>("")

  const {
    acceptedFileTypes = [".xlsx", ".xls"],
    requiredSheetName = "DATOS",
    title = "Carga Masiva de Registros",
    instructions = [
      'Seleccione un archivo Excel (.xlsx) con la hoja "DATOS" con el formato correcto',
    ],
    processData,
    validateFileStructure,
  } = config

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    const fileExtension = "." + selectedFile.name.split(".").pop()?.toLowerCase()
    if (!acceptedFileTypes.includes(fileExtension)) {
      setError(`Por favor seleccione un archivo válido (${acceptedFileTypes.join(", ")})`)
      return
    }

    setFile(selectedFile)
    setError("")
    setResult(null)
  }

  const processFile = async () => {
    if (!file) return

    toast.info({
      title: "Procesando archivo",
      description: `Iniciando procesamiento de ${file.name}...`,
    })

    setIsProcessing(true)
    setProgress(0)
    setError("")
    setResult(null)

    try {
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: "array" })

      if (!workbook.Sheets[requiredSheetName]) {
        throw new Error(`No se encontró la hoja "${requiredSheetName}" en el archivo Excel`)
      }

      const worksheet = workbook.Sheets[requiredSheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

      const dataRows = jsonData
        .slice(1)
        .filter(
          (row: any) => Array.isArray(row) && row.some((cell) => cell !== null && cell !== undefined && cell !== ""),
        )

      if (dataRows.length === 0) {
        throw new Error("No se encontraron datos en el archivo")
      }

      if (validateFileStructure) {
        const headers = jsonData[0] as string[]
        const structureValidation = validateFileStructure(headers)

        if (!structureValidation.isValid) {
          let errorMessage = "Estructura del archivo inválida."
          if (structureValidation.missingColumns?.length) {
            errorMessage += ` Columnas faltantes: ${structureValidation.missingColumns.join(", ")}`
          }
          if (structureValidation.extraColumns?.length) {
            errorMessage += ` Columnas adicionales: ${structureValidation.extraColumns.join(", ")}`
          }
          throw new Error(errorMessage)
        }
      }

      const headers = jsonData[0] as string[]
      const objectData = dataRows.map((row: any) => {
        const obj: any = {}
        headers.forEach((header, index) => {
          obj[header] = row[index]
        })
        return obj
      })

      const processingResult = await processData(objectData, setProgress)
      setResult(processingResult)

      if (processingResult.errors.length === 0) {
        toast.success({
          title: "¡Procesamiento exitoso!",
          description: `Se procesaron y guardaron ${processingResult.success} registros correctamente.`,
        })

        onSuccess?.(processingResult)

        setTimeout(() => {
          closeModal()
          setTimeout(() => {
            const listaRegistrosElement = document.querySelector('[data-testid="lista-registros"]')
            
            if (listaRegistrosElement) {
              listaRegistrosElement.scrollIntoView({ behavior: "smooth", block: "start" })
            } else {
              const titleElement = Array.from(document.querySelectorAll('h2, h3')).find(el => 
                el.textContent?.includes('Registros Guardados')
              )
              
              if (titleElement) {
                titleElement.scrollIntoView({ behavior: "smooth", block: "start" })
              } else {
                window.scrollTo({
                  top: document.body.scrollHeight,
                  behavior: "smooth",
                })
              }
            }
          }, 100)
        }, 1000)
      } else {
        toast.error({
          title: "Procesamiento fallido",
          description: `Se encontraron errores en ${processingResult.errors.length} fila(s). No se guardó ningún registro.`,
        })
        onError?.(`Se encontraron errores en ${processingResult.errors.length} fila(s)`)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error procesando el archivo"
      setError(errorMessage)
      toast.error({
        title: "Error en el archivo",
        description: errorMessage,
      })
      onError?.(errorMessage)
    } finally {
      setIsProcessing(false)
      setProgress(0)
    }
  }

  const resetModal = () => {
    setFile(null)
    setError("")
    setResult(null)
    setProgress(0)
  }

  const closeModal = () => {
    setIsOpen(false)
    resetModal()
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="flex items-center gap-2 bg-transparent">
            <Upload className="h-4 w-4" />
            Carga Masiva
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-full !max-w-2xl sm:!max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p>
                  <strong>Instrucciones:</strong>
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  {instructions.map((instruction, index) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="excel-file" className="cursor-pointer">Archivo Excel</Label>
              <Input
                id="excel-file"
                className="cursor-pointer"
                type="file"
                accept={acceptedFileTypes.join(",")}
                onChange={handleFileSelect}
                disabled={isProcessing}
              />
            </div>

            {file && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">{file.name}</span>
                <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                {!isProcessing && (
                  <Button variant="ghost" size="sm" onClick={() => setFile(null)} className="ml-auto">
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Procesando archivo...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="space-y-4">
              {result.errors.length === 0 ? (
                <Alert variant="default">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p>
                        <strong>¡Procesamiento exitoso!</strong>
                      </p>
                      <ul className="space-y-1">
                        <li>• Total de filas procesadas: {result.total}</li>
                        <li>• Registros guardados: {result.success}</li>
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p>
                        <strong>Validación fallida</strong>
                      </p>
                      <ul className="space-y-1">
                        <li>• Total de filas: {result.total}</li>
                        <li>• Filas con errores: {result.errors.length}</li>
                        <li>
                          • Registros guardados: <strong>0</strong> (ninguno)
                        </li>
                      </ul>
                      <div className="mt-3 p-3 bg-red-100 rounded border border-red-200">
                        <div className="text-sm text-red-700">
                          <p className="font-medium mb-1">Opciones para continuar:</p>
                          <ul className="list-disc pl-4 space-y-1">
                            <li>Corrige los errores mostrados en el archivo Excel y vuelve a intentar</li>
                            <li>
                              Si el problema persiste, carga los registros manualmente usando el formulario individual
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {result.errors.length > 0 && (
                <div className="space-y-2">
                  <Label>Errores encontrados que deben corregirse:</Label>
                  <div className="max-h-60 overflow-y-auto border rounded-lg p-3 bg-red-50">
                    {result.errors.map((error, index) => (
                      <div key={index} className="text-sm space-y-2 mb-4 p-3 border border-red-200 rounded bg-white">
                        <div className="font-medium text-red-700">Fila {error.row}:</div>
                        <ul className="list-disc pl-4 text-red-600 space-y-1">
                          {error.errors.map((err, errIndex) => (
                            <li key={errIndex}>{err}</li>
                          ))}
                        </ul>
                        {error.rawData && (
                          <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                            <div className="font-medium text-gray-700 mb-1">Datos de Excel:</div>
                            <div className="text-gray-600 break-all">
                              {Object.entries(error.rawData)
                                .map(([key, value], idx) => (
                                  <div key={idx} className="flex gap-2">
                                    <span className="font-medium min-w-0 flex-shrink-0">{key}:</span>
                                    <span className="text-gray-500 break-all">
                                      {value === null || value === undefined ? "(vacío)" : `"${value}"`}
                                    </span>
                                  </div>
                                ))
                                .slice(0, 8)}
                              {Object.keys(error.rawData).length > 8 && (
                                <div className="text-gray-400 italic">
                                  ... y {Object.keys(error.rawData).length - 8} columnas más
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={processFile}
              disabled={!file || isProcessing}
              className="flex items-center gap-2 bg-black hover:bg-black/80 text-white"
            >
              <Upload className="h-4 w-4" />
              {isProcessing ? "Procesando..." : "Procesar Archivo"}
            </Button>
            <Button variant="outline" onClick={resetModal} disabled={isProcessing}>
              Limpiar
            </Button>
            <Button variant="ghost" onClick={closeModal} disabled={isProcessing} className="ml-auto">
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}