export interface Registro {
    id: string
    tipoDocEmpleador: string
    documentoEmpleador: string
    digitoVerificacionEmpleador: string
    razonSocialEmpleador: string
    departamentoEmpleador: string
    municipioEmpleador: string
    direccionEmpleador: string
    zonaEmpleador: string
    actEconomicaPrincipalEmpleador: string
    telefonoEmpleador: string
    faxEmpleador: string
    correoElectronicoEmpleador: string
    suministroDeTransporte: string
    naturaleza: string
    fechaRadicacion: string
    origen: string
    fechaCobertura: string
    codigoArl: string
    tipoDocArlAnterior: string
    nitArlAnterior: string
    fechaNotificacionTraslado: string
    tipoDocRepresentanteLegal: string
    numeDocRepresentanteLegal: string
    primerNombreRepresentanteLegal: string
    segundoNombreRepresentanteLegal: string
    primerApellidoRepresentanteLegal: string
    segundoApellidoRepresentanteLegal: string
    fechaNacimientoRepresentanteLegal: string
    sexoRepresentanteLegal: string
    paisRepresentanteLegal: string
    departamentoRepresentanteLegal: string
    municipioRepresentanteLegal: string
    direccionRepresentanteLegal: string
    telefonoRepresentanteLegal: string
    correoElectronicoRepresentanteLegal: string
    nitAfpRepresentanteLegal: string
    nitEpsRepresentanteLegal: string
    metodoSubida?: string
    archivos?: File[]
}

export interface AfiliacionEmpleadorDB {
    id?: string
    tipo_doc_empleador: string
    documento_empleador: string
    digito_verificacion_empleador?: string
    razon_social_empleador: string
    departamento_empleador: string
    municipio_empleador: string
    direccion_empleador: string
    zona_empleador?: string
    act_economica_principal_empleador: string
    telefono_empleador?: string
    fax_empleador?: string
    correo_electronico_empleador: string
    suministro_de_transporte?: string
    naturaleza?: string
    fecha_radicacion: string
    origen?: string
    fecha_cobertura?: string
    codigo_arl?: string
    tipo_doc_arl_anterior?: string
    nit_arl_anterior?: string
    fecha_notificacion_traslado?: string
    tipo_doc_representante_legal: string
    nume_doc_representante_legal: string
    primer_nombre_representante_legal: string
    segundo_nombre_representante_legal?: string
    primer_apellido_representante_legal: string
    segundo_apellido_representante_legal?: string
    fecha_nacimiento_representante_legal: string
    sexo_representante_legal: string
    pais_representante_legal?: string
    departamento_representante_legal: string
    municipio_representante_legal: string
    direccion_representante_legal: string
    telefono_representante_legal?: string
    correo_electronico_representante_legal: string
    nit_afp_representante_legal?: string
    nit_eps_representante_legal?: string
    metodo_subida?: string
}

export interface AfiliacionEmpleadorFormData {
    tipoDocEmpleador: string
    documentoEmpleador: string
    digitoVerificacionEmpleador: string
    razonSocialEmpleador: string
    departamentoEmpleador: string
    municipioEmpleador: string
    direccionEmpleador: string
    zonaEmpleador: string
    actEconomicaPrincipalEmpleador: string
    telefonoEmpleador: string
    faxEmpleador: string
    correoElectronicoEmpleador: string
    suministroDeTransporte: string
    naturaleza: string
    fechaRadicacion: string
    origen: string
    fechaCobertura: string
    codigoArl: string
    tipoDocArlAnterior: string
    nitArlAnterior: string
    fechaNotificacionTraslado: string
    tipoDocRepresentanteLegal: string
    numeDocRepresentanteLegal: string
    primerNombreRepresentanteLegal: string
    segundoNombreRepresentanteLegal: string
    primerApellidoRepresentanteLegal: string
    segundoApellidoRepresentanteLegal: string
    fechaNacimientoRepresentanteLegal: string
    sexoRepresentanteLegal: string
    paisRepresentanteLegal: string
    departamentoRepresentanteLegal: string
    municipioRepresentanteLegal: string
    direccionRepresentanteLegal: string
    telefonoRepresentanteLegal: string
    correoElectronicoRepresentanteLegal: string
    nitAfpRepresentanteLegal: string
    nitEpsRepresentanteLegal: string
}

