"use client";

import type React from "react";
import { useCallback } from "react";
import * as XLSX from "xlsx";
import {
  MassiveUploadModal,
  type ProcessingResult,
  type ContactInfo,
  type MassiveUploadConfig,
} from "@/lib/components/core/form/massive-upload-modal";
import { useRegistroStore } from "../stores/registro-store";
import { IndependienteConContratoValidationRules, sanitizeFormData } from "../validations/validation-rules";
import type { Registro, IndependienteConContratoFormData } from '../types/independiente-types';
import { Upload } from "lucide-react";
import { Button } from "@/lib/components/ui/button";

const EXCEL_COLUMN_MAPPING = {
  'TIPO_DE_DOCUMENTO_TRABAJADOR': 'tipoDocTrabajador',
  'NUMERO_DE_DOCUMENTO_TRABAJADOR': 'numeDocTrabajador',
  'PRIMER_APELLIDO': 'apellido1Trabajador',
  'SEGUNDO_APELLIDO': 'apellido2Trabajador',
  'PRIMER_NOMBRE': 'nombre1Trabajador',
  'SEGUNDO_NOMBRE': 'nombre2Trabajador',
  'FECHA_DE_NACIMIENTO_DEL_TRABAJADOR_(DD/MM/AAAA)': 'fechaNacimientoTrabajador',
  'SEXO_DEL_TRABAJADOR': 'sexoTrabajador',
  'CORREO_ELECTRONICO_TRABAJADOR': 'emailTrabajador',
  'CODIGO_DANE_DEPARTAMENTO_RESIDENCIA_INDEPENDIENTE': 'codigoDaneDptoResidencia',
  'CODIGO_DANE_MUNICIPIO_DE_RESIDENCIA_INDEPENDIENTE': 'codigoDaneMuniResidencia',
  'DIRECCION_RESIDENCIA_INDEPENDIENTE': 'direccionResidencia',
  'NUMERO_DE_TELEFONO_DEL_TRABAJADOR': 'telefonoTrabajador',
  'CARGO_OCUPACION': 'cargoOcupacion',
  'NIT_EPS_DEL_INDEPENDIENTE': 'codigoEPS',
  'NIT_AFP': 'codigoAFP',
  'TIPO_DE_CONTRATO_ADMINISTRATIVO_COMERCIAL_CIVIL': 'tipoContrato',
  'NATURALEZA_DEL_CONTRATO_(PUBLICO_O_PRIVADO)': 'naturalezaContrato',
  'SUMINISTRA_TRANSPORTE_(SI_O_NO)': 'suministraTransporte',
  'FECHA_DE_INICIO_CONTRATO_(DD/MM/AAAA)': 'fechaInicioContrato',
  'FECHA_DE_TERMINACION-CONTRATO_(DD/MM/AAAA)': 'fechaFinContrato',
  'VALOR_TOTAL_DEL_CONTRATO': 'valorTotalContrato',
  'CODIGO_DE_ACTIVIDAD_A_EJECUTAR': 'codigoActividadEjecutar',
  'DEPARTAMENTO_DONDE_LABORA': 'departamentoLabor',
  'CIUDAD_DONDE_LABORA': 'ciudadLabor',
  'FECHA_DE_COBERTURA_(DD/MM/AAAA)': 'fechaInicioCobertura',
  'TIPO_DE_DOCUMENTO_DEL_CONTRATANTE': 'tipoDocContratante',
  'NUMERO_DE_DOCUMENTO_DEL_CONTRATANTE': 'numeDocContratante',
  'CODIGO_SUBEMPRESA_(SOLO PARA EL NIT 899999061)': 'codigoSubempresa',
  'ACTIVIDAD_CENTRO_DE_TRABAJO_DEL_CONTRATANTE': 'actividadCentroTrabajoContratante',
  '¿LA_AFILIACION_ES_DE_TAXISTA?': 'esAfiliacionTaxista',
} as const;

type FormFieldKeys = (typeof EXCEL_COLUMN_MAPPING)[keyof typeof EXCEL_COLUMN_MAPPING];

interface IndependienteConContratoMassiveUploadProps {
  trigger?: React.ReactNode;
  onSuccess?: (result: ProcessingResult) => void;
  onError?: (error: string) => void;
}

