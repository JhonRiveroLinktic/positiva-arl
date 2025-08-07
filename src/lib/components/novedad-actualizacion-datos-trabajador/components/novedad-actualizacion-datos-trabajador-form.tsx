"use client"

import { useForm, Controller } from "react-hook-form"
import { useEffect, useState } from "react"
import { FormInput } from "@/lib/components/core/form/form-input"
import { FormSelect } from "@/lib/components/core/form/form-select"
import { FormDatePicker } from "@/lib/components/core/form/form-datepicker"
import { FormWrapper } from "@/lib/components/core/form/form-wrapper"
import { useCatalogStore } from "@/lib/components/core/stores/catalog-store"
import { useRegistroStore } from "../stores/registro-store"
import { ListaRegistros } from "./lista-registros"
import { 
  novedadActualizacionDatosTrabajadorValidationRules, 
  sanitizeFormData
} from "../validations/validation-rules"
import { toast } from "@/lib/utils/toast"
import type { Registro, NovedadActualizacionDatosTrabajadorFormData } from "../types/novedad-actualizacion-datos-types"
import { NovedadActualizacionDatosTrabajadorMassiveUpload } from "./massive-upload"
import { 
  departamentosDaneOptions,
  getMunicipiosDaneOptionsByDepartamento,
} from "@/lib/components/independiente-con-contrato/options"

const initialDefaultValues: NovedadActualizacionDatosTrabajadorFormData = {
  tipo_documento_trabajador: "",
  documento_trabajador: "",
  codigo_eps: "",
  codigo_afp: "",
  correo_electronico_trabajador: "",
  fecha_de_nacimiento: "",
  direccion_de_residencia: "",
  telefono_de_residencia: "",
  departamento_de_residencia: "",
  municipio_de_residencia: "",
  metodo_subida: undefined,
}

