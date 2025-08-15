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
  codigoDaneDepartamentoResidencia: string
  codigoDaneMunicipioResidencia: string
  direccion: string
  telefono: string
  codigoEPS: string
  codigoAFP: string
  fechaInicioCobertura: string
  codigoOcupacion: string
  salario: string
  codigoActividadEconomica: string
  codigoDepartamentoDondeLabora: string
  codigoCiudadDondeLabora: string
  tipoDocEmp: string
  numeDocEmp: string
  codigoSubEmpresa?: string
  modoTrabajo: string
  metodoSubida?: string
  nombreCreadorRegistro?: string,
  emailCreadorRegistro?: string
  telefonoCreadorRegistro?: string
}

export interface SeguimientoRegistroARL {
  id?: string
  tipo_doc_persona: string
  nume_doc_persona: string
  apellido1: string
  apellido2?: string
  nombre1: string
  nombre2?: string
  fecha_nacimiento: string
  sexo: string
  codigo_dane_departamento_residencia: string
  codigo_dane_municipio_residencia: string
  direccion: string
  telefono?: string
  codigo_eps: string
  codigo_afp: string
  fecha_inicio_cobertura: string
  codigo_ocupacion: string
  salario: string
  codigo_actividad_economica: string
  codigo_departamento_donde_labora: string
  codigo_ciudad_donde_labora: string
  tipo_doc_emp?: string
  nume_doc_emp?: string
  codigo_sub_empresa?: string
  modo_trabajo: string
  metodo_subida?: string
  created_at?: string
  updated_at?: string
  email_creador_registro?: string
  telefono_creador_registro?: string
  nombre_contacto?: string,
  correo_contacto?: string,
  telefono_contacto?: string,
}


export interface SeguimientoARLFormData {
  tipoDocPersona: string
  numeDocPersona: string
  apellido1: string
  apellido2: string
  nombre1: string
  nombre2: string
  fechaNacimiento: string
  sexo: string
  codigoDaneDepartamentoResidencia: string
  codigoDaneMunicipioResidencia: string
  direccion: string
  telefono: string
  codigoEPS: string
  codigoAFP: string
  fechaInicioCobertura: string
  codigoOcupacion: string
  salario: string
  codigoActividadEconomica: string
  codigoDepartamentoDondeLabora: string
  codigoCiudadDondeLabora: string
  tipoDocEmp: string
  numeDocEmp: string
  codigoSubEmpresa: string
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

export function convertToSupabaseFormat(formData: Partial<Registro>): SeguimientoRegistroARL {
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
    codigo_dane_departamento_residencia: trimmedData.codigoDaneDepartamentoResidencia || "",
    codigo_dane_municipio_residencia: trimmedData.codigoDaneMunicipioResidencia || "",
    direccion: trimmedData.direccion || "",
    telefono: trimmedData.telefono || undefined,
    codigo_eps: trimmedData.codigoEPS || "",
    codigo_afp: trimmedData.codigoAFP || "",
    fecha_inicio_cobertura: trimmedData.fechaInicioCobertura || "",
    codigo_ocupacion: trimmedData.codigoOcupacion || "",
    salario: validateAndAssignSalary(trimmedData.salario || ""),
    codigo_actividad_economica: trimmedData.codigoActividadEconomica || "",
    codigo_departamento_donde_labora: trimmedData.codigoDepartamentoDondeLabora || "",
    codigo_ciudad_donde_labora: trimmedData.codigoCiudadDondeLabora || "",
    tipo_doc_emp: trimmedData.tipoDocEmp || undefined,
    nume_doc_emp: trimmedData.numeDocEmp || undefined,
    codigo_sub_empresa: trimmedData.codigoSubEmpresa || undefined,
    modo_trabajo: trimmedData.modoTrabajo || "",
    nombre_contacto: trimmedData.nombreCreadorRegistro || undefined,
    correo_contacto: trimmedData.emailCreadorRegistro || undefined,
    telefono_contacto: trimmedData.telefonoCreadorRegistro || undefined,
    metodo_subida: trimmedData.metodoSubida || undefined,
  }
}