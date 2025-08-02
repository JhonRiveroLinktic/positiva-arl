// Tipos para la tabla afiliacion_empleador_datos
export interface EmpleadorDatos {
  id?: string
  tipoDocEmpleador: string
  documentoEmpleador: string
  digitoVerificacionEmpleador?: string
  razonSocialEmpleador: string
  departamentoEmpleador: string
  municipioEmpleador: string
  direccionEmpleador: string
  telefonoEmpleador?: string
  fax?: string
  correoElectronico: string
  zona?: string
  actEconomicaPrincipalEmpleador: string
  suministroDeTransporte?: string
  fechaRadicacion: string
  naturaleza?: string
  estado?: number
  tipoDocRepresentanteLegal: string
  numeDocRepresentanteLegal: string
  nombreRepresentanteLegal: string
  fechaCobertura?: string
  origen?: string
  codigoArl?: string
  tipoDocArlAnterior?: string
  nitArlAnterior?: string
  fechaNotificacionTraslado?: string
  createdBy?: string
  metodoSubida?: string
}

// Tipos para la tabla afiliacion_empleador_rep_legal
export interface RepresentanteLegal {
  id?: string
  tipoDoc: string
  documento: string
  primerApellido: string
  segundoApellido?: string
  primerNombre: string
  segundoNombre?: string
  fechaNacimiento: string
  sexo: string
  pais?: string
  departamento: string
  municipio: string
  zona?: string
  fax?: string
  telefono?: string
  direccion: string
  correoElectronico: string
  nitAfp?: string
  nitEps?: string
}

// Tipos para la tabla afiliacion_empleador_sedes
export interface Sede {
  id?: string
  tipoDocEmpleador: string
  documentoEmpleador: string
  subempresa?: string
  departamento: string
  municipio: string
  actividadEconomica: string
  fechaRadicacion: string
  nombreSede: string
  direccion: string
  zona: string
  telefono?: string
  correoElectronico?: string
  tipoDocResponsable?: string
  documentoResponsable?: string
  sedeMision?: string
  tipoDocSedeMision?: string
  documentoSedeMision?: string
}

// Tipos para la tabla afiliacion_empleador_centros_trabajo
export interface CentroTrabajo {
  id?: string
  tipoDocEmpleador: string
  documentoEmpleador: string
  subempresa?: string
  idSubempresa?: string
  actividadEconomica: string
  idSede?: string
  createdBy?: string
}

// Tipo unificado para el formulario (datos temporales en localStorage)
export interface AfiliacionEmpleadorFormData {
  // Datos del empleador
  empleadorDatos: EmpleadorDatos
  // Datos del representante legal
  representanteLegal: RepresentanteLegal
  // Sedes (array)
  sedes: Sede[]
  // Centros de trabajo (array)
  centrosTrabajo: CentroTrabajo[]
  // Archivos adjuntos
  archivos?: File[]
}

// Tipo para el registro completo en localStorage
export interface RegistroCompleto {
  id: string
  empleadorDatos: EmpleadorDatos
  representanteLegal: RepresentanteLegal
  sedes: Sede[]
  centrosTrabajo: CentroTrabajo[]
  archivos?: File[]
  metodoSubida?: string
}

// Tipos para la base de datos
export interface EmpleadorDatosDB {
  id?: string
  tipo_doc_empleador: string
  documento_empleador: string
  digito_verificacion_empleador?: string
  razon_social_empleador: string
  departamento_empleador: string
  municipio_empleador: string
  direccion_empleador: string
  telefono_empleador?: string
  fax?: string
  correo_electronico: string
  zona?: string
  act_economica_principal_empleador: string
  suministro_de_transporte?: string
  fecha_radicacion: string
  naturaleza?: string
  estado?: number
  tipo_doc_representante_legal: string
  nume_doc_representante_legal: string
  nombre_representante_legal: string
  fecha_cobertura?: string
  origen?: string
  codigo_arl?: string
  tipo_doc_arl_anterior?: string
  nit_arl_anterior?: string
  fecha_notificacion_traslado?: string
  created_by?: string
  metodo_subida?: string
}