export function NovedadActualizacionDatosTrabajadorForm() {
  const {
    documentTypes,
    loading,
    epsCodes,
  } = useCatalogStore()

  const {
    agregarRegistro,
    actualizarRegistro,
    registroEditando,
    setRegistroEditando,
  } = useRegistroStore()

  const form = useForm<NovedadActualizacionDatosTrabajadorFormData>({
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: initialDefaultValues,
  })

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isSubmitting },
  } = form

  const currentDepartamentoResidencia = watch("departamento_de_residencia");

  const [selectedDepartamento, setSelectedDepartamento] = useState<string | undefined>(undefined);
  
  const isEditMode = Boolean(registroEditando)

  useEffect(() => {
    if (registroEditando) {
      reset(registroEditando); 
    } else {
      reset(initialDefaultValues); 
    }
  }, [registroEditando, reset]);

  useEffect(() => {
    setSelectedDepartamento(currentDepartamentoResidencia);
  }, [currentDepartamentoResidencia]);

  const documentTypeOptions = (documentTypes || []).map((item) => ({
    value: item.code,
    label: `${item.code} - ${item.name}`,
  }))

  const EPSOptions = (epsCodes || []).map((item) => ({
    value: item.code,
    label: `${item.code} - ${item.name}`,
  }))

  const afpCodes = [
    { code: "0", name: "SIN AFP (PENSIONADOS o NO OBLIGADOS A COTIZAR PENSION)" },
    { code: "2", name: "PROTECCION" },
    { code: "3", name: "PORVENIR" },
    { code: "4", name: "COLFONDOS S.A. PENSIONES Y CESANTIAS" },
    { code: "7", name: "OLD MUTUAL (ANTES SKANDIA)" },
    { code: "14", name: "COLPENSIONES ADMINISTRADORA COLOMBIANA DE PENSIONES" },
  ];
  
  const AFPOptions = (afpCodes || []).map((item) => ({
    value: item.code,
    label: `${item.code} - ${item.name}`,
  }));

  const onValidSubmit = async (data: NovedadActualizacionDatosTrabajadorFormData) => {
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
      setSelectedDepartamento(undefined);
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
    setSelectedDepartamento(undefined);
    toast.info({
      title: "Formulario limpiado",
      description: "Todos los campos han sido limpiados.",
    })
  }

  return (
    <div className="space-y-8 w-full">
      <FormWrapper
        title="Formulario de Novedad Actualización Datos Trabajador"
        onSubmit={handleSubmit(onValidSubmit, onInvalidSubmit)}
        onClear={handleClear}
        isSubmitting={isSubmitting}
        isEditing={isEditMode}
        form={form}
        showMassiveUpload={true}
        massiveUploadComponent={<NovedadActualizacionDatosTrabajadorMassiveUpload />}
        >
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-8">Información del Trabajador</h3>
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            <Controller
              name="tipo_documento_trabajador"
              control={control}
              rules={novedadActualizacionDatosTrabajadorValidationRules.tipo_documento_trabajador}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Tipo Documento Trabajador"
                  placeholder="Seleccionar tipo"
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
              name="documento_trabajador"
              control={control}
              rules={novedadActualizacionDatosTrabajadorValidationRules.documento_trabajador}
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
              name="codigo_eps"
              control={control}
              rules={novedadActualizacionDatosTrabajadorValidationRules.codigo_eps}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Código EPS"
                  placeholder="Seleccionar EPS"
                  options={EPSOptions}
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
              name="codigo_afp"
              control={control}
              rules={novedadActualizacionDatosTrabajadorValidationRules.codigo_afp}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Código AFP"
                  placeholder="Seleccionar AFP"
                  options={AFPOptions}
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
              name="correo_electronico_trabajador"
              control={control}
              rules={novedadActualizacionDatosTrabajadorValidationRules.correo_electronico_trabajador}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Correo Electrónico del Trabajador"
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

            <Controller
              name="fecha_de_nacimiento"
              control={control}
              rules={novedadActualizacionDatosTrabajadorValidationRules.fecha_de_nacimiento}
              render={({ field, fieldState }) => (
                <FormDatePicker
                  label="Fecha de Nacimiento"
                  placeholder="Seleccionar fecha de nacimiento"
                  value={field.value ? new Date(field.value + 'T00:00:00') : undefined}
                  onChange={(date) =>
                    field.onChange(
                      date
                        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                        : ""
                    )
                  }
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  required
                  maxDate={new Date()}
                />
              )}
            />
          </div>

          <div className="col-span-3 my-8">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Información de Residencia</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            <Controller
              name="direccion_de_residencia"
              control={control}
              rules={novedadActualizacionDatosTrabajadorValidationRules.direccion_de_residencia}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Dirección de Residencia"
                  placeholder="Dirección completa"
                  value={field.value}
                  onChange={field.onChange}
                  maxLength={500}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  required
                />
              )}
            />

            <Controller
              name="telefono_de_residencia"
              control={control}
              rules={novedadActualizacionDatosTrabajadorValidationRules.telefono_de_residencia}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Teléfono de Residencia"
                  placeholder="Número de teléfono"
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
              name="departamento_de_residencia"
              control={control}
              rules={novedadActualizacionDatosTrabajadorValidationRules.departamento_de_residencia}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Departamento de Residencia"
                  placeholder="Seleccionar departamento"
                  options={departamentosDaneOptions}
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value)
                    setValue("municipio_de_residencia", "")
                  }}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  required
                />
              )}
            />

            <Controller
              name="municipio_de_residencia"
              control={control}
              rules={novedadActualizacionDatosTrabajadorValidationRules.municipio_de_residencia}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Municipio de Residencia"
                  placeholder={
                    !selectedDepartamento
                      ? "Seleccione un departamento primero"
                      : "Seleccionar municipio"
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
          </div>
        </div>
      </FormWrapper>

      <ListaRegistros />
    </div>
  )
} 