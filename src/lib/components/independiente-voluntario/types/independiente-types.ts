export interface Registro {
  id: string
  tipoDocTrabajador: string
  numeDocTrabajador: string
  apellido1Trabajador: string
  apellido2Trabajador: string
  nombre1Trabajador: string
  nombre2Trabajador: string
  fechaNacimientoTrabajador: string
  sexoTrabajador: string
  emailTrabajador: string
  codigoDaneDptoResidencia: string
  codigoDaneMuniResidencia: string
  direccionResidencia: string
  telefonoTrabajador: string
  codigoEPS: string
  codigoAFP: string
  ingresoBaseCotizacion: string
  codigoOcupacion: string
  codigoDaneDptoSitioTrabajo: string
  codigoDaneMuniSitioTrabajo: string
  fechaCobertura: string
  tipoDocConyugeResponsable: string
  numeDocConyugeResponsable: string
  nombre1ConyugeResponsable: string
  nombre2ConyugeResponsable: string
  apellido1ConyugeResponsable: string
  apellido2ConyugeResponsable: string
  dptoResidenciaConyugeResponsable: string
  muniResidenciaConyugeResponsable: string
  direccionResidenciaConyugeResponsable: string
  telefonoConyugeResponsable: string
  metodoSubida?: string
  archivos?: File[]
}

export interface IndependienteVoluntario {
  id?: string
  tipo_doc_trabajador: string
  nume_doc_trabajador: string
  apellido1_trabajador: string
  apellido2_trabajador?: string
  nombre1_trabajador: string
  nombre2_trabajador?: string
  fecha_nacimiento_trabajador: string
  sexo_trabajador: string
  email_trabajador?: string
  codigo_dane_dpto_residencia: string
  codigo_dane_muni_residencia: string
  direccion_residencia: string
  telefono_trabajador?: string
  codigo_eps: string
  codigo_afp: string
  ingreso_base_cotizacion: string
  codigo_ocupacion: string
  codigo_dane_dpto_sitio_trabajo: string
  codigo_dane_muni_sitio_trabajo: string
  fecha_cobertura: string
  tipo_doc_conyuge_responsable?: string
  nume_doc_conyuge_responsable?: string
  nombre1_conyuge_responsable?: string
  nombre2_conyuge_responsable?: string
  apellido1_conyuge_responsable?: string
  apellido2_conyuge_responsable?: string
  dpto_residencia_conyuge_responsable?: string
  muni_residencia_conyuge_responsable?: string
  direccion_residencia_conyuge_responsable?: string
  telefono_conyuge_responsable?: string
  metodo_subida?: string
}

export interface IndependienteVoluntarioFormData {
  tipoDocTrabajador: string
  numeDocTrabajador: string
  apellido1Trabajador: string
  apellido2Trabajador: string
  nombre1Trabajador: string
  nombre2Trabajador: string
  fechaNacimientoTrabajador: string
  sexoTrabajador: string
  emailTrabajador: string
  codigoDaneDptoResidencia: string
  codigoDaneMuniResidencia: string
  direccionResidencia: string
  telefonoTrabajador: string
  codigoEPS: string
  codigoAFP: string
  ingresoBaseCotizacion: string
  codigoOcupacion: string
  codigoDaneDptoSitioTrabajo: string
  codigoDaneMuniSitioTrabajo: string
  fechaCobertura: string
  tipoDocConyugeResponsable: string
  numeDocConyugeResponsable: string
  nombre1ConyugeResponsable: string
  nombre2ConyugeResponsable: string
  apellido1ConyugeResponsable: string
  apellido2ConyugeResponsable: string
  dptoResidenciaConyugeResponsable: string
  muniResidenciaConyugeResponsable: string
  direccionResidenciaConyugeResponsable: string
  telefonoConyugeResponsable: string
}

export function trimRegistroFields(registro: Partial<Registro>): Partial<Registro> {
  const trimmed: Partial<Registro> = {}

  for (const [key, value] of Object.entries(registro)) {
    if (typeof value === "string") {
      trimmed[key as keyof Registro] = value.trim() as any
    } else {
      trimmed[key as keyof Registro] = value as any
    }
  }

  return trimmed
}

export function convertToSupabaseFormat(formData: Partial<Registro>): IndependienteVoluntario {
  const trimmedData = trimRegistroFields(formData)

  return {
    tipo_doc_trabajador: trimmedData.tipoDocTrabajador || "",
    nume_doc_trabajador: trimmedData.numeDocTrabajador || "",
    apellido1_trabajador: trimmedData.apellido1Trabajador || "",
    apellido2_trabajador: trimmedData.apellido2Trabajador || undefined,
    nombre1_trabajador: trimmedData.nombre1Trabajador || "",
    nombre2_trabajador: trimmedData.nombre2Trabajador || undefined,
    fecha_nacimiento_trabajador: trimmedData.fechaNacimientoTrabajador || "",
    sexo_trabajador: trimmedData.sexoTrabajador || "",
    email_trabajador: trimmedData.emailTrabajador || undefined,
    codigo_dane_dpto_residencia: trimmedData.codigoDaneDptoResidencia || "",
    codigo_dane_muni_residencia: trimmedData.codigoDaneMuniResidencia || "",
    direccion_residencia: trimmedData.direccionResidencia || "",
    telefono_trabajador: trimmedData.telefonoTrabajador || undefined,
    codigo_eps: trimmedData.codigoEPS || "",
    codigo_afp: trimmedData.codigoAFP || "",
    ingreso_base_cotizacion: trimmedData.ingresoBaseCotizacion || "",
    codigo_ocupacion: trimmedData.codigoOcupacion || "",
    codigo_dane_dpto_sitio_trabajo: trimmedData.codigoDaneDptoSitioTrabajo || "",
    codigo_dane_muni_sitio_trabajo: trimmedData.codigoDaneMuniSitioTrabajo || "",
    fecha_cobertura: trimmedData.fechaCobertura || "",
    tipo_doc_conyuge_responsable: trimmedData.tipoDocConyugeResponsable || undefined,
    nume_doc_conyuge_responsable: trimmedData.numeDocConyugeResponsable || undefined,
    nombre1_conyuge_responsable: trimmedData.nombre1ConyugeResponsable || undefined,
    nombre2_conyuge_responsable: trimmedData.nombre2ConyugeResponsable || undefined,
    apellido1_conyuge_responsable: trimmedData.apellido1ConyugeResponsable || undefined,
    apellido2_conyuge_responsable: trimmedData.apellido2ConyugeResponsable || undefined,
    dpto_residencia_conyuge_responsable: trimmedData.dptoResidenciaConyugeResponsable || undefined,
    muni_residencia_conyuge_responsable: trimmedData.muniResidenciaConyugeResponsable || undefined,
    direccion_residencia_conyuge_responsable: trimmedData.direccionResidenciaConyugeResponsable || undefined,
    telefono_conyuge_responsable: trimmedData.telefonoConyugeResponsable || undefined,
    metodo_subida: trimmedData.metodoSubida || undefined,
  }
}