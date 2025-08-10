"use client";

import type React from "react";
import { useCallback } from "react";
import {
  MassiveUploadModal,
  type ProcessingResult,
  type ContactInfo,
  type MassiveUploadConfig,
} from "@/lib/components/core/form/massive-upload-modal";
import { useRegistroStore } from "../stores/registro-store";
import { prorrogaFechaContratoTrabajadorIndependienteValidationRules, sanitizeFormData } from "../validations/validation-rules";
import type { Registro, ProrrogaFechaContratoTrabajadorIndependienteFormData } from "../types/prorroga-fecha-contrato-types"
import { Upload } from "lucide-react";
import { Button } from "@/lib/components/ui/button";

const EXCEL_COLUMN_MAPPING = {
  'TIPO_DOCUMENTO_CONTRATANTE': 'tipo_doc_contratante',
  'DOCUMENTO_CONTRATANTE': 'documento_contratante',
  'CODIGO_SUBEMPRESA_(SOLO PARA EL NIT 899999061)': 'codigo_subempresa',
  'TIPO_DOCUMENTO_TRABAJADOR': 'tipo_doc_trabajador',
  'DOCUMENTO_TRABAJADOR': 'documento_trabajador',
  '(1: CAMBIO_FECHAS_O_2:PRORROGA)': 'cambio_fechas_o_prorroga',
  'FECHA_INICIO_DE_CONTRATO (AAAA/MM/DD)': 'fecha_inicio_contrato_original',
  'FECHA_FIN_DE_CONTRATO (AAAA/MM/DD)': 'fecha_fin_contrato_nueva',
  'VALOR DEL CONTRATO ( SOLO APLICA PARA PRORROGA)': 'valor_contrato_prorroga',
  // Variaciones con espacios y comillas
  'TIPO_DOCUMENTO_CONTRATANTE ': 'tipo_doc_contratante',
  ' DOCUMENTO_CONTRATANTE': 'documento_contratante',
  '" TIPO_DOCUMENTO_TRABAJADOR"': 'tipo_doc_trabajador',
  'TIPO_DOCUMENTO_TRABAJADOR"': 'tipo_doc_trabajador',
  'TIPO_DOCUMENTO_TRABAJADOR ': 'tipo_doc_trabajador',
  'VALOR DEL CONTRATO ( SOLO APLICA PARA PRORROGA) ': 'valor_contrato_prorroga',
  // Agregar la variación específica que aparece en tu Excel
  '" TIPO_DOCUMENTO_TRABAJADOR\n"': 'tipo_doc_trabajador',
} as const;

type FormFieldKeys = (typeof EXCEL_COLUMN_MAPPING)[keyof typeof EXCEL_COLUMN_MAPPING];

interface ProrrogaFechaContratoTrabajadorIndependienteMassiveUploadProps {
  trigger?: React.ReactNode;
  onSuccess?: (result: ProcessingResult) => void;
  onError?: (error: string) => void;
}

