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
  'TIPO_DOCUMENTO_PERSONA': 'tipoDocPersona',
  'NUMERO_ DOCUMENTO_PERSONA': 'numeDocPersona',
  'PRIMER_APELLIDO': 'apellido1',
  'SEGUNDO_APELLIDO': 'apellido2',
  'PRIMER_NOMBRE': 'nombre1',
  'SEGUNDO_NOMBRE': 'nombre2',
  'FECHA_NACIMIENTO_(AAAA/MM/DD)': 'fechaNacimiento',
  'SEXO': 'sexo',
  'CODIGO_DANE_DEPARTAMENTO_RESIDENCIA': 'codigoDaneDepartamentoResidencia',
  'CODIGO_DANE_MUNICIPIO_DE_RESIDENCIA': 'codigoDaneMunicipioResidencia',
  'DIRECCION': 'direccion',
  'TELEFONO': 'telefono',
  'CODIGO_EPS': 'codigoEPS',
  'CODIGO_AFP': 'codigoAFP',
  'FECHA_INICIO_COBERTURA_(AAAA/MM/DD)': 'fechaInicioCobertura',
  'CODIGO_OCUPACION': 'codigoOcupacion',
  'SALARIO_(IBC)': 'salario',
  'CODIGO_ACTIVIDAD_ECONOMICA': 'codigoActividadEconomica',
  'CODIGO_DEPARTAMENTO_DONDE_LABORA': 'codigoDepartamentoDondeLabora',
  'CODIGO_CIUDAD_DONDE_LABORA': 'codigoCiudadDondeLabora',
  'TIPO_DOCUMENTO_EMPLEADOR': 'tipoDocEmp',
  'NUMERO_DOCUMENTO_EMPLEADOR': 'numeDocEmp',
  'CODIGO_SUB_EMPRESA (UNICAMENTE NIT 899999061)': 'codigoSubEmpresa',
  'MODO_TRABAJO': 'modoTrabajo'
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
            // Nuevo formato: AAAA/MM/DD
            const [year, month, day] = parts
            const yearNum = Number.parseInt(year, 10)
            const monthNum = Number.parseInt(month, 10)
            const dayNum = Number.parseInt(day, 10)

            if (yearNum >= 1900 && yearNum <= 2100 && monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31) {
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
          const formData: Partial<SeguimientoARLFormData> = {
            // Inicializar todos los campos nuevos con valores por defecto
            codigoDaneDepartamentoResidencia: "",
            codigoDaneMunicipioResidencia: "",
            codigoDepartamentoDondeLabora: "",
            codigoCiudadDondeLabora: "",
            codigoSubEmpresa: ""
          }
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

            // Inicializar campos DANE si no están presentes
            if (formField === "codigoDaneDepartamentoResidencia" && !formData.codigoDaneDepartamentoResidencia) {
              formData.codigoDaneDepartamentoResidencia = ""
            }
            if (formField === "codigoDaneMunicipioResidencia" && !formData.codigoDaneMunicipioResidencia) {
              formData.codigoDaneMunicipioResidencia = ""
            }
            if (formField === "codigoDepartamentoDondeLabora" && !formData.codigoDepartamentoDondeLabora) {
              formData.codigoDepartamentoDondeLabora = ""
            }
            if (formField === "codigoCiudadDondeLabora" && !formData.codigoCiudadDondeLabora) {
              formData.codigoCiudadDondeLabora = ""
            }
            if (formField === "codigoSubEmpresa" && !formData.codigoSubEmpresa) {
              formData.codigoSubEmpresa = ""
            }

            formData[formField as keyof SeguimientoARLFormData] = value ? String(value).trim() : ""
          })

          const missingFields = Object.keys(EXCEL_COLUMN_MAPPING).filter(col => !(col in row))
          if (missingFields.length > 0 && i === 0) {
            console.log("Missing fields in mapping:", missingFields)
            console.log("Available columns in row:", Object.keys(row))
          }

          const normalizedColumnMapping: Record<string, string> = {
            'tipo_documento_persona': 'tipoDocPersona',
            'numero_ documento_persona': 'numeDocPersona',
            'primer_apellido': 'apellido1',
            'segundo_apellido': 'apellido2',
            'primer_nombre': 'nombre1',
            'segundo_nombre': 'nombre2',
            'fecha_nacimiento_(aaaa/mm/dd)': 'fechaNacimiento',
            'sexo': 'sexo',
            'codigo_dane_departamento_residencia': 'codigoDaneDepartamentoResidencia',
            'codigo_dane_municipio_de_residencia': 'codigoDaneMunicipioResidencia',
            'direccion': 'direccion',
            'telefono': 'telefono',
            'codigo_eps': 'codigoEPS',
            'codigo_afp': 'codigoAFP',
            'fecha_inicio_cobertura_(aaaa/mm/dd)': 'fechaInicioCobertura',
            'codigo_ocupacion': 'codigoOcupacion',
            'salario_(ibc)': 'salario',
            'codigo_actividad_economica': 'codigoActividadEconomica',
            'codigo_departamento_donde_labora': 'codigoDepartamentoDondeLabora',
            'codigo_ciudad_donde_labora': 'codigoCiudadDondeLabora',
            'tipo_documento_empleador': 'tipoDocEmp',
            'numero_documento_empleador': 'numeDocEmp',
            'codigo_sub_empresa (unicamente nit 899999061)': 'codigoSubEmpresa',
            'codigo_sub_empresa': 'codigoSubEmpresa',
            'modo_trabajo': 'modoTrabajo'
          }

          Object.keys(row).forEach(columnName => {
            const normalizedName = columnName.toLowerCase().trim()
            let formField = normalizedColumnMapping[normalizedName]
            
            // Mapeo más flexible para columnas que pueden tener variaciones
            if (!formField) {
              // Buscar coincidencias parciales
              for (const [key, value] of Object.entries(normalizedColumnMapping)) {
                if (normalizedName.includes(key) || key.includes(normalizedName)) {
                  formField = value
                  break
                }
              }
            }
            
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

              // Inicializar campos DANE si no están presentes
              if (formField === "codigoDaneDepartamentoResidencia" && !formData.codigoDaneDepartamentoResidencia) {
                formData.codigoDaneDepartamentoResidencia = ""
              }
              if (formField === "codigoDaneMunicipioResidencia" && !formData.codigoDaneMunicipioResidencia) {
                formData.codigoDaneMunicipioResidencia = ""
              }
              if (formField === "codigoDepartamentoDondeLabora" && !formData.codigoDepartamentoDondeLabora) {
                formData.codigoDepartamentoDondeLabora = ""
              }
              if (formField === "codigoCiudadDondeLabora" && !formData.codigoCiudadDondeLabora) {
                formData.codigoCiudadDondeLabora = ""
              }
              if (formField === "codigoSubEmpresa" && !formData.codigoSubEmpresa) {
                formData.codigoSubEmpresa = ""
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
    return null
  }, [])

  const validateFileStructure = useCallback((headers: string[]) => {
    const expectedColumns = Object.keys(EXCEL_COLUMN_MAPPING)
    
    // Normalizar los headers para comparación más flexible
    const normalizedHeaders = headers.map(h => h.trim())
    const normalizedExpectedColumns = expectedColumns.map(col => col.trim())
    
    // Buscar columnas faltantes con comparación más flexible
    const missingColumns = normalizedExpectedColumns.filter(expectedCol => {
      return !normalizedHeaders.some(header => 
        header.toLowerCase() === expectedCol.toLowerCase() ||
        header.toLowerCase().includes(expectedCol.toLowerCase()) ||
        expectedCol.toLowerCase().includes(header.toLowerCase())
      )
    })
    
    // Buscar columnas adicionales (excluyendo las que ya están mapeadas)
    const extraColumns = normalizedHeaders.filter(header => {
      return !normalizedExpectedColumns.some(expectedCol => 
        header.toLowerCase() === expectedCol.toLowerCase() ||
        header.toLowerCase().includes(expectedCol.toLowerCase()) ||
        expectedCol.toLowerCase().includes(header.toLowerCase())
      )
    })

    console.log("Headers recibidos:", headers)
    console.log("Columnas esperadas:", expectedColumns)
    console.log("Columnas faltantes:", missingColumns)
    console.log("Columnas adicionales:", extraColumns)

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

