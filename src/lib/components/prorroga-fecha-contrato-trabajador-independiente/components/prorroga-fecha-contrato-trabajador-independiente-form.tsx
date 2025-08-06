"use client"

import { useForm, Controller } from "react-hook-form"
import { useEffect } from "react"
import { FormInput } from "@/lib/components/core/form/form-input"
import { FormSelect } from "@/lib/components/core/form/form-select"
import { FormDatePicker } from "@/lib/components/core/form/form-datepicker"
import { FormWrapper } from "@/lib/components/core/form/form-wrapper"
import { useCatalogStore } from "@/lib/components/core/stores/catalog-store"
import { useRegistroStore } from "../stores/registro-store"
import { ListaRegistros } from "./lista-registros"
import { SubEmpresaOptions } from "@/lib/options/codigo-subempresa"
import { 
  prorrogaFechaContratoTrabajadorIndependienteValidationRules, 
  sanitizeFormData
} from "../validations/validation-rules"
import { toast } from "@/lib/utils/toast"
import type { 
  ProrrogaFechaContratoTrabajadorIndependienteFormData,
} from "../types/prorroga-fecha-contrato-types"
import { 
    DocumentTypesOptions,
} from "@/lib/components/independiente-con-contrato/options/index"
import { ProrrogaFechaContratoTrabajadorIndependienteMassiveUpload } from "./massive-upload"

const initialDefaultValues: ProrrogaFechaContratoTrabajadorIndependienteFormData = {
  tipo_doc_contratante: "",
  documento_contratante: "",
  razon_social: "",
  codigo_subempresa: "",
  tipo_doc_trabajador: "",
  documento_trabajador: "",
  fecha_inicio_contrato_original: "",
  fecha_fin_contrato_nueva: "",
  valor_contrato_prorroga: "",
  correo_electronico: ""
}

export function ProrrogaFechaContratoTrabajadorIndependienteForm() {
  const {
    documentTypes,
  } = useCatalogStore()

  const {
    agregarRegistro,
    actualizarRegistro,
    registroEditando,
    setRegistroEditando,
  } = useRegistroStore()

  const form = useForm<ProrrogaFechaContratoTrabajadorIndependienteFormData>({
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

  const onValidSubmit = async (data: ProrrogaFechaContratoTrabajadorIndependienteFormData) => {
    try {
      const sanitizedData = sanitizeFormData(data);

      if (isEditMode && registroEditando) {
        const registroActualizado = {
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
        title="Prórroga de Fecha de Contrato - Trabajador Independiente"
        onSubmit={handleSubmit(onValidSubmit, onInvalidSubmit)}
        onClear={handleClear}
        isSubmitting={isSubmitting}
        isEditing={isEditMode}
        form={form}
        showMassiveUpload={true}
        massiveUploadComponent={<ProrrogaFechaContratoTrabajadorIndependienteMassiveUpload />}
      >
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-5 col-span-full">Información del Contratante</h3>

            <Controller
              name="tipo_doc_contratante"
              control={control}
              rules={prorrogaFechaContratoTrabajadorIndependienteValidationRules.tipo_doc_contratante}
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
              name="documento_contratante"
              control={control}
              rules={prorrogaFechaContratoTrabajadorIndependienteValidationRules.documento_contratante}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Número Documento Contratante"
                  placeholder="Número documento contratante"
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
              rules={prorrogaFechaContratoTrabajadorIndependienteValidationRules.razon_social}
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
                  value={field.value}
                  onChange={field.onChange}
                  options={SubEmpresaOptions}
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
              rules={prorrogaFechaContratoTrabajadorIndependienteValidationRules.tipo_doc_trabajador}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Tipo Documento Trabajador"
                  placeholder="Seleccionar tipo"
                  options={documentTypesOptions.filter((i) => i.value !== "NI")}
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
              rules={prorrogaFechaContratoTrabajadorIndependienteValidationRules.documento_trabajador}
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

            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 my-5 col-span-full">Información del Contrato</h3>

            <Controller
              name="fecha_inicio_contrato_original"
              control={control}
              rules={prorrogaFechaContratoTrabajadorIndependienteValidationRules.fecha_inicio_contrato_original}
              render={({ field, fieldState }) => (
                <FormDatePicker
                  label="Fecha de Inicio del Contrato Original"
                  placeholder="Seleccione fecha"
                  value={field.value ? new Date(field.value + 'T00:00:00') : undefined}
                  onChange={(date) => field.onChange(date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` : "")}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  required
                />
              )}
            />



            <Controller
              name="fecha_fin_contrato_nueva"
              control={control}
              rules={prorrogaFechaContratoTrabajadorIndependienteValidationRules.fecha_fin_contrato_nueva}
              render={({ field, fieldState }) => (
                <FormDatePicker
                  label="Nueva Fecha de Fin del Contrato"
                  placeholder="Seleccione fecha"
                  value={field.value ? new Date(field.value + 'T00:00:00') : undefined}
                  onChange={(date) => field.onChange(date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` : "")}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  required
                />
              )}
            />

            <Controller
              name="valor_contrato_prorroga"
              control={control}
              rules={prorrogaFechaContratoTrabajadorIndependienteValidationRules.valor_contrato_prorroga}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Valor del Contrato (Solo aplica para Prórroga)"
                  placeholder="Valor del contrato"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="correo_electronico"
              control={control}
              rules={prorrogaFechaContratoTrabajadorIndependienteValidationRules.correo_electronico}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Correo Electrónico de Notificación"
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
          </div>
        </div>
      </FormWrapper>

      <ListaRegistros />
    </div>
  )
} 