export function IndependienteConContratoMassiveUpload({ trigger, onSuccess, onError }: IndependienteConContratoMassiveUploadProps) {
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

  const convertDateFormat = useCallback((dateStr: any): string => {
    if (dateStr === undefined || dateStr === null || dateStr === "") return "";

    if (typeof dateStr === "number") {
      try {
        const date = XLSX.SSF.parse_date_code(dateStr);
        if (date && typeof date.y === 'number' && typeof date.m === 'number' && typeof date.d === 'number') {
          if (date.y >= 1900 && date.y <= 2100) {
            return `${date.y}-${String(date.m).padStart(2, "0")}-${String(date.d).padStart(2, "0")}`;
          }
        }
      } catch (error) {
        console.warn(`Error al parsear fecha de Excel numérica "${dateStr}":`, error);
      }
      return "";
    }

    if (typeof dateStr === "string" && dateStr.trim() !== "") {
      const trimmed = dateStr.trim();

      if (trimmed.includes("/")) {
        const parts = trimmed.split("/");
        if (parts.length === 3) {
          const [day, month, year] = parts;
          const dayNum = Number.parseInt(day, 10);
          const monthNum = Number.parseInt(month, 10);
          const yearNum = Number.parseInt(year, 10);

          if (dayNum >= 1 && dayNum <= 31 &&
            monthNum >= 1 && monthNum <= 12 &&
            yearNum >= 1900 && yearNum <= 2100) {

            const formattedMonth = String(monthNum).padStart(2, "0");
            const formattedDay = String(dayNum).padStart(2, "0");
            const result = `${yearNum}-${formattedMonth}-${formattedDay}`;

            const testDate = new Date(result + 'T00:00:00');
            if (!isNaN(testDate.getTime()) && testDate.getDate() === dayNum && (testDate.getMonth() + 1) === monthNum && testDate.getFullYear() === yearNum) {
              return result;
            } else {
              console.warn(`Fecha inválida (DD/MM/AAAA) después de la conversión lógica: ${trimmed}`);
              return "";
            }
          } else {
            console.warn(`Valores de fecha fuera de rango (DD/MM/AAAA): ${trimmed}`);
            return "";
          }
        }
      }

      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        const testDate = new Date(trimmed + 'T00:00:00');
        if (!isNaN(testDate.getTime()) && testDate.toISOString().slice(0, 10) === trimmed) {
          return trimmed;
        } else {
          console.warn(`Fecha inválida o alterada por zona horaria (YYYY-MM-DD): ${trimmed}`);
          return "";
        }
      }
    }

    console.warn(`Formato de fecha no reconocido o inválido: "${dateStr}"`);
    return "";
  }, []);

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
          const formData: Partial<IndependienteConContratoFormData> = {};
          const rowErrors: string[] = [];

          Object.keys(row).forEach(originalKey => {
            const normalizedKey = normalizeHeader(originalKey);
            const formField = normalizedMapping[normalizedKey];

            if (formField) {
              let value = row[originalKey];

              if (
                formField === "fechaNacimientoTrabajador" ||
                formField === "fechaInicioContrato" ||
                formField === "fechaFinContrato" ||
                formField === "fechaInicioCobertura"
              ) {
                const convertedDate = convertDateFormat(value);
                if (!convertedDate && value !== undefined && value !== null && String(value).trim() !== "") {
                    rowErrors.push(`Error de formato de fecha en '${originalKey}': '${value}'`);
                }
                value = convertedDate;
              }
              else if (
                formField === "suministraTransporte" ||
                formField === "esAfiliacionTaxista"
              ) {
                const strValue = String(value).trim().toUpperCase();
                value = (strValue === "SI" || strValue === "SÍ" || strValue === "S" ||
                  strValue === "YES" || strValue === "TRUE" || strValue === "1") ? "S" : "N";
              }
              else if (formField === "valorTotalContrato") {
                const numValue = Number(value);
                if (isNaN(numValue) && value !== undefined && value !== null && String(value).trim() !== "") {
                    rowErrors.push(`Formato numérico inválido en '${originalKey}': '${value}'`);
                    value = "";
                } else {
                    value = isNaN(numValue) ? "" : String(numValue);
                }
              }
              else {
                value = value !== undefined && value !== null ? String(value).trim() : "";
              }

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

          const sanitizedData = sanitizeFormData(formData as IndependienteConContratoFormData);
          const tempRegistro: Registro = {
            id: `temp-${i}`,
            ...(sanitizedData as Omit<Registro, "id" | "metodoSubida">),
            metodoSubida: "cargue masivo",
          };

          const fieldErrors: string[] = [];
          Object.entries(IndependienteConContratoValidationRules).forEach(([fieldName, rules]) => {
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
    [agregarRegistro, convertDateFormat, normalizeHeader, createNormalizedMapping],
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
      normalizeHeader('TIPO_DE_DOCUMENTO_TRABAJADOR'),
      normalizeHeader('NUMERO_DE_DOCUMENTO_TRABAJADOR'),
      normalizeHeader('PRIMER_APELLIDO'),
      normalizeHeader('PRIMER_NOMBRE'),
      normalizeHeader('FECHA_DE_NACIMIENTO_DEL_TRABAJADOR_(DD/MM/AAAA)'),
      normalizeHeader('SEXO_DEL_TRABAJADOR'),
      normalizeHeader('CORREO_ELECTRONICO_TRABAJADOR'),
      normalizeHeader('CODIGO_DANE_DEPARTAMENTO_RESIDENCIA_INDEPENDIENTE'),
      normalizeHeader('CODIGO_DANE_MUNICIPIO_DE_RESIDENCIA_INDEPENDIENTE'),
      normalizeHeader('DIRECCION_RESIDENCIA_INDEPENDIENTE'),
      normalizeHeader('CARGO_OCUPACION'),
      normalizeHeader('NIT_EPS_DEL_INDEPENDIENTE'),
      normalizeHeader('NIT_AFP'),
      normalizeHeader('TIPO_DE_CONTRATO_ADMINISTRATIVO_COMERCIAL_CIVIL'),
      normalizeHeader('NATURALEZA_DEL_CONTRATO_(PUBLICO_O_PRIVADO)'),
      normalizeHeader('SUMINISTRA_TRANSPORTE_(SI_O_NO)'),
      normalizeHeader('FECHA_DE_INICIO_CONTRATO_(DD/MM/AAAA)'),
      normalizeHeader('FECHA_DE_TERMINACION-CONTRATO_(DD/MM/AAAA)'),
      normalizeHeader('VALOR_TOTAL_DEL_CONTRATO'),
      normalizeHeader('CODIGO_DE_ACTIVIDAD_A_EJECUTAR'),
      normalizeHeader('DEPARTAMENTO_DONDE_LABORA'),
      normalizeHeader('CIUDAD_DONDE_LABORA'),
      normalizeHeader('FECHA_DE_COBERTURA_(DD/MM/AAAA)'),
      normalizeHeader('TIPO_DE_DOCUMENTO_DEL_CONTRATANTE'),
      normalizeHeader('NUMERO_DE_DOCUMENTO_DEL_CONTRATANTE'),
      normalizeHeader('ACTIVIDAD_CENTRO_DE_TRABAJO_DEL_CONTRATANTE'),
      normalizeHeader('¿LA_AFILIACION_ES_DE_TAXISTA?'),
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

    console.log('Columnas faltantes:', missingColumns.map(col => Object.keys(EXCEL_COLUMN_MAPPING).find(key => normalizeHeader(key) === col) || col)); // Muestra el nombre original si es posible
    console.log('Columnas extra:', extraColumns.map(col => {
        const originalName = headers[normalizedHeadersInFile.indexOf(col)];
        return originalName || col;
    }));

    return {
      isValid: missingColumns.length === 0,
      missingColumns: missingColumns.map(col => Object.keys(EXCEL_COLUMN_MAPPING).find(key => normalizeHeader(key) === col) || col), // Muestra el nombre original
      extraColumns: extraColumns.map(col => headers[normalizedHeadersInFile.indexOf(col)] || col),
    };
  }, [normalizeHeader, createNormalizedMapping]);


  const config: MassiveUploadConfig = {
    acceptedFileTypes: [".xlsx", ".xls"],
    requiredSheetName: "DATOS",
    title: "Carga Masiva de Independiente con Contrato",
    instructions: [
      'Seleccione un archivo Excel (.xlsx) con la hoja "DATOS" con el formato correcto para independiente con contrato.',
      'Asegúrese de que los encabezados de las columnas coincidan exactamente con la plantilla. Las fechas deben estar en formato DD/MM/AAAA.',
      'Columnas opcionales: SEGUNDO_APELLIDO, SEGUNDO_NOMBRE, NUMERO_DE_TELEFONO_DEL_TRABAJADOR, CODIGO_SUBEMPRESA_(SOLO PARA EL NIT 899999061).',
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