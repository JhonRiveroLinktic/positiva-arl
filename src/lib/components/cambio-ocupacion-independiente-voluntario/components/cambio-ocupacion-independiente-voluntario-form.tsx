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
  cambioOcupacionIndependienteVoluntarioValidationRules, 
  sanitizeCambioOcupacionFormData
} from "../validations/validations"
import { toast } from "@/lib/utils/toast"
import type { 
  CambioOcupacionIndependienteVoluntarioFormData,
} from "../types/cambio-ocupacion-types"
import { CambioOcupacionIndependienteVoluntarioMassiveUpload } from "./massive-upload"

const initialDefaultValues: CambioOcupacionIndependienteVoluntarioFormData = {
  tipo_novedad: "",
  tipo_doc_trabajador: "",
  documento_trabajador: "",
  nueva_ocupacion: "",
}

export function CambioOcupacionIndependienteVoluntarioForm() {
  const {
    occupationsDecreto,
    documentTypes,
  } = useCatalogStore()

  const {
    agregarRegistro,
    actualizarRegistro,
    registroEditando,
    setRegistroEditando,
  } = useRegistroStore()

  const form = useForm<CambioOcupacionIndependienteVoluntarioFormData>({
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

  
  const tipoNovedadOptions = [
    { value: "1", label: "CAMBIO OCUPACIÓN PRINCIPAL" },
    { value: "2", label: "ADICIÓN OCUPACIÓN" },
  ]

  const DocumentTypesOptions = (documentTypes || []).map((item) => ({
    value: item.code,
    label: `${item.code} - ${item.name}`,
  }))

  const occupationOptions = (occupationsDecreto || []).map((item) => ({
    value: item.code,
    label: `${item.code} - ${item.name}`,
  }))

  const onValidSubmit = async (data: CambioOcupacionIndependienteVoluntarioFormData) => {
    try {
      const sanitizedData = sanitizeCambioOcupacionFormData(data);

      if (isEditMode && registroEditando) {
        const registroActualizado: CambioOcupacionIndependienteVoluntarioFormData = {
          ...registroEditando,
          ...sanitizedData,
        };
        actualizarRegistro(registroActualizado);
        setRegistroEditando(null);
        toast.success({
          title: "Registro actualizado",
          description: "El registro se actualizó correctamente.",
        });
      } else {
        const nuevoRegistro = {
          id: Date.now().toString(),
          ...sanitizedData,
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
        title="Cambio de Ocupación - Independiente Voluntario"
        onSubmit={handleSubmit(onValidSubmit, onInvalidSubmit)}
        onClear={handleClear}
        isSubmitting={isSubmitting}
        isEditing={isEditMode}
        form={form}
        showMassiveUpload={true}
        massiveUploadComponent={<CambioOcupacionIndependienteVoluntarioMassiveUpload />}
      >
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">

            <Controller
              name="tipo_novedad"
              control={control}
              rules={cambioOcupacionIndependienteVoluntarioValidationRules.tipo_novedad}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Tipo de Novedad"
                  placeholder="Seleccionar novedad"
                  options={tipoNovedadOptions}
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
              name="tipo_doc_trabajador"
              control={control}
              rules={cambioOcupacionIndependienteVoluntarioValidationRules.tipo_doc_trabajador}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Tipo Documento Trabajador"
                  placeholder="Seleccionar tipo"
                  options={DocumentTypesOptions.filter((i) => i.value !== 'NI')}
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
              name="documento_trabajador"
              control={control}
              rules={cambioOcupacionIndependienteVoluntarioValidationRules.documento_trabajador}
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
              name="nueva_ocupacion"
              control={control}
              rules={cambioOcupacionIndependienteVoluntarioValidationRules.nueva_ocupacion}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Ocupación"
                  placeholder="Seleccionar Ocupación"
                  options={occupationOptions}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  required
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