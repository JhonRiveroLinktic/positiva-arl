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
    cargoOcupacion: string
    codigoEPS: string
    codigoAFP: string
    tipoContrato: string
    naturalezaContrato: string
    suministraTransporte: string
    fechaInicioContrato: string
    fechaFinContrato: string
    valorTotalContrato: string
    codigoActividadEjecutar: string
    departamentoLabor: string
    ciudadLabor: string
    fechaInicioCobertura: string
    esAfiliacionTaxista: string
    tipoDocContratante: string
    numeDocContratante: string
    actividadCentroTrabajoContratante: string
    codigoSubempresa: string
    metodoSubida?: string
    archivos?: File[]
}
  
export interface IndependienteConContrato {
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
    cargo_ocupacion: string
    codigo_eps: string
    codigo_afp: string
    tipo_contrato: string
    naturaleza_contrato: string
    suministra_transporte: string
    fecha_inicio_contrato: string
    fecha_fin_contrato: string
    valor_total_contrato: string
    codigo_actividad_ejecutar: string
    departamento_labor: string
    ciudad_labor: string
    fecha_inicio_cobertura: string
    es_afiliacion_taxista: string
    tipo_doc_contratante: string
    nume_doc_contratante: string
    actividad_centro_trabajo_contratante: string
    codigo_subempresa?: string
    metodo_subida?: string
}
  
export interface IndependienteConContratoFormData {
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
    cargoOcupacion: string
    codigoEPS: string
    codigoAFP: string
    tipoContrato: string
    naturalezaContrato: string
    suministraTransporte: string
    fechaInicioContrato: string
    fechaFinContrato: string
    valorTotalContrato: string
    codigoActividadEjecutar: string
    departamentoLabor: string
    ciudadLabor: string
    fechaInicioCobertura: string
    esAfiliacionTaxista: string
    tipoDocContratante: string
    numeDocContratante: string
    actividadCentroTrabajoContratante: string
    codigoSubempresa: string
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
  
export function convertToSupabaseFormat(formData: Partial<Registro>): IndependienteConContrato {
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
      cargo_ocupacion: trimmedData.cargoOcupacion || "",
      codigo_eps: trimmedData.codigoEPS || "",
      codigo_afp: trimmedData.codigoAFP || "",
      tipo_contrato: trimmedData.tipoContrato || "",
      naturaleza_contrato: trimmedData.naturalezaContrato || "",
      suministra_transporte: trimmedData.suministraTransporte || "",
      fecha_inicio_contrato: trimmedData.fechaInicioContrato || "",
      fecha_fin_contrato: trimmedData.fechaFinContrato || "",
      valor_total_contrato: trimmedData.valorTotalContrato || "",
      codigo_actividad_ejecutar: trimmedData.codigoActividadEjecutar || "",
      departamento_labor: trimmedData.departamentoLabor || "",
      ciudad_labor: trimmedData.ciudadLabor || "",
      fecha_inicio_cobertura: trimmedData.fechaInicioCobertura || "",
      es_afiliacion_taxista: trimmedData.esAfiliacionTaxista || "",
      tipo_doc_contratante: trimmedData.tipoDocContratante || "",
      nume_doc_contratante: trimmedData.numeDocContratante || "",
      actividad_centro_trabajo_contratante: trimmedData.actividadCentroTrabajoContratante || "",
      codigo_subempresa: trimmedData.codigoSubempresa || undefined,
      metodo_subida: trimmedData.metodoSubida || undefined,
    }
}