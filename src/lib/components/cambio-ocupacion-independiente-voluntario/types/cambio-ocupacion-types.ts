export interface CambioOcupacionIndependienteVoluntarioFormData {
    tipo_novedad: string;
    tipo_doc_trabajador: string;
    documento_trabajador: string;
    nueva_ocupacion: string;
    metodo_subida?: string;
}

export interface Registro {
    id?: string;
    tipo_novedad: string;
    tipo_doc_trabajador: string;
    documento_trabajador: string;
    ocupacion_anterior?: string;
    nueva_ocupacion: string;
    metodo_subida?: string;
}

export function trimFormDataFields(formData: Partial<CambioOcupacionIndependienteVoluntarioFormData>): Partial<CambioOcupacionIndependienteVoluntarioFormData> {
    const trimmed: Partial<CambioOcupacionIndependienteVoluntarioFormData> = {};

    for (const [key, value] of Object.entries(formData)) {
        if (typeof value === "string") {
            trimmed[key as keyof CambioOcupacionIndependienteVoluntarioFormData] = value.trim();
        } else {
            trimmed[key as keyof CambioOcupacionIndependienteVoluntarioFormData] = value;
        }
    }
    return trimmed;
}

export function convertToSupabaseFormat(formData: Partial<CambioOcupacionIndependienteVoluntarioFormData>): Registro {
    const trimmedData = trimFormDataFields(formData);

    return {
        tipo_novedad: trimmedData.tipo_novedad || "",
        tipo_doc_trabajador: trimmedData.tipo_doc_trabajador || "",
        documento_trabajador: trimmedData.documento_trabajador || "",
        nueva_ocupacion: trimmedData.nueva_ocupacion || "",
        metodo_subida: trimmedData.metodo_subida || undefined,
    };
}