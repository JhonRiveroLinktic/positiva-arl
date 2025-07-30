"use client"

import { useForm, Controller } from "react-hook-form"
import { useEffect } from "react"
import { FormInput } from "@/lib/components/core/form/form-input"
import { FormSelect } from "@/lib/components/core/form/form-select"
import { FormWrapper } from "@/lib/components/core/form/form-wrapper"
import { useCatalogStore } from "@/lib/components/core/stores/catalog-store"
import { useRegistroStore } from "../stores/registro-store"
import { ListaRegistros } from "./lista-registros"
import { 
  cambioActividadEconomicaIndependienteConContratoValidationRules, 
  sanitizeFormData
} from "../validations/validations"
import { toast } from "@/lib/utils/toast"
import type { Registro, CambioActividadEconomicaIndependienteConContratoFormData } from "../types/cambio-actividad-economica-types"
import { IndependienteConContratoMassiveUpload } from "./massive-upload"
import { SubEmpresaOptions } from "@/lib/options/codigo-subempresa"

const initialDefaultValues: CambioActividadEconomicaIndependienteConContratoFormData = {
    tipo_doc_contratante: "",
    nume_doc_contratante: "",
    nombre_razon_social_contratante: "",
    codigo_subempresa: "",
    tipo_doc_trabajador: "",
    nume_doc_trabajador: "",
    nueva_actividad_economica: "",
    correo_notificacion: ""
}

export function CambioActividadEconomicaIndependienteConContratoForm() {
  const {
    documentTypes,
    economicActivities,
  } = useCatalogStore()

  const {
    agregarRegistro,
    actualizarRegistro,
    registroEditando,
    setRegistroEditando,
  } = useRegistroStore()

  const form = useForm<CambioActividadEconomicaIndependienteConContratoFormData>({
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: initialDefaultValues,
  })

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form
  
  const isEditMode = Boolean(registroEditando)

  useEffect(() => {
    if (registroEditando) {
      reset(registroEditando); 
    } else {
      reset(initialDefaultValues); 
    }
  }, [registroEditando, reset]);

  const documentTypesOptions = (documentTypes || []).map((item) => ({
    value: item.code,
    label: `${item.code} - ${item.name}`,
  }))

  const economicActivityOptions = (economicActivities || []).map((item) => ({
    value: item.code,
    label: `${item.code} - ${item.name.substring(0, 60)}...`,
  }))

  const onValidSubmit = async (data: CambioActividadEconomicaIndependienteConContratoFormData) => {
    try {
      const sanitizedData = sanitizeFormData(data);

      if (isEditMode && registroEditando) {
        const registroActualizado: Registro = {
          ...registroEditando,
          ...(sanitizedData as Omit<Registro, "id">),
        };
        actualizarRegistro(registroActualizado);
        setRegistroEditando(null);
        toast.success({
          title: "Registro actualizado",
          description: "El registro se actualizó correctamente.",
        });
      } else {
        const nuevoRegistro: Registro = {
          id: Date.now().toString(),
          ...(sanitizedData as Omit<Registro, "id">),
          metodo_subida: undefined,
        };
        agregarRegistro(nuevoRegistro);
        toast.success({
          title: "Registro guardado",
          description: "El registro se guardó localmente.",
        });
      }

      form.reset(initialDefaultValues);
    } catch (error) {
      console.error("Error al guardar registro:", error);
      toast.error({
        title: "Error al guardar",
        description: "Ocurrió un error al guardar el registro.",
      });
    }
  };

  const onInvalidSubmit = () => {
    toast.error({
      title: "Error de validación",
      description: "Por favor corrija los errores en el formulario antes de continuar.",
    });
  };

  const handleClear = () => {
    form.reset(initialDefaultValues)
    setRegistroEditando(null)
    toast.info({
      title: "Formulario limpiado",
      description: "Todos los campos han sido limpiados.",
    })
  }

  return (
    <div className="space-y-8 w-full">
      <FormWrapper
        title="Cambio Actividad Económica a Ejecutar - Independiente con contrato"
        onSubmit={handleSubmit(onValidSubmit, onInvalidSubmit)}
        onClear={handleClear}
        isSubmitting={isSubmitting}
        isEditing={isEditMode}
        form={form}
        showMassiveUpload={true}
        massiveUploadComponent={<IndependienteConContratoMassiveUpload />}
        >
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-5 col-span-full">Información del Trabajador</h3>

            <Controller
              name="tipo_doc_trabajador"
              control={control}
              rules={cambioActividadEconomicaIndependienteConContratoValidationRules.tipo_doc_trabajador}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Tipo Documento Trabajador"
                  placeholder="Seleccionar tipo"
                  options={documentTypesOptions}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  required
                />
              )}
            />

            <Controller
              name="nume_doc_trabajador"
              control={control}
              rules={cambioActividadEconomicaIndependienteConContratoValidationRules.nume_doc_trabajador}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Número Documento Trabajador"
                  placeholder="Número documento trabajador"
                  value={field.value}
                  onChange={field.onChange}
                  maxLength={20}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  required
                />
              )}
            />

            <Controller
              name="nueva_actividad_economica"
              control={control}
              rules={cambioActividadEconomicaIndependienteConContratoValidationRules.nueva_actividad_economica}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Nueva actividad económica"
                  placeholder="Seleccionar Actividad"
                  options={economicActivityOptions}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  required
                />
              )}
            />

            <Controller
              name="correo_notificacion"
              control={control}
              rules={cambioActividadEconomicaIndependienteConContratoValidationRules.correo_notificacion}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Correo Electrónico"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  required
                />
              )}
            />
            
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 my-5 col-span-full">Información del Contratante</h3>

            <Controller
              name="tipo_doc_contratante"
              control={control}
              rules={cambioActividadEconomicaIndependienteConContratoValidationRules.tipo_doc_contratante}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Tipo Documento Contratante"
                  placeholder="Seleccionar tipo"
                  options={documentTypesOptions}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  required
                />
              )}
            />

            <Controller
              name="nume_doc_contratante"
              control={control}
              rules={cambioActividadEconomicaIndependienteConContratoValidationRules.nume_doc_contratante}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Número Documento Contratante"
                  placeholder="Número documento Contratante"
                  value={field.value}
                  onChange={field.onChange}
                  maxLength={20}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  required
                />
              )}
            />

            <Controller
              name="nombre_razon_social_contratante"
              control={control}
              rules={cambioActividadEconomicaIndependienteConContratoValidationRules.nombre_razon_social_contratante}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Nombres y apellidos o Razón Social"
                  placeholder="Ingrese nombre completo o razón social"
                  value={field.value}
                  onChange={field.onChange}
                  maxLength={100}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  required
                />
              )}
            />

            <Controller
              name="codigo_subempresa"
              control={control}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Código Subempresa (SOLO PARA EL NIT 899999061)"
                  placeholder="Código subempresa (opcional)"
                  options={SubEmpresaOptions}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
          </div>
        </div>
      </FormWrapper>

      <ListaRegistros />
    </div>
  )
}