export function trimAfiliacionEmpleadorFields(afiliacion: Partial<Registro>): Partial<Registro> {
    const trimmed: Partial<Registro> = {}

    for (const [key, value] of Object.entries(afiliacion)) {
        if (typeof value === "string") {
            trimmed[key as keyof Registro] = value.trim() as any
        } else {
            trimmed[key as keyof Registro] = value as any
        }
    }

    return trimmed
}

export function convertAfiliacionEmpleadorToSupabaseFormat(formData: Partial<Registro>): AfiliacionEmpleadorDB {
    const trimmedData = trimAfiliacionEmpleadorFields(formData)

    return {
        tipo_doc_empleador: trimmedData.tipoDocEmpleador || "",
        documento_empleador: trimmedData.documentoEmpleador || "",
        digito_verificacion_empleador: trimmedData.digitoVerificacionEmpleador || undefined,
        razon_social_empleador: trimmedData.razonSocialEmpleador || "",
        departamento_empleador: trimmedData.departamentoEmpleador || "",
        municipio_empleador: trimmedData.municipioEmpleador || "",
        direccion_empleador: trimmedData.direccionEmpleador || "",
        zona_empleador: trimmedData.zonaEmpleador || undefined,
        act_economica_principal_empleador: trimmedData.actEconomicaPrincipalEmpleador || "",
        telefono_empleador: trimmedData.telefonoEmpleador || undefined,
        fax_empleador: trimmedData.faxEmpleador || undefined,
        correo_electronico_empleador: trimmedData.correoElectronicoEmpleador || "",
        suministro_de_transporte: trimmedData.suministroDeTransporte || undefined,
        naturaleza: trimmedData.naturaleza || undefined,
        fecha_radicacion: trimmedData.fechaRadicacion || "",
        origen: trimmedData.origen || undefined,
        fecha_cobertura: trimmedData.fechaCobertura || undefined,
        codigo_arl: trimmedData.codigoArl || undefined,
        tipo_doc_arl_anterior: trimmedData.tipoDocArlAnterior || undefined,
        nit_arl_anterior: trimmedData.nitArlAnterior || undefined,
        fecha_notificacion_traslado: trimmedData.fechaNotificacionTraslado || undefined,
        tipo_doc_representante_legal: trimmedData.tipoDocRepresentanteLegal || "",
        nume_doc_representante_legal: trimmedData.numeDocRepresentanteLegal || "",
        primer_nombre_representante_legal: trimmedData.primerNombreRepresentanteLegal || "",
        segundo_nombre_representante_legal: trimmedData.segundoNombreRepresentanteLegal || undefined,
        primer_apellido_representante_legal: trimmedData.primerApellidoRepresentanteLegal || "",
        segundo_apellido_representante_legal: trimmedData.segundoApellidoRepresentanteLegal || undefined,
        fecha_nacimiento_representante_legal: trimmedData.fechaNacimientoRepresentanteLegal || "",
        sexo_representante_legal: trimmedData.sexoRepresentanteLegal || "",
        pais_representante_legal: trimmedData.paisRepresentanteLegal || undefined,
        departamento_representante_legal: trimmedData.departamentoRepresentanteLegal || "",
        municipio_representante_legal: trimmedData.municipioRepresentanteLegal || "",
        direccion_representante_legal: trimmedData.direccionRepresentanteLegal || "",
        telefono_representante_legal: trimmedData.telefonoRepresentanteLegal || undefined,
        correo_electronico_representante_legal: trimmedData.correoElectronicoRepresentanteLegal || "",
        nit_afp_representante_legal: trimmedData.nitAfpRepresentanteLegal || undefined,
        nit_eps_representante_legal: trimmedData.nitEpsRepresentanteLegal || undefined,
        metodo_subida: trimmedData.metodoSubida || undefined,
    }
}