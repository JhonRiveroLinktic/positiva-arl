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
  'CODIGO_SUBEMPRESA (SOLO PARA EL NIT 899999061)': 'codigoSubempresa',
  'TIPO_DOCUMENTO_TRABAJADOR': 'tipoDocTrabajador',
  'DOCUMENTO_TRABAJADOR': 'documentoTrabajador',
  'TIPO_VINCULACION(1:DEPENDIENTE_O_2:INDEPENDIENTE)': 'tipoVinculacion',
  'TIPO_VINCULACION (1:DEPENDIENTE_O_2:INDEPENDIENTE)': 'tipoVinculacion',
  'TIPO_VINCULACION (1:DEPENDIENTE_O_ 2:INDEPENDIENTE)': 'tipoVinculacion',
  'FECHA_RETIRO_TRABAJADOR (AAAA/MM/DD)': 'fechaRetiroTrabajador',
  // Variaciones con espacios y comillas
  'TIPO_DOCUMENTO_EMPLEADOR ': 'tipoDocEmpleador',
  ' DOCUMENTO_EMPLEADOR': 'documentoEmpleador',
  '" TIPO_DOCUMENTO_TRABAJADOR"': 'tipoDocTrabajador',
  'TIPO_DOCUMENTO_TRABAJADOR"': 'tipoDocTrabajador',
  'TIPO_DOCUMENTO_TRABAJADOR ': 'tipoDocTrabajador',
  // Agregar la variación específica que aparece en tu Excel
  '" TIPO_DOCUMENTO_TRABAJADOR\n"': 'tipoDocTrabajador',
}

interface RetiroTrabajadoresMassiveUploadProps {
  trigger?: React.ReactNode
  onSuccess?: (result: ProcessingResult) => void
  onError?: (error: string) => void
}

