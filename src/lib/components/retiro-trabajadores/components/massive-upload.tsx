"use client"

import type React from "react"
import { useCallback } from "react"
import * as XLSX from "xlsx"
import {
  MassiveUploadModal,
  type ProcessingResult,
  type ContactInfo,
  type MassiveUploadConfig,
} from "@/lib/components/core/form/massive-upload-modal"
import { useRegistroStore } from "../stores/retiro-trabajador-store"
import { RetiroTrabajadoresValidationRules, sanitizeFormData } from "../validations/validation-rules"
import type { Registro, RetiroTrabajadoresFormData } from "../types/retiro-trabajador"
import { Upload } from "lucide-react"
import { Button } from "@/lib/components/ui/button"

const EXCEL_COLUMN_MAPPING = {
  'TIPO_DOCUMENTO_EMPLEADOR': 'tipoDocEmpleador',
  'DOCUMENTO_EMPLEADOR': 'documentoEmpleador',
  'RAZÓN SOCIAL': 'nombreRazonSocialContratante',
  'CODIGO_SUBEMPRESA (SOLO PARA EL NIT 899999061)': 'codigoSubempresa',
  'TIPO_DOCUMENTO_TRABAJADOR': 'tipoDocTrabajador',
  'DOCUMENTO_TRABAJADOR': 'documentoTrabajador',
  'TIPO_VINCULACION': 'tipoVinculacion',
  'FECHA_RETIRO_TRABAJADOR (DD/MM/AAAA)': 'fechaRetiroTrabajador',
  'CORREO_DE_NOTIFICACION_DONDE_SE_REMITIRAN_LOS_CERTIFICADOS_CON_LA_NOVEDAD': 'correoNotificacion',
}

interface RetiroTrabajadoresMassiveUploadProps {
  trigger?: React.ReactNode
  onSuccess?: (result: ProcessingResult) => void
  onError?: (error: string) => void
}

