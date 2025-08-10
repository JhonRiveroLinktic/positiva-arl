export interface DocumentType {
  Tipo: string
  Nombre: string
}

export interface GenderCode {
  Tipo: string
  Nombre: string
}

export interface Municipality {
  Id: string
  Municipio: string
  Departamento: string
}

export interface EPSCode {
  Id: string
  Nombre: string
}

export interface AFPCode {
  Id: string
  Nombre: string
}

export interface Occupation {
  Id: string
  Nombre: string
  Observación: string
}

export interface OccupationDecreto {
  Id: string
  Nombre: string
}

export interface EconomicActivity {
  "Nombre Actividad Económica": string
  Riesgo: string
  "Código 768": string
}

export interface WorkMode {
  Id: string
  Nombre: string
  Observación: string
}

export interface SelectOption {
  code: string
  name: string
  description?: string
}

export interface SelectOptionWithDepartment extends SelectOption {
  department: string
}

export type DocumentTypeOption = SelectOption
export type GenderCodeOption = SelectOption
export type MunicipalityOption = SelectOptionWithDepartment
export type EPSCodeOption = SelectOption
export type AFPCodeOption = SelectOption
export type OccupationOption = SelectOption
export type OccupationDecretoOption = SelectOption
export type EconomicActivityOption = SelectOption & { risk: string }
export type WorkModeOption = SelectOption 