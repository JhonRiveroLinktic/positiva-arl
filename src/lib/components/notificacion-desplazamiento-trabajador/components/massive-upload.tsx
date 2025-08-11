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
import { notificacionDesplazamientoTrabajadorValidationRules, sanitizeFormData } from "../validations/validation-rules";
import type { Registro, NotificacionDesplazamientoTrabajadorFormData } from "../types/notificacion-desplazamiento-trabajador-types"
import { Upload } from "lucide-react";
import { Button } from "@/lib/components/ui/button";
import { getMunicipiosDaneOptionsByDepartamento } from "@/lib/components/independiente-con-contrato/options/index";

const EXCEL_COLUMN_MAPPING = {
  'TIPO_DOCUMENTO_TRABAJADOR': 'tipo_documento_trabajador',
  'DOCUMENTO_TRABAJADOR': 'documento_trabajador',
  'TIPO_DOCUMENTO_EMPLEADOR': 'tipo_documento_empleador',
  'DOCUMENTO_EMPLEADOR': 'documento_empleador',
  'CODIGO_SUBEMPRESA_(SOLO_PARA_EL_NIT_899999061)': 'codigo_subempresa',
  'CODIGO_TIPO_VINCULACION': 'tipo_vinculacion',
  'FECHA_INICIO_DESPLAZAMIENTO (AAAA/MM/DD)': 'fecha_inicio_desplazamiento',
  'FECHA_FIN_DESPLAZAMIENTO (AAAA/MM/DD)': 'fecha_fin_desplazamiento',
  'CODIGO_DANE_DEPARTAMENTO_DESPLAZAMIENTO': 'codigo_departamento',
  'CODIGO_DANE_MUNICIPIO_DESPLAZAMIENTO': 'codigo_municipio',
  'MOTIVO_DESPLAZAMIENTO (MAX 200 CARACTERES)': 'motivo_desplazamiento',
} as const;

type FormFieldKeys = (typeof EXCEL_COLUMN_MAPPING)[keyof typeof EXCEL_COLUMN_MAPPING];

interface NotificacionDesplazamientoTrabajadorMassiveUploadProps {
  trigger?: React.ReactNode;
  onSuccess?: (result: ProcessingResult) => void;
  onError?: (error: string) => void;
}

export function NotificacionDesplazamientoTrabajadorMassiveUpload({ trigger, onSuccess, onError }: NotificacionDesplazamientoTrabajadorMassiveUploadProps) {
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

  const processRetiroData = useCallback(
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
          const formData: Partial<NotificacionDesplazamientoTrabajadorFormData> = {};
          const rowErrors: string[] = [];

          Object.keys(row).forEach(originalKey => {
            const normalizedKey = normalizeHeader(originalKey);
            const formField = normalizedMapping[normalizedKey];

            if (formField) {
              let value = row[originalKey];
              value = value !== undefined && value !== null ? String(value).trim() : "";
              
              if (formField === 'codigo_subempresa' && value) {
                const match = value.match(/^(\d+)/);
                if (match) {
                  value = match[1];
                }
              }

              if (formField === 'codigo_departamento' && value) {
                const match = value.match(/^(\d+)/);
                if (match) {
                  value = match[1];
                }
              }

              if (formField === 'codigo_municipio' && value) {
                const match = value.match(/^(\d+)/);
                if (match) {
                  value = match[1];
                }
              }

              // Convertir fechas de Excel a formato YYYY-MM-DD
              if ((formField === 'fecha_inicio_desplazamiento' || formField === 'fecha_fin_desplazamiento') && value) {
                const excelDate = parseFloat(value);
                if (!isNaN(excelDate)) {
                  const date = new Date((excelDate - 25569) * 86400 * 1000);
                  value = date.toISOString().split('T')[0];
                }
              }
              
              (formData as any)[formField] = value;
            }
          });

          if (formData.codigo_departamento && formData.codigo_municipio) {
            const municipiosDisponibles = getMunicipiosDaneOptionsByDepartamento(formData.codigo_departamento);
            const municipioExiste = municipiosDisponibles.some((mun: { value: string }) => mun.value === formData.codigo_municipio);
            if (!municipioExiste) {
              rowErrors.push(`El municipio ${formData.codigo_municipio} no existe en el departamento ${formData.codigo_departamento}.`);
            }
          }

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

          const sanitizedData = sanitizeFormData(formData as NotificacionDesplazamientoTrabajadorFormData);
          
          const tempRegistro: Registro = {
            id: `temp-${i}`,
            ...(sanitizedData as Omit<Registro, "id" | "metodoSubida">),
            metodo_subida: "cargue masivo",
          };

          const fieldErrors: string[] = [];
          Object.entries(notificacionDesplazamientoTrabajadorValidationRules).forEach(([fieldName, rules]) => {
            const fieldValue = tempRegistro[fieldName as keyof Registro];
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
      normalizeHeader('TIPO_DOCUMENTO_TRABAJADOR'),
      normalizeHeader('DOCUMENTO_TRABAJADOR'),
      normalizeHeader('TIPO_DOCUMENTO_EMPLEADOR'),
      normalizeHeader('DOCUMENTO_EMPLEADOR'),
      normalizeHeader('CODIGO_SUBEMPRESA_(SOLO_PARA_EL_NIT_899999061)'),
      normalizeHeader('CODIGO_TIPO_VINCULACION'),
      normalizeHeader('FECHA_INICIO_DESPLAZAMIENTO (AAAA/MM/DD)'),
      normalizeHeader('FECHA_FIN_DESPLAZAMIENTO (AAAA/MM/DD)'),
      normalizeHeader('CODIGO_DANE_DEPARTAMENTO_DESPLAZAMIENTO'),
      normalizeHeader('CODIGO_DANE_MUNICIPIO_DESPLAZAMIENTO'),
      normalizeHeader('MOTIVO_DESPLAZAMIENTO (MAX 200 CARACTERES)'),
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
    title: "Carga Masiva de Notificación Desplazamiento Trabajador",
    instructions: [
      'Seleccione un archivo Excel (.xlsx) con la hoja "DATOS" con el formato correcto para notificación desplazamiento trabajador.',
      'Asegúrese de que los encabezados de las columnas coincidan exactamente con la plantilla.',
    ],
    processData: processRetiroData,
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