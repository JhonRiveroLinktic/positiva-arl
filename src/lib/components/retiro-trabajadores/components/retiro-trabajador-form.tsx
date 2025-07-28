"use client"

import { useForm, Controller } from "react-hook-form"
import { useEffect } from "react"
import { FormInput } from "@/lib/components/core/form/form-input"
import { FormSelect } from "@/lib/components/core/form/form-select"
import { FormDatePicker } from "@/lib/components/core/form/form-datepicker"
import { FormWrapper } from "@/lib/components/core/form/form-wrapper"
import { useCatalogStore } from "@/lib/components/core/stores/catalog-store"
import { useRegistroStore } from "../stores/retiro-trabajador-store"
import { ListaRegistros } from "./lista-registros"
import { 
  RetiroTrabajadoresValidationRules, 
  sanitizeFormData
} from "../validations/validation-rules"
import { toast } from "@/lib/utils/toast"
import type { Registro, RetiroTrabajadoresFormData } from "../types/retiro-trabajador"
import { RetiroTrabajadoresMassiveUpload } from "./massive-upload"
import { TIPOS_VINCULACION } from "@/lib/options/tipos-vinculacion"

const initialDefaultValues: RetiroTrabajadoresFormData = {
  tipoDocEmpleador: "",
  documentoEmpleador: "",
  tipoDocTrabajador: "",
  documentoTrabajador: "",
  tipoVinculacion: "",
  fechaRetiroTrabajador: undefined as any,
  correoNotificacion: "",
}

export function RetiroTrabajadoresForm() {
  const {
    documentTypes,
    loading,
    loadDocumentTypes,
  } = useCatalogStore()

  const {
    agregarRegistro,
    actualizarRegistro,
    registroEditando,
    setRegistroEditando,
  } = useRegistroStore()

  const form = useForm<RetiroTrabajadoresFormData>({
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: initialDefaultValues,
  })

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form

  const isEditMode = Boolean(registroEditando)

  useEffect(() => {
    loadDocumentTypes()
  }, [
    loadDocumentTypes,
  ])

  useEffect(() => {
    if (registroEditando) {
      form.reset(registroEditando)
    } else {
      form.reset(initialDefaultValues)
    }
  }, [registroEditando, form])

  const documentTypeOptions = (documentTypes || []).map((item) => ({
    value: item.code,
    label: `${item.code} - ${item.name}`,
  }))

  const vinculationTypeOptions = TIPOS_VINCULACION.map((item) => ({
    value: item.value,
    label: item.label,
  }))


  const onValidSubmit = async (data: RetiroTrabajadoresFormData) => {
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
          description: "El registro se actualizo correctamente.",
        });
      } else {
        const nuevoRegistro: Registro = {
          id: Date.now().toString(),
          ...(sanitizedData as Omit<Registro, "id">),
          metodoSubida: undefined,
        };
        agregarRegistro(nuevoRegistro);
        toast.success({
          title: "Registro guardado",
          description: "El registro se guardo localmente.",
        });
      }

      form.reset(initialDefaultValues);
    } catch (error) {
      console.error("Error al guardar registro:", error);
      toast.error({
        title: "Error al guardar",
        description: "Ocurrio un error al guardar el registro.",
      });
    }
  };

  const onInvalidSubmit = () => {
    toast.error({
      title: "Error de validacion",
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
        title="Formulario de Cambio de Fechas"
        onSubmit={handleSubmit(onValidSubmit, onInvalidSubmit)}
        onClear={handleClear}
        isSubmitting={isSubmitting}
        isEditing={isEditMode}
        form={form}
        showMassiveUpload={true}
        massiveUploadComponent={<RetiroTrabajadoresMassiveUpload />}
      >
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-8">Informacion del Empleador</h3>
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            <Controller
              name="tipoDocEmpleador"
              control={control}
              rules={RetiroTrabajadoresValidationRules.tipoDocEmpleador}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Tipo Documento Empleador"
                  placeholder={loading.documentTypes ? "Cargando..." : "Seleccionar tipo"}
                  options={documentTypeOptions}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  required
                  disabled={loading.documentTypes}
                />
              )}
            />

            <Controller
              name="documentoEmpleador"
              control={control}
              rules={RetiroTrabajadoresValidationRules.documentoEmpleador}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Documento Empleador"
                  placeholder="Numero documento empleador"
                  value={field.value}
                  onChange={field.onChange}
                  maxLength={50}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  required
                />
              )}
            />
          </div>

          <div className="col-span-3 my-8">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Informacion del Trabajador</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            <Controller
              name="tipoDocTrabajador"
              control={control}
              rules={RetiroTrabajadoresValidationRules.tipoDocTrabajador}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Tipo Documento Trabajador"
                  placeholder={loading.documentTypes ? "Cargando..." : "Seleccionar tipo"}
                  options={documentTypeOptions.filter((item) => item.value !== "NI")}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  required
                  disabled={loading.documentTypes}
                />
              )}
            />

            <Controller
              name="documentoTrabajador"
              control={control}
              rules={RetiroTrabajadoresValidationRules.documentoTrabajador}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Documento Trabajador"
                  placeholder="Numero documento trabajador"
                  value={field.value}
                  onChange={field.onChange}
                  maxLength={50}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  required
                />
              )}
            />
          </div>

          <div className="col-span-3 my-8">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Informacion Laboral</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            <Controller
              name="tipoVinculacion"
              control={control}
              rules={RetiroTrabajadoresValidationRules.tipoVinculacion}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Tipo de Vinculación"
                  placeholder="Seleccionar tipo de vinculación"
                  options={vinculationTypeOptions}
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
              name="fechaRetiroTrabajador"
              control={control}
              rules={RetiroTrabajadoresValidationRules.fechaRetiroTrabajador}
              render={({ field, fieldState }) => (
                <FormDatePicker
                  label="Fecha Retiro Trabajador"
                  placeholder="Seleccionar fecha de retiro"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  required
                  minDate={new Date("1901-01-01")}
                />
              )}
            />

            <div>
              <Controller
                name="correoNotificacion"
                control={control}
                rules={RetiroTrabajadoresValidationRules.correoNotificacion}
                render={({ field, fieldState }) => (
                  <FormInput
                    label="Correo de Notificacion"
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
                <p className="text-xs pt-1 text-gray-500 font-medium">Donde se remitirán las novedades</p>
            </div>
          </div>
        </div>
      </FormWrapper>

      <ListaRegistros />
    </div>
  )
} 