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
import { useRegistroStore } from "../stores/registro-store"
import { arlValidationRules, sanitizeFormData } from "../validations/validation-rules"
import type { Registro, SeguimientoARLFormData } from "../types/seguimiento-arl-registration"
import { Upload } from "lucide-react"
import { Button } from "@/lib/components/ui/button"

const EXCEL_COLUMN_MAPPING = {
  'Tipo Doc Persona': 'tipoDocPersona',
  'Nume Doc Persona': 'numeDocPersona',
  'Apellido1': 'apellido1',
  'Apellido2': 'apellido2',
  'Nombre1': 'nombre1',
  'Nombre2': 'nombre2',
  'Fecha Nacimiento  (DD/MM/AAA)': 'fechaNacimiento',
  'Sexo': 'sexo',
  'Código Muni Residencia': 'codigoMuniResidencia',
  'Dirección': 'direccion',
  'Teléfono': 'telefono',
  'Código Eps': 'codigoEPS',
  'Código Afp': 'codigoAFP',
  'Fecha Inicio Cobertura (DD/MM/AAA)': 'fechaInicioCobertura',
  'Código Ocupación': 'codigoOcupacion',
  'Salario (IBC)': 'salario',
  'Código Act Económica': 'codigoActividadEconomica',
  'Tipo Doc Emp': 'tipoDocEmp',
  'Nume Doc Emp': 'numeDocEmp',
  'Modo Trabajo': 'modoTrabajo'
}

interface ARLMassiveUploadProps {
  trigger?: React.ReactNode
  onSuccess?: (result: ProcessingResult) => void
  onError?: (error: string) => void
}