export function ProrrogaFechaContratoTrabajadorIndependienteMassiveUpload({ trigger, onSuccess, onError }: ProrrogaFechaContratoTrabajadorIndependienteMassiveUploadProps) {
  const { agregarRegistro } = useRegistroStore();

  const normalizeHeader = useCallback((header: string): string => {
    return header.trim().replace(/\s+/g, '_').replace(/"/g, '').replace(/\n/g, '').toUpperCase();
  }, []);

  const createNormalizedMapping = useCallback(() => {
    const normalizedMapping: Record<string, FormFieldKeys> = {};
    Object.entries(EXCEL_COLUMN_MAPPING).forEach(([excelColumn, formField]) => {
      normalizedMapping[normalizeHeader(excelColumn)] = formField;
    });
    
    const additionalMappings: Record<string, FormFieldKeys> = {
      'TIPO_DOCUMENTO_CONTRATANTE': 'tipo_doc_contratante',
      'DOCUMENTO_CONTRATANTE': 'documento_contratante',
      'CODIGO_SUBEMPRESA_SOLO_PARA_EL_NIT_899999061': 'codigo_subempresa',
      'TIPO_DOCUMENTO_TRABAJADOR': 'tipo_doc_trabajador',
      'DOCUMENTO_TRABAJADOR': 'documento_trabajador',
      '1_CAMBIO_FECHAS_O_2_PRORROGA': 'cambio_fechas_o_prorroga',
      'FECHA_INICIO_DE_CONTRATO_AAAA_MM_DD': 'fecha_inicio_contrato_original',
      'FECHA_FIN_DE_CONTRATO_AAAA_MM_DD': 'fecha_fin_contrato_nueva',
      'VALOR_DEL_CONTRATO_SOLO_APLICA_PARA_PRORROGA': 'valor_contrato_prorroga',
    };
    
    Object.entries(additionalMappings).forEach(([normalizedKey, formField]) => {
      normalizedMapping[normalizedKey] = formField;
    });
    
    return normalizedMapping;
  }, [normalizeHeader]);

  const processIndependienteData = useCallback(
    async (data: any[], setProgress: (progress: number) => void): Promise<ProcessingResult> => {
      const result: ProcessingResult = {
        success: 0,
        errors: [],
        total: data.length,
      };
      const validationResults: Array<{
        isValid: boolean;
        registro?: Registro;
        errorData?: any;
      }> = [];

      const normalizedMapping = createNormalizedMapping();
       
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        setProgress(((i + 1) / data.length) * 50);

        try {
          const formData: Partial<ProrrogaFechaContratoTrabajadorIndependienteFormData> = {};
          const rowErrors: string[] = [];

              Object.keys(row).forEach(originalKey => {
              const normalizedKey = normalizeHeader(originalKey);
              const formField = normalizedMapping[normalizedKey];

              console.log(`Mapeo: "${originalKey}" -> "${normalizedKey}" -> ${formField || 'NO ENCONTRADO'}`);

                              if (formField) {
                  let value = row[originalKey];
                  value = value !== undefined && value !== null ? String(value).trim() : "";
                  
                  if (formField === 'fecha_inicio_contrato_original' || formField === 'fecha_fin_contrato_nueva') {
                    if (value && !isNaN(Number(value))) {
                      const excelDate = Number(value);
                      const date = new Date((excelDate - 25569) * 86400 * 1000);
                      value = date.toISOString().split('T')[0];
                    }
                  }
                  
                  if (formField === 'codigo_subempresa' && value) {
                    const match = value.match(/^(\d+)/);
                    if (match) {
                      value = match[1];
                    }
                  }
                  
                  if (formField === 'valor_contrato_prorroga') {
                    if (value === "" || value === null || value === undefined) {
                      value = "";
                    } else {
                      value = String(value).trim();
                    }
                  }
                  
                  (formData as any)[formField] = value;
                }
            });

          if (rowErrors.length > 0) {
            validationResults.push({
                isValid: false,
                errorData: {
                    row: i + 2,
                    errors: rowErrors,
                    rawData: row,
                },
            });
            continue;
          }

          const sanitizedData = sanitizeFormData(formData as ProrrogaFechaContratoTrabajadorIndependienteFormData);
            
          const tempRegistro: Registro = {
              id: `temp-${i}`,
              ...(sanitizedData as Omit<Registro, "id" | "metodoSubida">),
              metodo_subida: "cargue masivo",
            };

                     const fieldErrors: string[] = [];
           Object.entries(prorrogaFechaContratoTrabajadorIndependienteValidationRules).forEach(([fieldName, rules]) => {
             const fieldValue = tempRegistro[fieldName as keyof Registro];
             
             // Para valor_contrato_prorroga, aplicar validación especial
             if (fieldName === 'valor_contrato_prorroga') {
               if ('validate' in rules && typeof rules.validate === 'function') {
                 try {
                   // Convertir null a string vacío para la validación
                   const valueForValidation = fieldValue === null ? "" : fieldValue;
                   const validationResult = rules.validate(valueForValidation as string, tempRegistro);
                   if (validationResult !== true && typeof validationResult === "string") {
                     fieldErrors.push(`${fieldName}: ${validationResult}`);
                   }
                 } catch (error) {
                   console.warn(`Error al ejecutar validación personalizada para ${fieldName} (fila ${i + 2}):`, error);
                   fieldErrors.push(`${fieldName}: Error en validación personalizada.`);
                 }
               }
               return; // Saltamos la validación de requerido para este campo en carga masiva
             }
             
             // Para otros campos, aplicar validación normal
             if ('required' in rules && rules.required && (fieldValue === undefined || fieldValue === null || fieldValue === "")) {
                 fieldErrors.push(typeof rules.required === 'string' ? `${fieldName}: ${rules.required}` : `${fieldName}: Campo requerido.`);
             }

             if (fieldValue !== undefined && fieldValue !== null && fieldValue !== "" && 'validate' in rules && typeof rules.validate === 'function') {
               try {
                 const validationResult = rules.validate(fieldValue as string, tempRegistro);
                 if (validationResult !== true && typeof validationResult === "string") {
                   fieldErrors.push(`${fieldName}: ${validationResult}`);
                 }
               } catch (error) {
                 console.warn(`Error al ejecutar validación personalizada para ${fieldName} (fila ${i + 2}):`, error);
                 fieldErrors.push(`${fieldName}: Error en validación personalizada.`);
               }
             }
           });

          if (fieldErrors.length === 0) {
            validationResults.push({
              isValid: true,
              registro: tempRegistro,
            });
          } else {
            validationResults.push({
              isValid: false,
              errorData: {
                row: i + 2, 
                errors: fieldErrors,
                rawData: row, 
              },
            });
          }
        } catch (err) {
          validationResults.push({
            isValid: false,
            errorData: {
              row: i + 2,
              errors: [`Error procesando fila: ${err instanceof Error ? err.message : "Error desconocido"}`],
              rawData: row,
            },
          });
        }
      }

      const invalidResults = validationResults.filter((r) => !r.isValid);
      if (invalidResults.length > 0) {
        result.errors = invalidResults.map((r) => r.errorData).filter(Boolean);
        setProgress(0);
        return result;
      }

      for (let i = 0; i < validationResults.length; i++) {
        const validResult = validationResults[i];
        setProgress(50 + ((i + 1) / validationResults.length) * 50);

        if (validResult.isValid && validResult.registro) {
          try {
            const finalRegistro: Registro = {
              ...validResult.registro,
              id: `import-${Date.now()}-${i}`,
            };
            agregarRegistro(finalRegistro);
            result.success++;
          } catch (error) {
            result.errors.push({
              row: i + 2,
              errors: [`Error al guardar: ${error instanceof Error ? error.message : "Error desconocido"}`],
              rawData: validResult.registro,
            });
            return result;
          }
        }
      }

      return result;
    },
    [agregarRegistro, normalizeHeader, createNormalizedMapping],
  );

  const getContactInfo = useCallback((): ContactInfo | null => {
    return null;
  }, []);

  const validateFileStructure = useCallback((headers: string[]) => {
    const expectedNormalizedMapping = createNormalizedMapping();
    const expectedNormalizedHeaders = Object.keys(expectedNormalizedMapping);

    const normalizedHeadersInFile = headers.map(header => normalizeHeader(header));

    const requiredColumnsNormalized = [
      normalizeHeader('TIPO_DOCUMENTO_CONTRATANTE'),
      normalizeHeader('DOCUMENTO_CONTRATANTE'),
      normalizeHeader('CODIGO_SUBEMPRESA_(SOLO_PARA_EL_NIT_899999061)'),
      normalizeHeader('TIPO_DOCUMENTO_TRABAJADOR'),
      normalizeHeader('DOCUMENTO_TRABAJADOR'),
      normalizeHeader('(1: CAMBIO_FECHAS_O_2:PRORROGA)'),
      normalizeHeader('FECHA_INICIO_DE_CONTRATO (AAAA/MM/DD)'),
      normalizeHeader('FECHA_FIN_DE_CONTRATO (AAAA/MM/DD)'),
    ];

    const missingColumns = requiredColumnsNormalized.filter((col) => {
       const found = normalizedHeadersInFile.includes(col);
       return !found;
    });

    const extraColumns = normalizedHeadersInFile.filter((col) => {
       const isValid = expectedNormalizedHeaders.includes(col);
       return !isValid;
    });

    return {
      isValid: missingColumns.length === 0,
      missingColumns: missingColumns.map(col => Object.keys(EXCEL_COLUMN_MAPPING).find(key => normalizeHeader(key) === col) || col),
      extraColumns: extraColumns.map(col => headers[normalizedHeadersInFile.indexOf(col)] || col),
    };
  }, [normalizeHeader, createNormalizedMapping]);


  const config: MassiveUploadConfig = {
    acceptedFileTypes: [".xlsx", ".xls"],
    requiredSheetName: "DATOS",
    title: "Carga Masiva de Prórroga de Fecha de Contrato",
    instructions: [
      'Seleccione un archivo Excel (.xlsx) con la hoja "DATOS" con el formato correcto para prórroga de fecha de contrato.',
      'Asegúrese de que los encabezados de las columnas coincidan exactamente con la plantilla.',
    ],
    processData: processIndependienteData,
    getContactInfo,
    validateFileStructure,
  };

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