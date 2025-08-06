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
  novedadActualizacionCargoTrabajadorValidationRules, 
  sanitizeFormData
} from "../validations/validation-rules"
import { toast } from "@/lib/utils/toast"
import type { Registro, NovedadActualizacionCargoTrabajadorFormData } from "../types/novedad-actualizacion-cargo-types"
import { NovedadActualizacionCargoTrabajadorMassiveUpload } from "./massive-upload"
import { SubEmpresaOptions } from "@/lib/options/codigo-subempresa"

const initialDefaultValues: NovedadActualizacionCargoTrabajadorFormData = {
    tipo_doc_empleador: "",
    documento_empleador: "",
    razon_social: "",
    codigo_subempresa: "",
    tipo_doc_trabajador: "",
    documento_trabajador: "",
    tipo_vinculacion: "",
    cargo_nuevo: ""
}

const tipoVinculacionOptions = [
    { value: "I", label: "I - Independiente con contrato" },
    { value: "D", label: "D - Dependiente" }
]

export function NovedadActualizacionCargoTrabajadorForm() {
  const {
    documentTypes,
    occupations,
  } = useCatalogStore()

  const {
    agregarRegistro,
    actualizarRegistro,
    registroEditando,
    setRegistroEditando,
  } = useRegistroStore()

  const form = useForm<NovedadActualizacionCargoTrabajadorFormData>({
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

  const occupationOptions = (occupations || []).map((item) => ({
    value: item.code,
    label: `${item.code} - ${item.name.substring(0, 60)}...`,
  }))

  const onValidSubmit = async (data: NovedadActualizacionCargoTrabajadorFormData) => {
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
        title="Novedad de Actualización de Cargo de Trabajador"
        onSubmit={handleSubmit(onValidSubmit, onInvalidSubmit)}
        onClear={handleClear}
        isSubmitting={isSubmitting}
        isEditing={isEditMode}
        form={form}
        showMassiveUpload={true}
        massiveUploadComponent={<NovedadActualizacionCargoTrabajadorMassiveUpload />}
      >
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-5 col-span-full">Información del Empleador</h3>

            <Controller
              name="tipo_doc_empleador"
              control={control}
              rules={novedadActualizacionCargoTrabajadorValidationRules.tipo_doc_empleador}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Tipo Documento Empleador"
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
              name="documento_empleador"
              control={control}
              rules={novedadActualizacionCargoTrabajadorValidationRules.documento_empleador}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Número Documento Empleador"
                  placeholder="Número documento empleador"
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
              name="razon_social"
              control={control}
              rules={novedadActualizacionCargoTrabajadorValidationRules.razon_social}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Razón Social"
                  placeholder="Ingrese razón social"
                  value={field.value}
                  onChange={field.onChange}
                  maxLength={200}
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
            
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 my-5 col-span-full">Información del Trabajador</h3>

            <Controller
              name="tipo_doc_trabajador"
              control={control}
              rules={novedadActualizacionCargoTrabajadorValidationRules.tipo_doc_trabajador}
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
              name="documento_trabajador"
              control={control}
              rules={novedadActualizacionCargoTrabajadorValidationRules.documento_trabajador}
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
              name="tipo_vinculacion"
              control={control}
              rules={novedadActualizacionCargoTrabajadorValidationRules.tipo_vinculacion}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Tipo de Vinculación"
                  placeholder="Seleccionar tipo de vinculación"
                  options={tipoVinculacionOptions}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  required
                />
              )}
            />

            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 my-5 col-span-full">Información del Cargo</h3>

            <Controller
              name="cargo_nuevo"
              control={control}
              rules={novedadActualizacionCargoTrabajadorValidationRules.cargo_nuevo}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Nuevo Cargo"
                  placeholder="Código nuevo cargo"
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