export function ARLMassiveUpload({ trigger, onSuccess, onError }: ARLMassiveUploadProps) {
  const { agregarRegistro } = useRegistroStore()

  const convertDateFormat = useCallback((dateStr: any): string => {
    if (!dateStr || dateStr === "") return ""

    try {
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
    } catch (error) {
      console.warn("Error converting date:", dateStr, error)
      return ""
    }
  }, [])

  const processARLData = useCallback(
    async (data: any[], setProgress: (progress: number) => void): Promise<ProcessingResult> => {
      const result: ProcessingResult = {
        success: 0,
        errors: [],
        total: data.length,
      }

      console.log("📋 Starting validation of all rows (All or Nothing mode)...")

      const validationResults: Array<{
        isValid: boolean
        registro?: Registro
        errorData?: any
      }> = []

      for (let i = 0; i < data.length; i++) {
        const row = data[i]
        setProgress(((i + 1) / data.length) * 50)

        try {
          const formData: Partial<SeguimientoARLFormData> = {}
          const originalFormData: Partial<SeguimientoARLFormData> = {}

          Object.entries(EXCEL_COLUMN_MAPPING).forEach(([excelColumn, formField]) => {
            let value = row[excelColumn]

            if (i === 0) {
              console.log(`Row ${i + 2}: ${excelColumn} -> ${formField} = "${value}"`)
            }

            originalFormData[formField as keyof SeguimientoARLFormData] = value !== undefined && value !== null ? String(value).trim() : ""

            if (formField === "fechaNacimiento" || formField === "fechaInicioCobertura") {
              const originalValue = value
              value = convertDateFormat(value)
              if (i === 0) {
                console.log(`Date conversion: "${originalValue}" -> "${value}"`)
              }
            }

            if (formField === "codigoAFP" || formField === "modoTrabajo") {
              value = value !== undefined && value !== null ? String(value).trim() : ""
            }

            formData[formField as keyof SeguimientoARLFormData] = value ? String(value).trim() : ""
          })

          const missingFields = Object.keys(EXCEL_COLUMN_MAPPING).filter(col => !(col in row))
          if (missingFields.length > 0 && i === 0) {
            console.log("Missing fields in mapping:", missingFields)
            console.log("Available columns in row:", Object.keys(row))
          }

          const normalizedColumnMapping: Record<string, string> = {
            'tipo doc persona': 'tipoDocPersona',
            'nume doc persona': 'numeDocPersona',
            'apellido1': 'apellido1',
            'apellido2': 'apellido2',
            'nombre1': 'nombre1',
            'nombre2': 'nombre2',
            'fecha nacimiento': 'fechaNacimiento',
            'fecha nacimiento (dd/mm/aaa)': 'fechaNacimiento',
            'sexo': 'sexo',
            'código muni residencia': 'codigoMuniResidencia',
            'dirección': 'direccion',
            'teléfono': 'telefono',
            'código eps': 'codigoEPS',
            'código afp': 'codigoAFP',
            'fecha inicio cobertura': 'fechaInicioCobertura',
            'fecha inicio cobertura (dd/mm/aaa)': 'fechaInicioCobertura',
            'código ocupación': 'codigoOcupacion',
            'salario': 'salario',
            'salario (ibc)': 'salario',
            'código act económica': 'codigoActividadEconomica',
            'tipo doc emp': 'tipoDocEmp',
            'nume doc emp': 'numeDocEmp',
            'modo trabajo': 'modoTrabajo'
          }

          Object.keys(row).forEach(columnName => {
            const normalizedName = columnName.toLowerCase().trim()
            const formField = normalizedColumnMapping[normalizedName]
            
            if (formField && !formData[formField as keyof SeguimientoARLFormData]) {
              let value = row[columnName]
              
              if (i === 0) {
                console.log(`Normalized mapping: ${columnName} -> ${formField} = "${value}"`)
              }

              originalFormData[formField as keyof SeguimientoARLFormData] = value !== undefined && value !== null ? String(value).trim() : ""

              if (formField === "fechaNacimiento" || formField === "fechaInicioCobertura") {
                const originalValue = value
                value = convertDateFormat(value)
                if (i === 0) {
                  console.log(`Date conversion: "${originalValue}" -> "${value}"`)
                }
              }

              if (formField === "codigoAFP" || formField === "modoTrabajo") {
                value = value !== undefined && value !== null ? String(value).trim() : ""
              }

              formData[formField as keyof SeguimientoARLFormData] = value ? String(value).trim() : ""
            }
          })

          if (i === 0) {
            console.log("Mapped form data:", formData)
            console.log("Original form data:", originalFormData)
            console.log("Raw row data:", row)
            console.log("Available columns in row:", Object.keys(row))
          }

          const sanitizedData = sanitizeFormData(formData as SeguimientoARLFormData)

                      const tempRegistro: Registro = {
              id: `temp-${i}`,
              ...(sanitizedData as Omit<Registro, "id">),
              metodoSubida: "cargue masivo",
            }

          const fieldErrors: string[] = []

          Object.entries(arlValidationRules).forEach(([fieldName, rules]) => {
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
              const actualValue = formData[fieldName as keyof SeguimientoARLFormData]
              const displayValue =
                actualValue !== undefined && actualValue !== null && actualValue !== "" ? `"${actualValue}"` : "vacío"
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
        console.log("❌ Validation failed for some rows. No records will be created.")
        result.errors = invalidResults.map((r) => r.errorData).filter(Boolean)
        setProgress(0)
        return result
      }

      console.log("✅ All rows are valid. Proceeding to save records...")

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
            console.log(`💾 Saved record ${result.success}/${validationResults.length}`)
          } catch (error) {
            console.error("❌ Error saving record:", error)
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
    // En seguimiento, no requerimos datos de contacto desde query params
    // Los datos se ingresarán en el modal de envío
    return null
  }, [])

  const validateFileStructure = useCallback((headers: string[]) => {
    const expectedColumns = Object.keys(EXCEL_COLUMN_MAPPING)
    const missingColumns = expectedColumns.filter((col) => !headers.includes(col))
    const extraColumns = headers.filter((col) => !expectedColumns.includes(col))

    return {
      isValid: missingColumns.length === 0,
      missingColumns,
      extraColumns,
    }
  }, [])

  const config: MassiveUploadConfig = {
    acceptedFileTypes: [".xlsx", ".xls"],
    requiredSheetName: "DATOS",
    title: "Carga Masiva de Registros ARL",
    instructions: [
      'Seleccione un archivo Excel (.xlsx) con la hoja "DATOS" con el formato correcto para afiliaciones ARL',
    ],
    processData: processARLData,
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
            Carga Masiva ARL
          </Button>
        )
      }
      onSuccess={onSuccess}
      onError={onError}
    />
  )
}

