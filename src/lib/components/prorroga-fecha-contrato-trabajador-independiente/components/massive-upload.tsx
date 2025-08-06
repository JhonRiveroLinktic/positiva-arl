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
  'NOMBRES_Y_APELLIDOS_Y/O_RAZON_SOCIAL': 'razon_social',
  'CODIGO_SUBEMPRESA_(SOLO_PARA_EL_NIT_899999061)': 'codigo_subempresa',
  'TIPO_DOCUMENTO_TRABAJADOR': 'tipo_doc_trabajador',
  'DOCUMENTO_TRABAJADOR': 'documento_trabajador',
  'FECHA_INICIO_DE_CONTRATO_(AAAA/MM/DD)': 'fecha_inicio_contrato_original',
  'FECHA_FIN_DE_CONTRATO_(AAAA/MM/DD)': 'fecha_fin_contrato_anterior',
  'VALOR_DEL_CONTRATO_(SOLO_APLICA_PARA_PRORROGA)': 'valor_contrato_prorroga',
  'CORREO_ELECTRONICO_DE_NOTIFICACION': 'correo_electronico',
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
    return header.trim().replace(/\s+/g, '_').toUpperCase();
  }, []);

  const createNormalizedMapping = useCallback(() => {
    const normalizedMapping: Record<string, FormFieldKeys> = {};
    Object.entries(EXCEL_COLUMN_MAPPING).forEach(([excelColumn, formField]) => {
      normalizedMapping[normalizeHeader(excelColumn)] = formField;
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

            if (formField) {
              let value = row[originalKey];
              value = value !== undefined && value !== null ? String(value).trim() : "";
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
            if ('required' in rules && rules.required && (fieldValue === undefined || fieldValue === null || fieldValue === "")) {
                fieldErrors.push(typeof rules.required === 'string' ? `${fieldName}: ${rules.required}` : `${fieldName}: Campo requerido.`);
            }

            if (fieldValue !== undefined && fieldValue !== null && 'validate' in rules && typeof rules.validate === 'function') {
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

    console.log('Headers originales del archivo:', headers);
    console.log('Headers normalizados del archivo:', normalizedHeadersInFile);

    const requiredColumnsNormalized = [
      normalizeHeader('TIPO_DOCUMENTO_CONTRATANTE'),
      normalizeHeader('DOCUMENTO_CONTRATANTE'),
      normalizeHeader('NOMBRES_Y_APELLIDOS_Y/O_RAZON_SOCIAL'),
      normalizeHeader('CODIGO_SUBEMPRESA_(SOLO_PARA_EL_NIT_899999061)'),
      normalizeHeader('TIPO_DOCUMENTO_TRABAJADOR'),
      normalizeHeader('DOCUMENTO_TRABAJADOR'),
      normalizeHeader('FECHA_INICIO_DE_CONTRATO_(AAAA/MM/DD)'),
      normalizeHeader('FECHA_FIN_DE_CONTRATO_(AAAA/MM/DD)'),
      normalizeHeader('VALOR_DEL_CONTRATO_(SOLO_APLICA_PARA_PRORROGA)'),
      normalizeHeader('CORREO_ELECTRONICO_DE_NOTIFICACION'),
    ];

    const missingColumns = requiredColumnsNormalized.filter((col) => {
      const found = normalizedHeadersInFile.includes(col);
      if (!found) {
        console.log(`Columna requerida faltante: "${col}"`);
      }
      return !found;
    });

    const extraColumns = normalizedHeadersInFile.filter((col) => {
      const isValid = expectedNormalizedHeaders.includes(col);
      if (!isValid) {
        console.log(`Columna extra encontrada: "${col}"`);
      }
      return !isValid;
    });

    console.log('Columnas faltantes:', missingColumns.map(col => Object.keys(EXCEL_COLUMN_MAPPING).find(key => normalizeHeader(key) === col) || col));
    console.log('Columnas extra:', extraColumns.map(col => {
        const originalName = headers[normalizedHeadersInFile.indexOf(col)];
        return originalName || col;
    }));

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