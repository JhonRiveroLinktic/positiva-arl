/**
 * Tipos para el módulo de actualización de valor de contrato
 */

export type TipoAfiliado = "dependiente" | "independiente"

export interface BusquedaAfiliadoFormData {
  tipoDocumento: string
  numeroDocumento: string
}

export interface Contrato {
  numContract: string
  contractType: string | null
  contractStartDate: string
  contractEndDate: string | null
  contractDuration: string
  contractTotalValue: number
  contractMonthlyValue: number
  contractIbcValue: number
  typeContractUser: "INDEPENDENT" | "DEPENDENT"
}

export interface ApiResponseAfiliado {
  identificationType: string
  identification: string
  firstName: string
  secondName: string | null
  surname: string
  secondSurname: string | null
  age: number
  sex: string
  otherSex: string | null
  nationality: string | null
  address: string | null
  phoneNumber: string
  phone2: string | null
  email: string
  userFromRegistry: boolean
  contracts: Contrato[]
}

export interface DatosAfiliado {
  tipoDocumento: string
  numeroDocumento: string
  primerNombre: string
  segundoNombre?: string
  primerApellido: string
  segundoApellido?: string
  edad: number
  sexo: string
  telefono: string
  email: string
  contratos: Contrato[]
  contratoSeleccionado?: Contrato
}

export interface ActualizacionValorContratoFormData {
  tipoValor: "total" | "mensual"
  valorContrato: string
  fechaInicio: string
  fechaFin: string
}

export interface ActualizacionValorContratoPayload {
  numContract: string
  contractStartDate: string
  contractEndDate: string | null
  contractTotalValue?: number
  contractMonthlyValue?: number
  typeContractUser: "INDEPENDENT" | "DEPENDENT"
}

export interface ActualizacionValorContratoState {
  afiliadoEncontrado: DatosAfiliado | null
  isSearching: boolean
  isUpdating: boolean
  setAfiliadoEncontrado: (afiliado: DatosAfiliado | null) => void
  setContratoSeleccionado: (contrato: Contrato) => void
  setIsSearching: (isSearching: boolean) => void
  setIsUpdating: (isUpdating: boolean) => void
  limpiarDatos: () => void
}

/**
 * Convierte el valor del contrato a número
 */
export function convertContractValueToNumber(value: string | number): number {
  if (typeof value === "number") {
    return value
  }
  
  const cleanedValue = value.replace(/[^\d.]/g, "")
  const numericValue = parseFloat(cleanedValue)
  
  if (isNaN(numericValue)) {
    throw new Error("El valor del contrato debe ser un número válido")
  }
  
  return numericValue
}

