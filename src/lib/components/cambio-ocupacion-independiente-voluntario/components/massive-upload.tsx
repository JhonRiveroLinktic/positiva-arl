"use client";

import type React from "react";
import { useCallback } from "react";
import {
  MassiveUploadModal,
  type ProcessingResult,
  type MassiveUploadConfig,
} from "@/lib/components/core/form/massive-upload-modal";
import { useRegistroStore } from "../stores/registro-store";
import { 
  cambioOcupacionIndependienteVoluntarioValidationRules, 
  sanitizeCambioOcupacionFormData 
} from "../validations/validations";
import type { CambioOcupacionIndependienteVoluntarioFormData } from "../types/cambio-ocupacion-types";
import { Upload } from "lucide-react";
import { Button } from "@/lib/components/ui/button";

const EXCEL_COLUMN_MAPPING = {
  'TIPO_NOVEDAD': 'tipo_novedad',
  'TIPO_DOCUMENTO_TRABAJADOR': 'tipo_doc_trabajador',
  'DOCUMENTO_TRABAJADOR': 'documento_trabajador',
  'OCUPACION': 'nueva_ocupacion',
} as const;

type FormFieldKeys = (typeof EXCEL_COLUMN_MAPPING)[keyof typeof EXCEL_COLUMN_MAPPING];

interface CambioOcupacionIndependienteVoluntarioMassiveUploadProps {
  trigger?: React.ReactNode;
  onSuccess?: (result: ProcessingResult) => void;
  onError?: (error: string) => void;
}

export function CambioOcupacionIndependienteVoluntarioMassiveUpload({ 
  trigger, 
  onSuccess, 
  onError 
}: CambioOcupacionIndependienteVoluntarioMassiveUploadProps) {
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

  const processOcupacionData = useCallback(
    async (data: any[], setProgress: (progress: number) => void): Promise<ProcessingResult> => {
      const result: ProcessingResult = {
        success: 0,
        errors: [],
        total: data.length,
      };

      const validationResults: Array<{
        isValid: boolean;
        registro?: CambioOcupacionIndependienteVoluntarioFormData;
        errorData?: any;
      }> = [];

      const normalizedMapping = createNormalizedMapping();

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        setProgress(((i + 1) / data.length) * 50);

        try {
          const formData: Partial<CambioOcupacionIndependienteVoluntarioFormData> = {};
          const rowErrors: string[] = [];

          Object.keys(row).forEach(originalKey => {
            const normalizedKey = normalizeHeader(originalKey);
            const formField = normalizedMapping[normalizedKey];

            if (formField) {
              let value = row[originalKey];
              value = value !== undefined && value !== null ? String(value).trim() : "";
              formData[formField] = value;
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

          const sanitizedData = sanitizeCambioOcupacionFormData(formData as CambioOcupacionIndependienteVoluntarioFormData);
          const tempRegistro: CambioOcupacionIndependienteVoluntarioFormData = {
            id: `temp-${i}`,
            ...sanitizedData,
          };

          const fieldErrors: string[] = [];
          Object.entries(cambioOcupacionIndependienteVoluntarioValidationRules).forEach(([fieldName, rules]) => {
            const fieldValue = tempRegistro[fieldName as keyof CambioOcupacionIndependienteVoluntarioFormData];

            if ('required' in rules && rules.required && (fieldValue === undefined || fieldValue === null || fieldValue === "")) {
                fieldErrors.push(typeof rules.required === 'string' ? `${fieldName}: ${rules.required}` : `${fieldName}: Campo requerido.`);
            }

            if (fieldValue !== undefined && fieldValue !== null && 'validate' in rules && typeof rules.validate === 'function') {
              try {
                const validationResult = rules.validate(fieldValue as string);
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
            const finalRegistro: CambioOcupacionIndependienteVoluntarioFormData = {
              ...validResult.registro,
              metodo_subida: "cargue masivo",
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

  const validateFileStructure = useCallback((headers: string[]) => {
    const expectedNormalizedMapping = createNormalizedMapping();
    const expectedNormalizedHeaders = Object.keys(expectedNormalizedMapping);
    const normalizedHeadersInFile = headers.map(header => normalizeHeader(header));

    const missingColumns = expectedNormalizedHeaders.filter((col) => !normalizedHeadersInFile.includes(col));

    const extraColumns = normalizedHeadersInFile.filter((col) => !expectedNormalizedHeaders.includes(col));

    return {
      isValid: missingColumns.length === 0,
      missingColumns: missingColumns.map(col => Object.keys(EXCEL_COLUMN_MAPPING).find(key => normalizeHeader(key) === col) || col),
      extraColumns: extraColumns.map(col => headers[normalizedHeadersInFile.indexOf(col)] || col),
    };
  }, [normalizeHeader, createNormalizedMapping]);

  const config: MassiveUploadConfig = {
    acceptedFileTypes: [".xlsx", ".xls"],
    requiredSheetName: "DATOS",
    title: "Carga Masiva de Cambio de Ocupación - Voluntario",
    instructions: [
      'Seleccione un archivo Excel (.xlsx) con la hoja "DATOS" con el formato correcto para independientes voluntarios.',
      'Asegúrese de que los encabezados de las columnas coincidan exactamente con la plantilla. No se permiten columnas adicionales ni faltantes.',
    ],
    processData: processOcupacionData,
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
  );
}