export function RetiroTrabajadoresMassiveUpload({ trigger, onSuccess, onError }: RetiroTrabajadoresMassiveUploadProps) {
  const { agregarRegistro } = useRegistroStore()

  const normalizeHeader = useCallback((header: string): string => {
    return header.trim().replace(/\s+/g, '_').replace(/"/g, '').replace(/\n/g, '').toUpperCase();
  }, []);

  const createNormalizedMapping = useCallback(() => {
    const normalizedMapping: Record<string, string> = {};
    Object.entries(EXCEL_COLUMN_MAPPING).forEach(([excelColumn, formField]) => {
      normalizedMapping[normalizeHeader(excelColumn)] = formField;
    });
    
    const additionalMappings: Record<string, string> = {
      'TIPO_DOCUMENTO_EMPLEADOR': 'tipoDocEmpleador',
      'DOCUMENTO_EMPLEADOR': 'documentoEmpleador',
      'CODIGO_SUBEMPRESA_SOLO_PARA_EL_NIT_899999061': 'codigoSubempresa',
      'TIPO_DOCUMENTO_TRABAJADOR': 'tipoDocTrabajador',
      'DOCUMENTO_TRABAJADOR': 'documentoTrabajador',
      'TIPO_VINCULACION1_DEPENDIENTE_O_2_INDEPENDIENTE': 'tipoVinculacion',
      'TIPO_VINCULACION_1_DEPENDIENTE_O__2_INDEPENDIENTE': 'tipoVinculacion',
      'FECHA_RETIRO_TRABAJADOR_AAAA_MM_DD': 'fechaRetiroTrabajador',
    };
    
    Object.entries(additionalMappings).forEach(([normalizedKey, formField]) => {
      normalizedMapping[normalizedKey] = formField;
    });
    
    return normalizedMapping;
  }, [normalizeHeader]);

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
          const normalizedMapping = createNormalizedMapping();
          
          Object.keys(row).forEach(originalKey => {
            const normalizedKey = normalizeHeader(originalKey);
            const formField = normalizedMapping[normalizedKey];

            console.log(`Mapeo: "${originalKey}" -> "${normalizedKey}" -> ${formField || 'NO ENCONTRADO'}`);

            if (formField) {
              let value = row[originalKey];
              value = value !== undefined && value !== null ? String(value).trim() : "";
              
              if (formField === 'fechaRetiroTrabajador') {
                if (value && !isNaN(Number(value))) {
                  const excelDate = Number(value);
                  const date = new Date((excelDate - 25569) * 86400 * 1000);
                  value = date.toISOString().split('T')[0];
                }
              }
              
              if (formField === 'codigoSubempresa' && value) {
                const match = value.match(/^(\d+)/);
                if (match) {
                  value = match[1];
                }
              }
              
              (formData as any)[formField] = value;
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
    [agregarRegistro, normalizeHeader, createNormalizedMapping],
  )

  const getContactInfo = useCallback((): ContactInfo | null => {
    return null
  }, [])

  const validateFileStructure = useCallback((headers: string[]) => {
    console.log('Headers originales:', headers);
    
    const expectedNormalizedMapping = createNormalizedMapping();
    const expectedNormalizedHeaders = Object.keys(expectedNormalizedMapping);

    const normalizedHeadersInFile = headers.map(header => normalizeHeader(header));
    console.log('Headers normalizados:', normalizedHeadersInFile);
    console.log('Headers esperados:', expectedNormalizedHeaders);

    // Columnas requeridas básicas
    const requiredBasicColumns = [
      normalizeHeader('TIPO_DOCUMENTO_EMPLEADOR'),
      normalizeHeader('DOCUMENTO_EMPLEADOR'),
      normalizeHeader('CODIGO_SUBEMPRESA (SOLO PARA EL NIT 899999061)'),
      normalizeHeader('TIPO_DOCUMENTO_TRABAJADOR'),
      normalizeHeader('DOCUMENTO_TRABAJADOR'),
      normalizeHeader('FECHA_RETIRO_TRABAJADOR (AAAA/MM/DD)'),
    ];

    // Verificar columnas básicas requeridas
    const missingBasicColumns = requiredBasicColumns.filter((col) => {
       const found = normalizedHeadersInFile.includes(col);
       return !found;
    });

    // Verificar que existe al menos una variación de TIPO_VINCULACION
    const tipoVinculacionVariations = [
      normalizeHeader('TIPO_VINCULACION(1:DEPENDIENTE_O_2:INDEPENDIENTE)'),
      normalizeHeader('TIPO_VINCULACION (1:DEPENDIENTE_O_2:INDEPENDIENTE)'),
      normalizeHeader('TIPO_VINCULACION (1:DEPENDIENTE_O_ 2:INDEPENDIENTE)'),
    ];

    console.log('Variaciones de TIPO_VINCULACION buscadas:', tipoVinculacionVariations);
    console.log('¿Existe alguna variación?', tipoVinculacionVariations.some(variation => 
      normalizedHeadersInFile.includes(variation)
    ));

    const hasTipoVinculacion = tipoVinculacionVariations.some(variation => 
      normalizedHeadersInFile.includes(variation)
    );

    const missingColumns = [...missingBasicColumns];
    if (!hasTipoVinculacion) {
      missingColumns.push('TIPO_VINCULACION (cualquier variación válida)');
    }

    const extraColumns = normalizedHeadersInFile.filter((col) => {
       const isValid = expectedNormalizedHeaders.includes(col);
       return !isValid;
    });

    return {
      isValid: missingColumns.length === 0,
      missingColumns: missingColumns.map(col => {
        if (col === 'TIPO_VINCULACION (cualquier variación válida)') {
          return col;
        }
        return Object.keys(EXCEL_COLUMN_MAPPING).find(key => normalizeHeader(key) === col) || col;
      }),
      extraColumns: extraColumns.map(col => headers[normalizedHeadersInFile.indexOf(col)] || col),
    };
  }, [normalizeHeader, createNormalizedMapping]);

  const config: MassiveUploadConfig = {
    acceptedFileTypes: [".xlsx", ".xls"],
    requiredSheetName: "DATOS",
    title: "Carga Masiva de Retiro de Trabajadores",
    instructions: [
      'Seleccione un archivo Excel (.xlsx) con la hoja "DATOS" con el formato correcto para retiro de trabajadores',
      'Asegúrese de que los encabezados de las columnas coincidan exactamente con la plantilla.',
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