export function RetiroTrabajadoresMassiveUpload({ trigger, onSuccess, onError }: RetiroTrabajadoresMassiveUploadProps) {
  const { agregarRegistro } = useRegistroStore()

  // Conversión de fechas Excel a YYYY-MM-DD (formato esperado DD/MM/AAAA)
  const convertDateFormat = useCallback((dateStr: any): string => {
    if (!dateStr || dateStr === "") return ""
    
    // Si es número de Excel
    if (typeof dateStr === "number") {
      try {
        const date = XLSX.SSF.parse_date_code(dateStr)
        if (date && date.y && date.m && date.d) {
          return `${date.y}-${String(date.m).padStart(2, "0")}-${String(date.d).padStart(2, "0")}`
        }
      } catch (error) {
        console.warn("Error parsing Excel date:", dateStr, error)
      }
      return ""
    }
    
    if (typeof dateStr === "string" && dateStr.trim() !== "") {
      const trimmed = dateStr.trim()
      
      // Formato DD/MM/AAAA (esperado)
      if (trimmed.includes("/")) {
        const parts = trimmed.split("/")
        if (parts.length === 3) {
          const [day, month, year] = parts.map(p => Number.parseInt(p, 10))
          
          if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2100) {
            return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
          }
        }
      }
      
      // Si ya está en formato YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        const testDate = new Date(trimmed)
        if (!isNaN(testDate.getTime())) {
          return trimmed
        }
      }
    }
    return ""
  }, [])

  const processRetiroData = useCallback(
    async (data: any[], setProgress: (progress: number) => void): Promise<ProcessingResult> => {
      const result: ProcessingResult = {
        success: 0,
        errors: [],
        total: data.length,
      }
      const validationResults: Array<{
        isValid: boolean
        registro?: Registro
        errorData?: any
      }> = []
      
      for (let i = 0; i < data.length; i++) {
        const row = data[i]
        setProgress(((i + 1) / data.length) * 50)
        
        try {
          const formData: Partial<RetiroTrabajadoresFormData> = {}
          
          Object.keys(row).forEach(originalHeader => {
            const cleanHeader = originalHeader.trim()
            const mappedField = EXCEL_COLUMN_MAPPING[cleanHeader as keyof typeof EXCEL_COLUMN_MAPPING]
            
            if (mappedField) {
              let value = row[originalHeader]
              if (mappedField === "fechaRetiroTrabajador") {
                value = convertDateFormat(value)
              }
              formData[mappedField as keyof RetiroTrabajadoresFormData] = value !== undefined && value !== null ? String(value).trim() : ""
            }
          })
                    
          const sanitizedData = sanitizeFormData(formData as RetiroTrabajadoresFormData)
          const tempRegistro: Registro = {
            id: `temp-${i}`,
            ...(sanitizedData as Omit<Registro, "id">),
            metodoSubida: "masivo",
          }
          
          const fieldErrors: string[] = []
          Object.entries(RetiroTrabajadoresValidationRules).forEach(([fieldName, rules]) => {
            const fieldValue = tempRegistro[fieldName as keyof Registro]
            
            // Validar campos requeridos
            if ('required' in rules && rules.required && (!fieldValue || fieldValue === "")) {
              // Excepción para codigoSubempresa que es opcional
              if (fieldName !== 'codigoSubempresa') {
                fieldErrors.push(rules.required)
              }
            }
            
            // Validar con reglas custom
            if (fieldValue && 'validate' in rules && typeof rules.validate === 'function') {
              try {
                const validationResult = rules.validate(fieldValue as string, tempRegistro)
                if (validationResult !== true && typeof validationResult === "string") {
                  fieldErrors.push(validationResult)
                }
              } catch (error) {
                // Ignorar errores de validación custom
              }
            }
          })
          
          if (fieldErrors.length === 0) {
            validationResults.push({
              isValid: true,
              registro: tempRegistro,
            })
          } else {
            const enhancedErrors = fieldErrors.map((error) => {
              const fieldName = error.split(" ")[0]
              const actualValue = formData[fieldName as keyof RetiroTrabajadoresFormData]
              const displayValue = actualValue !== undefined && actualValue !== null && actualValue !== "" ? `"${actualValue}"` : "vacío"
              return `${error} (valor: ${displayValue})`
            })
            validationResults.push({
              isValid: false,
              errorData: {
                row: i + 2,
                errors: enhancedErrors,
                rawData: row,
              },
            })
          }
        } catch (err) {
          validationResults.push({
            isValid: false,
            errorData: {
              row: i + 2,
              errors: [`Error procesando fila: ${err instanceof Error ? err.message : "Error desconocido"}`],
              rawData: row,
            },
          })
        }
      }
      
      const invalidResults = validationResults.filter((r) => !r.isValid)
      if (invalidResults.length > 0) {
        result.errors = invalidResults.map((r) => r.errorData).filter(Boolean)
        setProgress(0)
        return result
      }
      
      // Agregar registros válidos al store
      for (let i = 0; i < validationResults.length; i++) {
        const validResult = validationResults[i]
        setProgress(50 + ((i + 1) / validationResults.length) * 50)
        
        if (validResult.isValid && validResult.registro) {
          try {
            const finalRegistro: Registro = {
              ...validResult.registro,
              id: `import-${Date.now()}-${i}`,
            }
            agregarRegistro(finalRegistro)
            result.success++
          } catch (error) {
            result.errors.push({
              row: i + 2,
              errors: [`Error al guardar: ${error instanceof Error ? error.message : "Error desconocido"}`],
              rawData: validResult.registro,
            })
            return result
          }
        }
      }
      
      return result
    },
    [agregarRegistro, convertDateFormat],
  )

  const getContactInfo = useCallback((): ContactInfo | null => {
    return null
  }, [])

  const validateFileStructure = useCallback((headers: string[]) => {
    // Limpiar headers de espacios en blanco
    const cleanHeaders = headers.map(h => h.trim())
    
    // Columnas exactas requeridas
    const requiredColumns = [
      'TIPO_DOCUMENTO_EMPLEADOR',
      'DOCUMENTO_EMPLEADOR', 
      'RAZÓN SOCIAL',
      'TIPO_DOCUMENTO_TRABAJADOR',
      'DOCUMENTO_TRABAJADOR',
      'TIPO_VINCULACION',
      'FECHA_RETIRO_TRABAJADOR (DD/MM/AAAA)',
      'CORREO_DE_NOTIFICACION_DONDE_SE_REMITIRAN_LOS_CERTIFICADOS_CON_LA_NOVEDAD'
    ]
    
    // Verificar columnas requeridas
    const missingColumns = requiredColumns.filter(col => !cleanHeaders.includes(col))
    
    // Identificar columnas adicionales (que no estén en las esperadas)
    const expectedColumns = [
      ...requiredColumns,
      'CODIGO_SUBEMPRESA (SOLO PARA EL NIT 899999061)' // opcional
    ]
    const extraColumns = cleanHeaders.filter(col => !expectedColumns.includes(col))
    
    return {
      isValid: missingColumns.length === 0,
      missingColumns,
      extraColumns,
    }
  }, [])

  const config: MassiveUploadConfig = {
    acceptedFileTypes: [".xlsx", ".xls"],
    requiredSheetName: "DATOS",
    title: "Carga Masiva de Retiro de Trabajadores",
    instructions: [
      'Seleccione un archivo Excel (.xlsx) con la hoja "DATOS" con el formato correcto para retiro de trabajadores',
      'Columnas requeridas (exactas): TIPO_DOCUMENTO_EMPLEADOR, DOCUMENTO_EMPLEADOR, RAZÓN SOCIAL, TIPO_DOCUMENTO_TRABAJADOR, DOCUMENTO_TRABAJADOR, TIPO_VINCULACION, FECHA_RETIRO_TRABAJADOR (DD/MM/AAAA), CORREO_DE_NOTIFICACION_DONDE_SE_REMITIRAN_LOS_CERTIFICADOS_CON_LA_NOVEDAD',
      'CODIGO_SUBEMPRESA (SOLO PARA EL NIT 899999061) es opcional',
      'Formato de fecha esperado: DD/MM/AAAA',
    ],
    processData: processRetiroData,
    getContactInfo,
    validateFileStructure,
  }

  return (
    <MassiveUploadModal
      config={config}
      trigger={
        trigger || (
          <Button variant="outline" className="flex items-center gap-2 bg-transparent">
            <Upload className="h-4 w-4" />
            Carga Masiva
          </Button>
        )
      }
      onSuccess={onSuccess}
      onError={onError}
    />
  )
}