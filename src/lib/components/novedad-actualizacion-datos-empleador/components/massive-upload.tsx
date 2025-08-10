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
import { novedadActualizacionDatosEmpleadorValidationRules, sanitizeFormData } from "../validations/validation-rules";
import type { Registro, NovedadActualizacionDatosEmpleadorFormData } from "../types/novedad-actualizacion-datos-empleador-types"
import { Upload } from "lucide-react";
import { Button } from "@/lib/components/ui/button";
import { getMunicipiosDaneOptionsByDepartamento } from "@/lib/components/independiente-con-contrato/options/index";

const EXCEL_COLUMN_MAPPING = {
  'TIPO_DOCUMENTO_EMPLEADOR': 'tipo_documento_empleador',
  'DOCUMENTO_EMPLEADOR': 'documento_empleador',
  'CODIGO_SUBEMPRESA_(SOLO_PARA_EL_NIT_899999061)': 'codigo_subempresa',
  'CORREO_ELECTRONICO': 'correo_electronico',
  'DIRECCION': 'direccion',
  'TELEFONO': 'telefono',
  'CODIGO_DEPARTAMENTO': 'departamento',
  'CODIGO_MUNICIPIO': 'municipio',
  'TIPO_DOCUMENTO_REPRESENTANTE_LEGAL': 'tipo_documento_representante_legal',
  'DOCUMENTO_REPRESENTANTE_LEGAL': 'documento_representante_legal',
  'PRIMER_NOMBRE_REPRESENTANTE_LEGAL': 'primer_nombre_representante_legal',
  'SEGUNDO_NOMBRE_REPRESENTANTE_LEGAL': 'segundo_nombre_representante_legal',
  'PRIMER_APELLIDO_REPRESENTANTE_LEGAL': 'primer_apellido_representante_legal',
  'SEGUNDO_APELLIDO_REPRESENTANTE_LEGAL': 'segundo_apellido_representante_legal',
} as const;

type FormFieldKeys = (typeof EXCEL_COLUMN_MAPPING)[keyof typeof EXCEL_COLUMN_MAPPING];

interface NovedadActualizacionDatosEmpleadorMassiveUploadProps {
  trigger?: React.ReactNode;
  onSuccess?: (result: ProcessingResult) => void;
  onError?: (error: string) => void;
}

export function NovedadActualizacionDatosEmpleadorMassiveUpload({ trigger, onSuccess, onError }: NovedadActualizacionDatosEmpleadorMassiveUploadProps) {
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
          const formData: Partial<NovedadActualizacionDatosEmpleadorFormData> = {};
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

          if (formData.departamento && formData.municipio) {
            const municipiosDisponibles = getMunicipiosDaneOptionsByDepartamento(formData.departamento);
            const municipioExiste = municipiosDisponibles.some((mun: { value: string }) => mun.value === formData.municipio);
            if (!municipioExiste) {
              rowErrors.push(`El municipio ${formData.municipio} no existe en el departamento ${formData.departamento}.`);
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

          const sanitizedData = sanitizeFormData(formData as NovedadActualizacionDatosEmpleadorFormData);
          
          const tempRegistro: Registro = {
            id: `temp-${i}`,
            ...(sanitizedData as Omit<Registro, "id" | "metodoSubida">),
            metodo_subida: "cargue masivo",
          };

          const fieldErrors: string[] = [];
          Object.entries(novedadActualizacionDatosEmpleadorValidationRules).forEach(([fieldName, rules]) => {
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
      normalizeHeader('TIPO_DOCUMENTO_EMPLEADOR'),
      normalizeHeader('DOCUMENTO_EMPLEADOR'),
      normalizeHeader('CODIGO_SUBEMPRESA_(SOLO_PARA_EL_NIT_899999061)'),
      normalizeHeader('CORREO_ELECTRONICO'),
      normalizeHeader('DIRECCION'),
      normalizeHeader('TELEFONO'),
      normalizeHeader('CODIGO_DEPARTAMENTO'),
      normalizeHeader('CODIGO_MUNICIPIO'),
      normalizeHeader('TIPO_DOCUMENTO_REPRESENTANTE_LEGAL'),
      normalizeHeader('DOCUMENTO_REPRESENTANTE_LEGAL'),
      normalizeHeader('PRIMER_NOMBRE_REPRESENTANTE_LEGAL'),
      normalizeHeader('PRIMER_APELLIDO_REPRESENTANTE_LEGAL'),
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
    title: "Carga Masiva de Novedad Actualización Datos Empleador",
    instructions: [
      'Seleccione un archivo Excel (.xlsx) con la hoja "DATOS" con el formato correcto para novedad actualización datos empleador.',
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