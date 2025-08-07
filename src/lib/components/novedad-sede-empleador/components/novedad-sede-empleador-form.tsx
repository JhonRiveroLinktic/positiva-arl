"use client"

import { useForm, Controller } from "react-hook-form"
import { useEffect, useState } from "react"
import { FormInput } from "@/lib/components/core/form/form-input"
import { FormSelect } from "@/lib/components/core/form/form-select"
import { FormWrapper } from "@/lib/components/core/form/form-wrapper"
import { useCatalogStore } from "@/lib/components/core/stores/catalog-store"
import { useRegistroStore } from "../stores/registro-store"
import { ListaRegistros } from "./lista-registros"
import { novedadSedeEmpleadorValidationRules, sanitizeFormData } from "../validations/validation-rules"
import { toast } from "@/lib/utils/toast"
import { NovedadSedeEmpleadorMassiveUpload } from "./massive-upload"
import { 
  departamentosDaneOptions,
  getMunicipiosDaneOptionsByDepartamento,
} from "@/lib/components/independiente-con-contrato/options/index"
import { SubEmpresaOptions } from "@/lib/options/codigo-subempresa"

const initialDefaultValues = {
  tipo_documento_empleador: "",
  documento_empleador: "",
  nombres_y_apellidos_y_o_razon_social: "",
  codigo_subempresa: "",
  nombre_sede: "",
  codigo_dane_departamento_sede: "",
  codigo_dane_municipio_sede: "",
  direccion_sede: "",
  telefono_sede: "",
  correo_electronico_sede: "",
  metodo_subida: undefined,
}

export function NovedadSedeEmpleadorForm() {
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

  const currentDepartamento = watch("codigo_dane_departamento_sede")
  const [selectedDepartamento, setSelectedDepartamento] = useState<string | undefined>(undefined)
  const isEditMode = Boolean(registroEditando)

  useEffect(() => {
    if (registroEditando) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { metodo_subida, ...resto } = registroEditando
      setSelectedDepartamento(resto.codigo_dane_departamento_sede)
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
        title="Novedad Sede Empleador"
        onSubmit={handleSubmit(onValidSubmit, onInvalidSubmit)}
        onClear={handleClear}
        isSubmitting={isSubmitting}
        isEditing={isEditMode}
        form={form}
        showMassiveUpload={true}
        massiveUploadComponent={<NovedadSedeEmpleadorMassiveUpload />}
      >
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-8">Información del Empleador</h3>
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            <Controller
              name="tipo_documento_empleador"
              control={control}
              rules={novedadSedeEmpleadorValidationRules.tipo_documento_empleador}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Tipo de Documento"
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
              rules={novedadSedeEmpleadorValidationRules.documento_empleador}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Número de Documento"
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
              name="nombres_y_apellidos_y_o_razon_social"
              control={control}
              rules={novedadSedeEmpleadorValidationRules.nombres_y_apellidos_y_o_razon_social}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Nombres y Apellidos o Razón Social"
                  placeholder="Ingrese nombres y apellidos o razón social"
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
              name="codigo_subempresa"
              control={control}
              rules={novedadSedeEmpleadorValidationRules.codigo_subempresa}
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
              name="nombre_sede"
              control={control}
              rules={novedadSedeEmpleadorValidationRules.nombre_sede}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Nombre de la Sede"
                  placeholder="Ingrese el nombre de la sede"
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
              name="codigo_dane_departamento_sede"
              control={control}
              rules={novedadSedeEmpleadorValidationRules.codigo_dane_departamento_sede}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Código DANE Departamento de la Sede"
                  placeholder="Seleccione departamento"
                  options={departamentosDaneOptions}
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value)
                    setValue("codigo_dane_municipio_sede", "")
                  }}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  required
                />
              )}
            />

            <Controller
              name="codigo_dane_municipio_sede"
              control={control}
              rules={novedadSedeEmpleadorValidationRules.codigo_dane_municipio_sede}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Código DANE Municipio de la Sede"
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

            <Controller
              name="direccion_sede"
              control={control}
              rules={novedadSedeEmpleadorValidationRules.direccion_sede}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Dirección de la Sede"
                  placeholder="Ingrese la dirección de la sede"
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
              name="telefono_sede"
              control={control}
              rules={novedadSedeEmpleadorValidationRules.telefono_sede}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Teléfono de la Sede"
                  placeholder="Ingrese el teléfono de la sede"
                  value={field.value}
                  maxLength={10}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  required
                />
              )}
            />

            <Controller
              name="correo_electronico_sede"
              control={control}
              rules={novedadSedeEmpleadorValidationRules.correo_electronico_sede}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Correo Electrónico de la Sede"
                  placeholder="Ingrese el correo electrónico de la sede"
                  value={field.value}
                  onChange={field.onChange}
                  type="email"
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