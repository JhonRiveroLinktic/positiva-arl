"use client"

import type React from "react"
import { useCallback } from "react"
import {
  MassiveUploadModal,
  type ProcessingResult,
  type ContactInfo,
  type MassiveUploadConfig,
} from "@/lib/components/core/form/massive-upload-modal"
import { useRegistroStore } from "../stores/fecha-cambios-store"
import { FechaCambiosValidationRules, sanitizeFormData } from "../validations/validation-rules"
import type { Registro, FechaCambiosFormData } from "../types/fecha-cambios"
import { Upload } from "lucide-react"
import { Button } from "@/lib/components/ui/button"

const EXCEL_COLUMN_MAPPING = {
  'TIPO DOC EMPLEADOR': 'tipoDocEmp',
  'TIPO  DOC EMPLEADOR': 'tipoDocEmp',
  'Tipo Doc Empleador': 'tipoDocEmp',
  'DOCUMENTO EMPLEADOR': 'numeDocEmp',
  'Documento Empleador': 'numeDocEmp',
  'TIPO DOC TRABAJADOR': 'tipoDocPersona',
  'Tipo Doc Trabajador': 'tipoDocPersona',
  'DOCUMENTO TRABAJADOR': 'numeDocPersona',
  'Documento Trabajador': 'numeDocPersona',
  'TIPO DE VINCULACION': 'modoTrabajo',
  'TIPO DE VINCULACIÓN': 'modoTrabajo',
  'Tipo de Vinculacion': 'modoTrabajo',
  'Tipo de Vinculación': 'modoTrabajo',
  'ACTIVIDAD ECONOMICA': 'codigoActividadEconomica',
  'ACTIVIDAD ECONÓMICA': 'codigoActividadEconomica',
  'Actividad Economica': 'codigoActividadEconomica',
  'Actividad Económica': 'codigoActividadEconomica',
  'Correo de notificacion, donde se remitiran los certificados con la novedad': 'correoNotificacion',
  'Correo de notificación, donde se remitirán los certificados con la novedad': 'correoNotificacion',
  'CORREO DE NOTIFICACION, DONDE SE REMITIRAN LOS CERTIFICADOS CON LA NOVEDAD': 'correoNotificacion',
  'CORREO DE NOTIFICACIÓN, DONDE SE REMITIRÁN LOS CERTIFICADOS CON LA NOVEDAD': 'correoNotificacion',
  'Correo Notificacion': 'correoNotificacion',
  'Correo Notificación': 'correoNotificacion',
  'CORREO DE NOTIFICACION': 'correoNotificacion',
  'CORREO DE NOTIFICACIÓN': 'correoNotificacion',
  'Email': 'correoNotificacion',
  'email': 'correoNotificacion',
  'EMAIL': 'correoNotificacion'
}

interface FechaCambiosMassiveUploadProps {
  trigger?: React.ReactNode
  onSuccess?: (result: ProcessingResult) => void
  onError?: (error: string) => void
}

