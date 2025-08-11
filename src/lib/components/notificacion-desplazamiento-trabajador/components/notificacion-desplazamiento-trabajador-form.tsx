"use client"

import { useForm, Controller } from "react-hook-form"
import { useEffect, useState } from "react"
import { FormInput } from "@/lib/components/core/form/form-input"
import { FormSelect } from "@/lib/components/core/form/form-select"
import { FormDatePicker } from "@/lib/components/core/form/form-datepicker"
import { FormTextarea } from "@/lib/components/core/form/form-textarea"
import { FormWrapper } from "@/lib/components/core/form/form-wrapper"
import { useCatalogStore } from "@/lib/components/core/stores/catalog-store"
import { useRegistroStore } from "../stores/registro-store"
import { ListaRegistros } from "./lista-registros"
import { notificacionDesplazamientoTrabajadorValidationRules, sanitizeFormData } from "../validations/validation-rules"
import { toast } from "@/lib/utils/toast"
import { NotificacionDesplazamientoTrabajadorMassiveUpload } from "./massive-upload"
import { 
  departamentosDaneOptions,
  getMunicipiosDaneOptionsByDepartamento,
} from "@/lib/components/independiente-con-contrato/options/index"
import { SubEmpresaOptions } from "@/lib/options/codigo-subempresa"
import { tiposVinculacionOptions } from "../options/tipos-vinculacion"

const initialDefaultValues = {
  tipo_documento_trabajador: "",
  documento_trabajador: "",
  tipo_documento_empleador: "",
  documento_empleador: "",
  codigo_subempresa: "",
  tipo_vinculacion: "",
  fecha_inicio_desplazamiento: "",
  fecha_fin_desplazamiento: "",
  codigo_departamento: "",
  codigo_municipio: "",
  motivo_desplazamiento: "",
  metodo_subida: undefined,
}

