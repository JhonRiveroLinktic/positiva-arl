import { validateAndAssignSalary } from "../validations/validation-rules"

export interface Registro {
  id: string
  tipoDocPersona: string
  numeDocPersona: string
  apellido1: string
  apellido2: string
  nombre1: string
  nombre2: string
  fechaNacimiento: string
  sexo: string
  codigoMuniResidencia: string
  direccion: string
  telefono: string
  codigoEPS: string
  codigoAFP: string
  fechaInicioCobertura: string
  codigoOcupacion: string
  salario: string
  codigoActividadEconomica: string
  tipoDocEmp: string
  numeDocEmp: string
  modoTrabajo: string
  metodoSubida?: string
}

export interface RegistroARL {
  id?: string
  tipo_doc_persona: string
  nume_doc_persona: string
  apellido1: string
  apellido2?: string
  nombre1: string
  nombre2?: string
  fecha_nacimiento: string
  sexo: string
  codigo_muni_residencia: string
  direccion: string
  telefono?: string
  codigo_eps: string
  codigo_afp: string
  fecha_inicio_cobertura: string
  codigo_ocupacion: string
  salario: string
  codigo_actividad_economica: string
  modo_trabajo: string
  tipo_doc_emp?: string
  nume_doc_emp?: string
  metodo_subida?: string
  created_at?: string
  updated_at?: string
}


export interface ARLFormData {
  tipoDocPersona: string
  numeDocPersona: string
  apellido1: string
  apellido2: string
  nombre1: string
  nombre2: string
  fechaNacimiento: string
  sexo: string
  codigoMuniResidencia: string
  direccion: string
  telefono: string
  codigoEPS: string
  codigoAFP: string
  fechaInicioCobertura: string
  codigoOcupacion: string
  salario: string
  codigoActividadEconomica: string
  tipoDocEmp: string
  numeDocEmp: string
  modoTrabajo: string
}

export function trimRegistroFields(registro: Partial<Registro>): Partial<Registro> {
  const trimmed: Partial<Registro> = {}

  for (const [key, value] of Object.entries(registro)) {
    if (typeof value === "string") {
      trimmed[key as keyof Registro] = value.trim()
    } else {
      trimmed[key as keyof Registro] = value
    }
  }

  return trimmed
}

export function convertToSupabaseFormat(formData: Partial<Registro>): RegistroARL {
  const trimmedData = trimRegistroFields(formData)

  return {
    tipo_doc_persona: trimmedData.tipoDocPersona || "",
    nume_doc_persona: trimmedData.numeDocPersona || "",
    apellido1: trimmedData.apellido1 || "",
    apellido2: trimmedData.apellido2 || undefined,
    nombre1: trimmedData.nombre1 || "",
    nombre2: trimmedData.nombre2 || undefined,
    fecha_nacimiento: trimmedData.fechaNacimiento || "",
    sexo: trimmedData.sexo || "",
    codigo_muni_residencia: trimmedData.codigoMuniResidencia || "",
    direccion: trimmedData.direccion || "",
    telefono: trimmedData.telefono || undefined,
    codigo_eps: trimmedData.codigoEPS || "",
    codigo_afp: trimmedData.codigoAFP || "",
    fecha_inicio_cobertura: trimmedData.fechaInicioCobertura || "",
    codigo_ocupacion: trimmedData.codigoOcupacion || "",
    salario: validateAndAssignSalary(trimmedData.salario || ""),
    codigo_actividad_economica: trimmedData.codigoActividadEconomica || "",
    modo_trabajo: trimmedData.modoTrabajo || "",
    tipo_doc_emp: trimmedData.tipoDocEmp || undefined,
    nume_doc_emp: trimmedData.numeDocEmp || undefined,
    metodo_subida: trimmedData.metodoSubida || undefined,
  }
}