export function FechaCambiosMassiveUpload({ trigger, onSuccess, onError }: FechaCambiosMassiveUploadProps) {
  const { agregarRegistro } = useRegistroStore()

  const processFechaCambiosData = useCallback(
    async (data: any[], setProgress: (progress: number) => void): Promise<ProcessingResult> => {
      const result: ProcessingResult = {
        success: 0,
        errors: [],
        total: data.length,
      }

      console.log("Starting validation of all rows (All or Nothing mode)...")

      const validationResults: Array<{
        isValid: boolean
        registro?: Registro
        errorData?: any
      }> = []

      for (let i = 0; i < data.length; i++) {
        const row = data[i]
        setProgress(((i + 1) / data.length) * 50)

        try {
          const formData: Partial<FechaCambiosFormData> = {}
          const originalFormData: Partial<FechaCambiosFormData> = {}

          if (i < 3) {
            console.log(`Row ${i + 2} Debug:`)
            console.log("Raw row data:", row)
            console.log("Available row keys:", Object.keys(row))
          }

          Object.entries(EXCEL_COLUMN_MAPPING).forEach(([excelColumn, formField]) => {
            const value = row[excelColumn]

            if (i < 3) {
              console.log(`Direct mapping: ${excelColumn} -> ${formField} = "${value}"`)
            }

            originalFormData[formField as keyof FechaCambiosFormData] = 
              value !== undefined && value !== null ? String(value).trim() : ""
            formData[formField as keyof FechaCambiosFormData] = 
              value !== undefined && value !== null ? String(value).trim() : ""
          })

          const normalizedColumnMapping: Record<string, string> = {
            'tipo doc empleador': 'tipoDocEmp',
            'tipo  doc empleador': 'tipoDocEmp',
            'documento empleador': 'numeDocEmp',
            'tipo doc trabajador': 'tipoDocPersona',
            'documento trabajador': 'numeDocPersona',
            'tipo de vinculacion': 'modoTrabajo',
            'tipo de vinculación': 'modoTrabajo',
            'actividad economica': 'codigoActividadEconomica',
            'actividad económica': 'codigoActividadEconomica',
          }

          Object.keys(row).forEach(columnName => {
            const normalizedName = columnName.toLowerCase().trim()
            
            const formField = normalizedColumnMapping[normalizedName]
            if (formField && !formData[formField as keyof FechaCambiosFormData]) {
              const value = row[columnName]
              
              if (i < 3) {
                console.log(`Normalized mapping: ${columnName} -> ${formField} = "${value}"`)
              }

              originalFormData[formField as keyof FechaCambiosFormData] = 
                value !== undefined && value !== null ? String(value).trim() : ""
              formData[formField as keyof FechaCambiosFormData] = 
                value !== undefined && value !== null ? String(value).trim() : ""
            }

            if (!formData.correoNotificacion && (
              normalizedName.includes('correo') || 
              normalizedName.includes('email') || 
              normalizedName.includes('notificacion') ||
              normalizedName.includes('notificación')
            )) {
              const value = row[columnName]
              
              if (i < 3) {
                console.log(`Email field mapping: ${columnName} -> correoNotificacion = "${value}"`)
              }

              originalFormData.correoNotificacion = 
                value !== undefined && value !== null ? String(value).trim() : ""
              formData.correoNotificacion = 
                value !== undefined && value !== null ? String(value).trim() : ""
            }
          })

          if (i < 3) {
            console.log("Final mapped form data:", formData)
          }

          const sanitizedData = sanitizeFormData(formData as FechaCambiosFormData)

          const tempRegistro: Registro = {
            id: `temp-${i}`,
            ...(sanitizedData as Omit<Registro, "id">),
            metodoSubida: "cargue masivo",
          }

          const fieldErrors: string[] = []

          Object.entries(FechaCambiosValidationRules).forEach(([fieldName, rules]) => {
            const fieldValue = tempRegistro[fieldName as keyof Registro]

            if ('required' in rules && rules.required && (!fieldValue || fieldValue === "")) {
              fieldErrors.push(rules.required)
            }

            if (fieldValue && 'validate' in rules && typeof rules.validate === 'function') {
              try {
                const validationResult = rules.validate(fieldValue as string, tempRegistro)
                if (validationResult !== true && typeof validationResult === "string") {
                  fieldErrors.push(validationResult)
                }
              } catch (error) {
                console.warn(`Error validating field ${fieldName}:`, error)
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
              const actualValue = formData[fieldName as keyof FechaCambiosFormData]
              const displayValue =
                actualValue !== undefined && actualValue !== null && actualValue !== "" 
                  ? `"${actualValue}"` 
                  : "vacio"
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
        console.log("Validation failed for some rows. No records will be created.")
        result.errors = invalidResults.map((r) => r.errorData).filter(Boolean)
        setProgress(0)
        return result
      }

      console.log("All rows are valid. Proceeding to save records...")

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
            console.log(`Saved record ${result.success}/${validationResults.length}`)
          } catch (error) {
            console.error("Error saving record:", error)
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
    [agregarRegistro],
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
      'TIPO DE VINCULACION',
      'ACTIVIDAD ECONOMICA'
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
      missingColumns.push('Correo de notificacion (alguna variacion)')
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
    title: "Carga Masiva de Cambios de Riesgo",
    instructions: [
      'Seleccione un archivo Excel (.xlsx) con la hoja "DATOS" con el formato correcto para cambios de riesgo',
      'Columnas esperadas: TIPO DOC EMPLEADOR, DOCUMENTO EMPLEADOR, TIPO DOC TRABAJADOR, DOCUMENTO TRABAJADOR, TIPO DE VINCULACION, ACTIVIDAD ECONOMICA, Correo de notificacion',
      'El sistema validara todas las filas antes de guardar cualquier registro (modo "todo o nada")',
    ],
    processData: processFechaCambiosData,
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
            Carga Masiva Cambio de Riesgo
          </Button>
        )
      }
      onSuccess={onSuccess}
      onError={onError}
    />
  )
}