export function NotificacionDesplazamientoTrabajadorForm() {
  const { agregarRegistro, actualizarRegistro, registroEditando, setRegistroEditando } = useRegistroStore()

  const form = useForm({
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: initialDefaultValues,
  })

  const {
    documentTypes,
  } = useCatalogStore()

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isSubmitting },
  } = form

  const currentDepartamento = watch("codigo_departamento")
  const [selectedDepartamento, setSelectedDepartamento] = useState<string | undefined>(undefined)
  const isEditMode = Boolean(registroEditando)

  useEffect(() => {
    if (registroEditando) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { metodo_subida, ...resto } = registroEditando
      setSelectedDepartamento(resto.codigo_departamento)
      reset({
        ...resto,
        metodo_subida: undefined,
      })
    } else {
      setSelectedDepartamento(undefined)
      reset(initialDefaultValues)
    }
  }, [registroEditando, reset])

  useEffect(() => {
    setSelectedDepartamento(currentDepartamento)
  }, [currentDepartamento])

  const documentTypeOptions = (documentTypes || []).map((item) => ({
    value: item.code,
    label: `${item.code} - ${item.name}`,
  }))

  const onValidSubmit = async (data: any) => {
    try {
      const sanitizedData = sanitizeFormData(data)

      if (isEditMode && registroEditando) {
        const registroActualizado = {
          ...registroEditando,
          ...(sanitizedData as any),
        }
        actualizarRegistro(registroActualizado)
        setRegistroEditando(null)
        toast.success({
          title: "Registro actualizado",
          description: "El registro se actualizó correctamente.",
        })
      } else {
        const nuevoRegistro = {
          id: Date.now().toString(),
          ...(sanitizedData as any),
        }
        agregarRegistro(nuevoRegistro)
        toast.success({
          title: "Registro guardado",
          description: "El registro se guardó localmente.",
        })
      }

      form.reset(initialDefaultValues)
      setSelectedDepartamento(undefined)
    } catch (error) {
      console.error("Error al guardar registro:", error)
      toast.error({
        title: "Error al guardar",
        description: "Ocurrió un error al guardar el registro.",
      })
    }
  }

  const onInvalidSubmit = () => {
    toast.error({
      title: "Error de validación",
      description: "Por favor corrija los errores en el formulario antes de continuar.",
    })
  }

  const handleClear = () => {
    form.reset(initialDefaultValues)
    setRegistroEditando(null)
    setSelectedDepartamento(undefined)
    toast.info({
      title: "Formulario limpiado",
      description: "Todos los campos han sido limpiados.",
    })
  }

  return (
    <div className="space-y-8 w-full">
      <FormWrapper
        title="Notificación Desplazamiento Trabajador"
        onSubmit={handleSubmit(onValidSubmit, onInvalidSubmit)}
        onClear={handleClear}
        isSubmitting={isSubmitting}
        isEditing={isEditMode}
        form={form}
        showMassiveUpload={true}
        massiveUploadComponent={<NotificacionDesplazamientoTrabajadorMassiveUpload />}
      >
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-8">Información del Trabajador</h3>
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            <Controller
              name="tipo_documento_trabajador"
              control={control}
              rules={notificacionDesplazamientoTrabajadorValidationRules.tipo_documento_trabajador}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Tipo de Documento del Trabajador"
                  placeholder="Seleccione tipo de documento"
                  options={documentTypeOptions.filter(option => option.value !== "NI")}
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
              rules={notificacionDesplazamientoTrabajadorValidationRules.documento_trabajador}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Número de Documento del Trabajador"
                  placeholder="Ingrese el número de documento"
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
              name="tipo_documento_empleador"
              control={control}
              rules={notificacionDesplazamientoTrabajadorValidationRules.tipo_documento_empleador}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Tipo de Documento del Empleador"
                  placeholder="Seleccione tipo de documento"
                  options={documentTypeOptions}
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
              rules={notificacionDesplazamientoTrabajadorValidationRules.documento_empleador}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Número de Documento del Empleador"
                  placeholder="Ingrese el número de documento"
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
              name="codigo_subempresa"
              control={control}
              rules={notificacionDesplazamientoTrabajadorValidationRules.codigo_subempresa}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Código de Subempresa (Solo para el NIT 899999061)"
                  placeholder="Seleccione código de subempresa"
                  options={SubEmpresaOptions}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="tipo_vinculacion"
              control={control}
              rules={notificacionDesplazamientoTrabajadorValidationRules.tipo_vinculacion}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Tipo de Vinculación"
                  placeholder="Seleccione tipo de vinculación"
                  options={tiposVinculacionOptions}
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
              name="fecha_inicio_desplazamiento"
              control={control}
              rules={notificacionDesplazamientoTrabajadorValidationRules.fecha_inicio_desplazamiento}
              render={({ field, fieldState }) => (
                <FormDatePicker
                  label="Fecha de Inicio del Desplazamiento"
                  placeholder="Seleccione fecha de inicio"
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
              name="fecha_fin_desplazamiento"
              control={control}
              rules={notificacionDesplazamientoTrabajadorValidationRules.fecha_fin_desplazamiento}
              render={({ field, fieldState }) => (
                <FormDatePicker
                  label="Fecha de Fin del Desplazamiento"
                  placeholder="Seleccione fecha de fin"
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
              name="codigo_departamento"
              control={control}
              rules={notificacionDesplazamientoTrabajadorValidationRules.codigo_departamento}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Código del Departamento - Desplazamiento"
                  placeholder="Seleccione departamento"
                  options={departamentosDaneOptions}
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value)
                    setValue("codigo_municipio", "")
                  }}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  required
                />
              )}
            />

            <Controller
              name="codigo_municipio"
              control={control}
              rules={notificacionDesplazamientoTrabajadorValidationRules.codigo_municipio}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Código del Municipio - Desplazamiento"
                  placeholder={
                    !selectedDepartamento
                      ? "Seleccione un departamento primero"
                      : "Seleccione municipio"
                  }
                  options={
                    selectedDepartamento
                      ? getMunicipiosDaneOptionsByDepartamento(selectedDepartamento)
                      : []
                  }
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  required
                  disabled={!selectedDepartamento}
                />
              )}
            />
            
            <div className="col-span-2">
              <Controller
                name="motivo_desplazamiento"
                control={control}
                rules={notificacionDesplazamientoTrabajadorValidationRules.motivo_desplazamiento}
                render={({ field, fieldState }) => (
                  <FormTextarea
                    label="Motivo del Desplazamiento"
                    placeholder="Ingrese el motivo del desplazamiento"
                    value={field.value}
                    onChange={field.onChange}
                    maxLength={200}
                    onBlur={field.onBlur}
                    error={!!fieldState.error}
                    errorMessage={fieldState.error?.message}
                    required
                    rows={3}
                  />
                )}
              />
            </div>
          </div>
        </div>
      </FormWrapper>

      <ListaRegistros />
    </div>
  )
} 