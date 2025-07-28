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
  'TIPO DOC EMPLEADOR': 'tipoDocEmp',
  'DOCUMENTO EMPLEADOR': 'numeDocEmp',
  'TIPO DOC TRABAJADOR': 'tipoDocPersona',
  'DOCUMENTO TRABAJADOR': 'numeDocPersona',
  'TIPO VINCULACIÓN': 'modoTrabajo',
  'TIPO VINCULACION': 'modoTrabajo',
  'FECHA RETIRO TRABAJADOR': 'fechaRetiroTrabajador',
  'Correo de notificación': 'correoNotificacion',
  'Correo de notificacion': 'correoNotificacion',
  'email': 'correoNotificacion',
  'EMAIL': 'correoNotificacion',
  'Correo Notificacion': 'correoNotificacion',
  'Correo Notificación': 'correoNotificacion',
}

interface RetiroTrabajadoresMassiveUploadProps {
  trigger?: React.ReactNode
  onSuccess?: (result: ProcessingResult) => void
  onError?: (error: string) => void
}

export function RetiroTrabajadoresMassiveUpload({ trigger, onSuccess, onError }: RetiroTrabajadoresMassiveUploadProps) {
  const { agregarRegistro } = useRegistroStore()

  // Conversión de fechas Excel a YYYY-MM-DD
  const convertDateFormat = useCallback((dateStr: any): string => {
    if (!dateStr || dateStr === "") return ""
    if (typeof dateStr === "number") {
      const date = XLSX.SSF.parse_date_code(dateStr)
      if (date && date.y && date.m && date.d) {
        return `${date.y}-${String(date.m).padStart(2, "0")}-${String(date.d).padStart(2, "0")}`
      }
      return ""
    }
    if (typeof dateStr === "string" && dateStr.trim() !== "") {
      const trimmed = dateStr.trim()
      if (trimmed.includes("/")) {
        const parts = trimmed.split("/")
        if (parts.length === 3) {
          const [day, month, year] = parts
          const dayNum = Number.parseInt(day, 10)
          const monthNum = Number.parseInt(month, 10)
          const yearNum = Number.parseInt(year, 10)
          if (dayNum >= 1 && dayNum <= 31 && monthNum >= 1 && monthNum <= 12 && yearNum >= 1900 && yearNum <= 2100) {
            return `${yearNum}-${String(monthNum).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`
          }
        }
      }
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
          Object.entries(EXCEL_COLUMN_MAPPING).forEach(([excelColumn, formField]) => {
            let value = row[excelColumn]
            if (formField === "fechaRetiroTrabajador") {
              value = convertDateFormat(value)
            }
            // @ts-expect-error - TODO: fix this
            formData[formField as keyof RetiroTrabajadoresFormData] = value !== undefined && value !== null ? String(value).trim() : ""
          })
          // Normalización para variantes de encabezados
          Object.keys(row).forEach(columnName => {
            const normalized = columnName.toLowerCase().replace(/á/g, "a").replace(/í/g, "i").replace(/é/g, "e").replace(/ó/g, "o").replace(/ú/g, "u").replace(/ñ/g, "n").trim()
            if ((normalized.includes("correo") || normalized.includes("email")) && !formData.correoNotificacion) {
              let value = row[columnName]
              formData.correoNotificacion = value !== undefined && value !== null ? String(value).trim() : ""
            }
          })
          const sanitizedData = sanitizeFormData(formData as RetiroTrabajadoresFormData)
          const tempRegistro: Registro = {
            id: `temp-${i}`,
            ...(sanitizedData as Omit<Registro, "id">),
            metodoSubida: "cargue masivo",
          }
          const fieldErrors: string[] = []
          Object.entries(RetiroTrabajadoresValidationRules).forEach(([fieldName, rules]) => {
            const fieldValue = tempRegistro[fieldName as keyof Registro]
            if ('required' in rules && rules.required && (!fieldValue || fieldValue === "")) {
              fieldErrors.push(rules.required)
            }
            if (fieldValue && 'validate' in rules && typeof rules.validate === 'function') {
              try {
                // @ts-expect-error - TODO: fix this
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
    const expectedColumns = [
      'TIPO DOC EMPLEADOR',
      'DOCUMENTO EMPLEADOR',
      'TIPO DOC TRABAJADOR',
      'DOCUMENTO TRABAJADOR',
      'TIPO VINCULACIÓN',
      'FECHA RETIRO TRABAJADOR',
    ]
    const emailColumns = Object.keys(EXCEL_COLUMN_MAPPING).filter(key => 
      EXCEL_COLUMN_MAPPING[key as keyof typeof EXCEL_COLUMN_MAPPING] === 'correoNotificacion'
    )
    const missingColumns = expectedColumns.filter((col) => !headers.includes(col))
    const hasEmailColumn = emailColumns.some(emailCol => headers.includes(emailCol)) ||
      headers.some(header => {
        const normalizedHeader = header.toLowerCase()
        return normalizedHeader.includes('correo') || 
               normalizedHeader.includes('email') || 
               normalizedHeader.includes('notificacion') ||
               normalizedHeader.includes('notificación')
      })
    if (!hasEmailColumn) {
      missingColumns.push('Correo de notificación (alguna variación)')
    }
    const extraColumns = headers.filter((col) => 
      ![...expectedColumns, ...emailColumns].includes(col) &&
      !col.toLowerCase().includes('correo') &&
      !col.toLowerCase().includes('email') &&
      !col.toLowerCase().includes('notificacion') &&
      !col.toLowerCase().includes('notificación')
    )
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
      'Columnas esperadas: TIPO DOC EMPLEADOR, DOCUMENTO EMPLEADOR, TIPO DOC TRABAJADOR, DOCUMENTO TRABAJADOR, TIPO VINCULACIÓN, FECHA RETIRO TRABAJADOR, Correo de notificación',
      'El sistema validará todas las filas antes de guardar cualquier registro (modo "todo o nada")',
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