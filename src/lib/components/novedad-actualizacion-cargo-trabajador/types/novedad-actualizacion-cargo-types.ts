export interface NovedadActualizacionCargoTrabajadorFormData {
    tipo_doc_empleador: string;
    documento_empleador: string;
    razon_social: string;
    codigo_subempresa: string;
    tipo_doc_trabajador: string;
    documento_trabajador: string;
    tipo_vinculacion: 'I' | 'D' | string;
    cargo_nuevo: string;
    metodo_subida?: string;
}

export interface Registro {
    id?: string;
    tipo_doc_empleador: string;
    documento_empleador: string;
    razon_social: string;
    codigo_subempresa: string;
    tipo_doc_trabajador: string;
    documento_trabajador: string;
    tipo_vinculacion: 'I' | 'D' | string;
    cargo_anterior?: string; // Opcional, se obtiene de la BD
    cargo_nuevo: string;
    metodo_subida?: string;
    novedad_actualizacion_cargo_trabajador_id?: string;
}

export function trimRegistroFields(registro: Partial<Registro>): Partial<Registro> {
    const trimmed: Partial<Registro> = {};

    for (const [key, value] of Object.entries(registro)) {
        if (typeof value === "string") {
            trimmed[key as keyof Registro] = value.trim();
        } else {
            trimmed[key as keyof Registro] = value;
        }
    }

    return trimmed;
}

export function convertToSupabaseFormat(formData: Partial<Registro>): Registro {
    const trimmedData = trimRegistroFields(formData);

    return {
        tipo_doc_empleador: trimmedData.tipo_doc_empleador || "",
        documento_empleador: trimmedData.documento_empleador || "",
        razon_social: trimmedData.razon_social || "",
        codigo_subempresa: trimmedData.codigo_subempresa || "",
        tipo_doc_trabajador: trimmedData.tipo_doc_trabajador || "",
        documento_trabajador: trimmedData.documento_trabajador || "",
        tipo_vinculacion: trimmedData.tipo_vinculacion || "",
        cargo_nuevo: trimmedData.cargo_nuevo || "",
        metodo_subida: trimmedData.metodo_subida || undefined,
    };
} 