/**
 * Tipos para el módulo de cambio de razón social
 */

export interface BusquedaRegistroFormData {
  tipoDocumento: string
  numeroDocumento: string
}

export interface RegistroRazonSocial {
  document_type: string
  documentNumber: string
  person_type: string | null
  first_name: string
  second_name: string | null
  surname: string
  second_surname: string | null
  date_of_birth: string
  age: string
  phone_1: string | null
  company: string
  nit: string
  dv: string
  affiliation_type: string
  affiliation_date: string
  coverage_start_date: string
  affiliation_status: string
  filed_number: string
}

export interface ApiResponseRegistros {
  registros: RegistroRazonSocial[]
}

export interface DatosRegistro {
  tipoDocumento: string
  numeroDocumento: string
  registros: RegistroRazonSocial[]
  registroSeleccionado?: RegistroRazonSocial
}

export interface CambioRazonSocialFormData {
  modificarRazonSocial: boolean
  modificarNit: boolean
  modificarNaturaleza: boolean
  nuevaRazonSocial: string
  nuevoNit: string
  nuevoDv: string
  nuevaNaturaleza: "N" | "J" | ""
  ticketId: string
}

export interface CambioRazonSocialPayload {
  company: string
  nit: string
  dv: string
  type_person: "N" | "J"
  filedNumber: string
}

export interface ApiResponseActualizacion {
  message: string
  document_type: string
  documentNumber: string
  person_type: string | null
  first_name: string
  second_name: string | null
  surname: string
  second_surname: string | null
  date_of_birth: string
  age: string
  phone_1: string | null
  company: string
  nit: string
  dv: string
  affiliation_type: string
  affiliation_date: string
  coverage_start_date: string
  affiliation_status: string
  filedNumber: string
}

export interface RegistroTrazabilidadCambioRazonSocial {
  id?: string
  created_at?: string
  fecha_registro_modificacion?: string
  tipo_documento: string
  numero_documento: string
  filed_number: string
  razon_social_anterior: string | null
  nueva_razon_social: string | null
  nit_anterior: string | null
  nuevo_nit: string | null
  dv_anterior: string | null
  nuevo_dv: string | null
  naturaleza_anterior: string | null
  nueva_naturaleza: string | null
  tipo_cambio: string
  correo_modifico: string
  ticket_id: string
}

export interface CambioRazonSocialState {
  datosRegistro: DatosRegistro | null
  isSearching: boolean
  isUpdating: boolean
  setDatosRegistro: (datos: DatosRegistro | null) => void
  setRegistroSeleccionado: (registro: RegistroRazonSocial) => void
  setIsSearching: (isSearching: boolean) => void
  setIsUpdating: (isUpdating: boolean) => void
  limpiarDatos: () => void
}