export interface RepresentanteLegalDB {
  id?: string
  tipo_doc: string
  documento: string
  primer_apellido: string
  segundo_apellido?: string
  primer_nombre: string
  segundo_nombre?: string
  fecha_nacimiento: string
  sexo: string
  pais?: string
  departamento: string
  municipio: string
  zona?: string
  fax?: string
  telefono?: string
  direccion: string
  correo_electronico: string
  nit_afp?: string
  nit_eps?: string
}

export interface SedeDB {
  id?: string
  tipo_doc_empleador: string
  documento_empleador: string
  subempresa?: string
  departamento: string
  municipio: string
  actividad_economica: string
  fecha_radicacion: string
  nombre_sede: string
  direccion: string
  zona: string
  telefono?: string
  correo_electronico?: string
  tipo_doc_responsable?: string
  documento_responsable?: string
  sede_mision?: string
  tipo_doc_sede_mision?: string
  documento_sede_mision?: string
}

export interface CentroTrabajoDB {
  id?: string
  tipo_doc_empleador: string
  documento_empleador: string
  subempresa?: string
  id_subempresa?: string
  actividad_economica: string
  id_sede?: string
  created_by?: string
}

// Funciones de conversión
export function trimEmpleadorDatosFields(data: Partial<EmpleadorDatos>): Partial<EmpleadorDatos> {
  const trimmed: Partial<EmpleadorDatos> = {}
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") {
      trimmed[key as keyof EmpleadorDatos] = value.trim() as any
    } else {
      trimmed[key as keyof EmpleadorDatos] = value as any
    }
  }
  return trimmed
}

export function trimRepresentanteLegalFields(data: Partial<RepresentanteLegal>): Partial<RepresentanteLegal> {
  const trimmed: Partial<RepresentanteLegal> = {}
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") {
      trimmed[key as keyof RepresentanteLegal] = value.trim() as any
    } else {
      trimmed[key as keyof RepresentanteLegal] = value as any
    }
  }
  return trimmed
}

export function trimSedeFields(data: Partial<Sede>): Partial<Sede> {
  const trimmed: Partial<Sede> = {}
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") {
      trimmed[key as keyof Sede] = value.trim() as any
    } else {
      trimmed[key as keyof Sede] = value as any
    }
  }
  return trimmed
}

export function trimCentroTrabajoFields(data: Partial<CentroTrabajo>): Partial<CentroTrabajo> {
  const trimmed: Partial<CentroTrabajo> = {}
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") {
      trimmed[key as keyof CentroTrabajo] = value.trim() as any
    } else {
      trimmed[key as keyof CentroTrabajo] = value as any
    }
  }
  return trimmed
}

export function convertEmpleadorDatosToSupabaseFormat(formData: Partial<EmpleadorDatos>): EmpleadorDatosDB {
  const trimmedData = trimEmpleadorDatosFields(formData)
  
  return {
    tipo_doc_empleador: trimmedData.tipoDocEmpleador || "",
    documento_empleador: trimmedData.documentoEmpleador || "",
    digito_verificacion_empleador: trimmedData.digitoVerificacionEmpleador || undefined,
    razon_social_empleador: trimmedData.razonSocialEmpleador || "",
    departamento_empleador: trimmedData.departamentoEmpleador || "",
    municipio_empleador: trimmedData.municipioEmpleador || "",
    direccion_empleador: trimmedData.direccionEmpleador || "",
    telefono_empleador: trimmedData.telefonoEmpleador || undefined,
    fax: trimmedData.fax || undefined,
    correo_electronico: trimmedData.correoElectronico || "",
    zona: trimmedData.zona || undefined,
    act_economica_principal_empleador: trimmedData.actEconomicaPrincipalEmpleador || "",
    suministro_de_transporte: trimmedData.suministroDeTransporte || undefined,
    fecha_radicacion: trimmedData.fechaRadicacion || "",
    naturaleza: trimmedData.naturaleza || undefined,
    estado: trimmedData.estado || 1,
    tipo_doc_representante_legal: trimmedData.tipoDocRepresentanteLegal || "",
    nume_doc_representante_legal: trimmedData.numeDocRepresentanteLegal || "",
    nombre_representante_legal: trimmedData.nombreRepresentanteLegal || "",
    fecha_cobertura: trimmedData.fechaCobertura || undefined,
    origen: trimmedData.origen || undefined,
    codigo_arl: trimmedData.codigoArl || undefined,
    tipo_doc_arl_anterior: trimmedData.tipoDocArlAnterior || undefined,
    nit_arl_anterior: trimmedData.nitArlAnterior || undefined,
    fecha_notificacion_traslado: trimmedData.fechaNotificacionTraslado || undefined,
    created_by: trimmedData.createdBy || undefined,
    metodo_subida: trimmedData.metodoSubida || undefined,
  }
}

