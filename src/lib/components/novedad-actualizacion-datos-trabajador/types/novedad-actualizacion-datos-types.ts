export interface NovedadActualizacionDatosTrabajadorFormData {
  tipo_documento_trabajador: string;
  documento_trabajador: string;
  codigo_eps: string;
  codigo_afp: string;
  correo_electronico_trabajador: string;
  fecha_de_nacimiento: string;
  direccion_de_residencia: string;
  telefono_de_residencia: string;
  departamento_de_residencia: string;
  municipio_de_residencia: string;
  metodo_subida?: string | undefined;
}

export interface NovedadActualizacionDatosTrabajador {
  tipo_documento_trabajador: string;
  documento_trabajador: string;
  codigo_eps: string;
  codigo_afp: string;
  correo_electronico_trabajador: string;
  fecha_de_nacimiento: string;
  direccion_de_residencia: string;
  telefono_de_residencia: string;
  departamento_de_residencia: string;
  municipio_de_residencia: string;
  metodo_subida?: string | undefined;
}

export interface Registro extends Omit<NovedadActualizacionDatosTrabajador, "metodo_subida"> {
  id?: string;
  metodo_subida?: string | undefined;
  registro_id?: string;
}

export function trimRegistroFields(registro: Partial<NovedadActualizacionDatosTrabajador>): Partial<NovedadActualizacionDatosTrabajador> {
  const trimmed: Partial<NovedadActualizacionDatosTrabajador> = {};
  
  for (const [key, value] of Object.entries(registro)) {
    if (typeof value === "string") {
      trimmed[key as keyof NovedadActualizacionDatosTrabajador] = value.trim();
    } else {
      trimmed[key as keyof NovedadActualizacionDatosTrabajador] = value;
    }
  }
  
  return trimmed;
}

export function convertToSupabaseFormat(formData: NovedadActualizacionDatosTrabajadorFormData): Registro {
  const trimmedData = trimRegistroFields(formData);
  
  return {
    tipo_documento_trabajador: trimmedData.tipo_documento_trabajador || "",
    documento_trabajador: trimmedData.documento_trabajador || "",
    codigo_eps: trimmedData.codigo_eps || "",
    codigo_afp: trimmedData.codigo_afp || "",
    correo_electronico_trabajador: trimmedData.correo_electronico_trabajador || "",
    fecha_de_nacimiento: trimmedData.fecha_de_nacimiento || "",
    direccion_de_residencia: trimmedData.direccion_de_residencia || "",
    telefono_de_residencia: trimmedData.telefono_de_residencia || "",
    departamento_de_residencia: trimmedData.departamento_de_residencia || "",
    municipio_de_residencia: trimmedData.municipio_de_residencia || "",
    metodo_subida: trimmedData.metodo_subida || undefined,
  };
}