/**
 * Tipos de documento para actualización de valor de contrato
 * Basado en Constant.java - Incluye todos los tipos de documento disponibles
 */

export interface DocumentTypeOption {
  value: string
  label: string
}

export const documentTypesValorContrato: DocumentTypeOption[] = [
  { value: "CC", label: "CC - Cédula de Ciudadanía" },
  { value: "CE", label: "CE - Cédula de Extranjería" },
  { value: "PA", label: "PA - Pasaporte" },
  { value: "NI", label: "NI - NIT" },
  { value: "TI", label: "TI - Tarjeta de Identidad" },
  { value: "CD", label: "CD - Carné Diplomático" },
  { value: "PE", label: "PE - Permiso Especial de Permanencia" },
  { value: "RC", label: "RC - Registro Civil" },
  { value: "SC", label: "SC - Salvoconducto" },
  { value: "PT", label: "PT - Pasaporte Temporal" },
  { value: "DV", label: "DV - Dígito de Verificación" },
]