export function convertRepresentanteLegalToSupabaseFormat(formData: Partial<RepresentanteLegal>): RepresentanteLegalDB {
  const trimmedData = trimRepresentanteLegalFields(formData)
  
  return {
    tipo_doc: trimmedData.tipoDoc || "",
    documento: trimmedData.documento || "",
    primer_apellido: trimmedData.primerApellido || "",
    segundo_apellido: trimmedData.segundoApellido || undefined,
    primer_nombre: trimmedData.primerNombre || "",
    segundo_nombre: trimmedData.segundoNombre || undefined,
    fecha_nacimiento: trimmedData.fechaNacimiento || "",
    sexo: trimmedData.sexo || "",
    pais: trimmedData.pais || undefined,
    departamento: trimmedData.departamento || "",
    municipio: trimmedData.municipio || "",
    zona: trimmedData.zona || undefined,
    fax: trimmedData.fax || undefined,
    telefono: trimmedData.telefono || undefined,
    direccion: trimmedData.direccion || "",
    correo_electronico: trimmedData.correoElectronico || "",
    nit_afp: trimmedData.nitAfp || undefined,
    nit_eps: trimmedData.nitEps || undefined,
  }
}

export function convertSedeToSupabaseFormat(formData: Partial<Sede>): SedeDB {
  const trimmedData = trimSedeFields(formData)
  
  return {
    tipo_doc_empleador: trimmedData.tipoDocEmpleador || "",
    documento_empleador: trimmedData.documentoEmpleador || "",
    subempresa: trimmedData.subempresa || undefined,
    departamento: trimmedData.departamento || "",
    municipio: trimmedData.municipio || "",
    actividad_economica: trimmedData.actividadEconomica || "",
    fecha_radicacion: trimmedData.fechaRadicacion || "",
    nombre_sede: trimmedData.nombreSede || "",
    direccion: trimmedData.direccion || "",
    zona: trimmedData.zona || "",
    telefono: trimmedData.telefono || undefined,
    correo_electronico: trimmedData.correoElectronico || undefined,
    tipo_doc_responsable: trimmedData.tipoDocResponsable || undefined,
    documento_responsable: trimmedData.documentoResponsable || undefined,
    sede_mision: trimmedData.sedeMision || undefined,
    tipo_doc_sede_mision: trimmedData.tipoDocSedeMision || undefined,
    documento_sede_mision: trimmedData.documentoSedeMision || undefined,
  }
}

export function convertCentroTrabajoToSupabaseFormat(formData: Partial<CentroTrabajo>): CentroTrabajoDB {
  const trimmedData = trimCentroTrabajoFields(formData)
  
  return {
    tipo_doc_empleador: trimmedData.tipoDocEmpleador || "",
    documento_empleador: trimmedData.documentoEmpleador || "",
    subempresa: trimmedData.subempresa || undefined,
    id_subempresa: trimmedData.idSubempresa || undefined,
    actividad_economica: trimmedData.actividadEconomica || "",
    id_sede: trimmedData.idSede || undefined,
    created_by: trimmedData.createdBy || undefined,
  }
}