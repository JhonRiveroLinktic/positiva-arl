"use client"

import { useForm, Controller } from "react-hook-form"
import { useEffect, useState } from "react"
import { FormInput } from "@/lib/components/core/form/form-input"
import { FormSelect } from "@/lib/components/core/form/form-select"
import { FormWrapper } from "@/lib/components/core/form/form-wrapper"
import { useCatalogStore } from "@/lib/components/core/stores/catalog-store"
import { useRegistroStore } from "../stores/registro-store"
import { ListaRegistros } from "./lista-registros"
import { novedadActualizacionDatosEmpleadorValidationRules, sanitizeFormData } from "../validations/validation-rules"
import { toast } from "@/lib/utils/toast"
import { NovedadActualizacionDatosEmpleadorMassiveUpload } from "./massive-upload"
import { 
  departamentosDaneOptions,
  getMunicipiosDaneOptionsByDepartamento,
} from "@/lib/components/independiente-con-contrato/options/index"
import { SubEmpresaOptions } from "@/lib/options/codigo-subempresa"

const initialDefaultValues = {
  tipo_documento_empleador: "",
  documento_empleador: "",
  codigo_subempresa: "",
  correo_electronico: "",
  direccion: "",
  telefono: "",
  departamento: "",
  municipio: "",
  representante_legal: "",
  metodo_subida: undefined,
}

export function NovedadActualizacionDatosEmpleadorForm() {
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

  const currentDepartamento = watch("departamento")
  const [selectedDepartamento, setSelectedDepartamento] = useState<string | undefined>(undefined)
  const isEditMode = Boolean(registroEditando)

  useEffect(() => {
    if (registroEditando) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { metodo_subida, ...resto } = registroEditando
      setSelectedDepartamento(resto.departamento)
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
        title="Novedad Actualización Datos Empleador"
        onSubmit={handleSubmit(onValidSubmit, onInvalidSubmit)}
        onClear={handleClear}
        isSubmitting={isSubmitting}
        isEditing={isEditMode}
        form={form}
        showMassiveUpload={true}
        massiveUploadComponent={<NovedadActualizacionDatosEmpleadorMassiveUpload />}
      >
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-8">Información del Empleador</h3>
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            <Controller
              name="tipo_documento_empleador"
              control={control}
              rules={novedadActualizacionDatosEmpleadorValidationRules.tipo_documento_empleador}
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
              rules={novedadActualizacionDatosEmpleadorValidationRules.documento_empleador}
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
              name="codigo_subempresa"
              control={control}
              rules={novedadActualizacionDatosEmpleadorValidationRules.codigo_subempresa}
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
              name="correo_electronico"
              control={control}
              rules={novedadActualizacionDatosEmpleadorValidationRules.correo_electronico}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Correo Electrónico"
                  placeholder="Ingrese el correo electrónico"
                  value={field.value}
                  onChange={field.onChange}
                  type="email"
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="direccion"
              control={control}
              rules={novedadActualizacionDatosEmpleadorValidationRules.direccion}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Dirección"
                  placeholder="Ingrese la dirección"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="telefono"
              control={control}
              rules={novedadActualizacionDatosEmpleadorValidationRules.telefono}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Teléfono"
                  placeholder="Ingrese el teléfono"
                  value={field.value}
                  onChange={field.onChange}
                  maxLength={10}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="departamento"
              control={control}
              rules={novedadActualizacionDatosEmpleadorValidationRules.departamento}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Departamento"
                  placeholder="Seleccione departamento"
                  options={departamentosDaneOptions}
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value)
                    setValue("municipio", "")
                  }}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="municipio"
              control={control}
              rules={novedadActualizacionDatosEmpleadorValidationRules.municipio}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Municipio"
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
                  disabled={!selectedDepartamento}
                />
              )}
            />

            <Controller
              name="representante_legal"
              control={control}
              rules={novedadActualizacionDatosEmpleadorValidationRules.representante_legal}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Representante Legal"
                  placeholder="Ingrese el representante legal"
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