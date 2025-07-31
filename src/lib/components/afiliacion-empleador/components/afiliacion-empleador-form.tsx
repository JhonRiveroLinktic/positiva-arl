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
  getMaxDateCoverage,
  AfiliacionEmpleadorValidationRules, 
  sanitizeFormData
} from "../validations/validation-rules"
import { toast } from "@/lib/utils/toast"
import type { Registro, AfiliacionEmpleadorFormData } from "../types/afiliacion-empleador-types"
// import { AfiliacionEmpleadorMassiveUpload } from "./massive-upload"
import { genderCodeOptions } from "@/lib/options/gender-codes"
import { 
  DocumentTypesOptions,
  departamentosDaneOptions,
  getMunicipiosDaneOptionsByDepartamento,
  EPSOptions,
  PensionFundOptions,
} from "../options"
import { SubEmpresaOptions } from "@/lib/options/codigo-subempresa"

const initialDefaultValues: AfiliacionEmpleadorFormData = {
  tipoDocEmpleador: "",
  documentoEmpleador: "",
  digitoVerificacionEmpleador: "",
  razonSocialEmpleador: "",
  departamentoEmpleador: "",
  municipioEmpleador: "",
  direccionEmpleador: "",
  zonaEmpleador: "",
  actEconomicaPrincipalEmpleador: "",
  telefonoEmpleador: "",
  faxEmpleador: "",
  correoElectronicoEmpleador: "",
  suministroDeTransporte: "",
  naturaleza: "",
  fechaRadicacion: "",
  origen: "",
  fechaCobertura: "",
  codigoArl: "",
  tipoDocArlAnterior: "",
  nitArlAnterior: "",
  fechaNotificacionTraslado: "",
  tipoDocRepresentanteLegal: "",
  numeDocRepresentanteLegal: "",
  primerNombreRepresentanteLegal: "",
  segundoNombreRepresentanteLegal: "",
  primerApellidoRepresentanteLegal: "",
  segundoApellidoRepresentanteLegal: "",
  fechaNacimientoRepresentanteLegal: "",
  sexoRepresentanteLegal: "",
  paisRepresentanteLegal: "",
  departamentoRepresentanteLegal: "",
  municipioRepresentanteLegal: "",
  direccionRepresentanteLegal: "",
  telefonoRepresentanteLegal: "",
  correoElectronicoRepresentanteLegal: "",
  nitAfpRepresentanteLegal: "",
  nitEpsRepresentanteLegal: "",
}

export function AfiliacionEmpleadorForm() {
  const {
    occupations,
    economicActivities,
    loading,
  } = useCatalogStore()

  const {
    agregarRegistro,
    actualizarRegistro,
    registroEditando,
    setRegistroEditando,
  } = useRegistroStore()

  const form = useForm<AfiliacionEmpleadorFormData>({
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

  const currentDepartamentoEmpleador = watch("departamentoEmpleador");
  const currentDepartamentoRepresentanteLegal = watch("departamentoRepresentanteLegal");

  const [selectedDepartamentoEmpleador, setSelectedDepartamentoEmpleador] = useState<string | undefined>(undefined);
  const [selectedDepartamentoRepresentanteLegal, setSelectedDepartamentoRepresentanteLegal] = useState<string | undefined>(undefined);
  
  const isEditMode = Boolean(registroEditando)

  useEffect(() => {
    if (registroEditando) {
      reset(registroEditando); 
    } else {
      reset(initialDefaultValues); 
    }
  }, [registroEditando, reset]);

  useEffect(() => {
    setSelectedDepartamentoEmpleador(currentDepartamentoEmpleador);
    if (currentDepartamentoEmpleador !== selectedDepartamentoEmpleador) {
      setValue("municipioEmpleador", "");
    }
  }, [currentDepartamentoEmpleador, setValue, selectedDepartamentoEmpleador]);

  useEffect(() => {
    setSelectedDepartamentoRepresentanteLegal(currentDepartamentoRepresentanteLegal);
    if (currentDepartamentoRepresentanteLegal !== selectedDepartamentoRepresentanteLegal) {
      setValue("municipioRepresentanteLegal", "");
    }
  }, [currentDepartamentoRepresentanteLegal, setValue, selectedDepartamentoRepresentanteLegal]);

  const genderOptions = genderCodeOptions.map((item) => ({
    value: item.code,
    label: item.name,
  }))

  const naturalezaOptions = [
    { value: "PB", label: "PB - PÚBLICO" },
    { value: "PR", label: "PR - PRIVADO" },
  ]

  const tipoContratoOptions = [
    { value: "AD", label: "AD - ADMINISTRATIVO" },
    { value: "CO", label: "CO - COMERCIAL" },
    { value: "CI", label: "CI - CIVIL" },
  ]

  const economicActivityOptions = (economicActivities || []).map((item) => ({
    value: item.code,
    label: `${item.code} - ${item.name.substring(0, 60)}...`,
  }))

  const booleanOptions = [
    { value: "S", label: "SÍ" },
    { value: "N", label: "NO" },
  ]

  const occupationOptions = (occupations || []).map((item) => ({
    value: item.code,
    label: `${item.code} - ${item.name}`,
  }))

  const onValidSubmit = async (data: AfiliacionEmpleadorFormData) => {
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
          metodoSubida: undefined,
        };
        agregarRegistro(nuevoRegistro);
        toast.success({
          title: "Registro guardado",
          description: "El registro se guardó localmente.",
        });
      }

      form.reset(initialDefaultValues);
      setSelectedDepartamentoEmpleador(undefined);
      setSelectedDepartamentoRepresentanteLegal(undefined);
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
    setSelectedDepartamentoEmpleador(undefined);
    setSelectedDepartamentoRepresentanteLegal(undefined);
    toast.info({
      title: "Formulario limpiado",
      description: "Todos los campos han sido limpiados.",
    })
  }

  return (
    <div className="space-y-8 w-full">
      <FormWrapper
        title="Formulario de Afiliación de Empleador"
        onSubmit={handleSubmit(onValidSubmit, onInvalidSubmit)}
        onClear={handleClear}
        isSubmitting={isSubmitting}
        isEditing={isEditMode}
        form={form}
        showMassiveUpload={true}
        // massiveUploadComponent={<AfiliacionEmpleadorMassiveUpload />}
        >
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-8">Información del Empleador</h3>
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            <Controller
              name="tipoDocEmpleador"
              control={control}
              rules={AfiliacionEmpleadorValidationRules.tipoDocEmpleador}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Tipo Documento Empleador"
                  placeholder="Seleccionar tipo"
                  options={DocumentTypesOptions.filter((i: { value: string }) => ["N", "NI"].includes(i.value))}
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
              name="documentoEmpleador"
              control={control}
              rules={AfiliacionEmpleadorValidationRules.documentoEmpleador}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Documento Empleador"
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
              name="digitoVerificacionEmpleador"
              control={control}
              rules={AfiliacionEmpleadorValidationRules.digitoVerificacionEmpleador}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Dígito Verificación"
                  placeholder="Dígito verificación"
                  value={field.value}
                  onChange={field.onChange}
                  maxLength={1}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="razonSocialEmpleador"
              control={control}
              rules={AfiliacionEmpleadorValidationRules.razonSocialEmpleador}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Razón Social Empleador"
                  placeholder="Razón social del empleador"
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
              name="departamentoEmpleador"
              control={control}
              rules={AfiliacionEmpleadorValidationRules.departamentoEmpleador}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Departamento Empleador"
                  placeholder="Seleccionar departamento"
                  options={departamentosDaneOptions}
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
              name="municipioEmpleador"
              control={control}
              rules={AfiliacionEmpleadorValidationRules.municipioEmpleador}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Municipio Empleador"
                  placeholder="Seleccionar municipio"
                  options={getMunicipiosDaneOptionsByDepartamento(currentDepartamentoEmpleador)}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  required
                  disabled={!currentDepartamentoEmpleador}
                />
              )}
            />

            <Controller
              name="direccionEmpleador"
              control={control}
              rules={AfiliacionEmpleadorValidationRules.direccionEmpleador}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Dirección Empleador"
                  placeholder="Dirección completa"
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
              name="zonaEmpleador"
              control={control}
              rules={AfiliacionEmpleadorValidationRules.zonaEmpleador}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Zona Empleador"
                  placeholder="Seleccionar zona"
                  options={[
                    { value: "URBANO", label: "URBANO" },
                    { value: "RURAL", label: "RURAL" }
                  ]}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="actEconomicaPrincipalEmpleador"
              control={control}
              rules={AfiliacionEmpleadorValidationRules.actEconomicaPrincipalEmpleador}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Actividad Económica Principal"
                  placeholder="Código actividad económica"
                  value={field.value}
                  onChange={field.onChange}
                  maxLength={10}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  required
                />
              )}
            />

            <Controller
              name="telefonoEmpleador"
              control={control}
              rules={AfiliacionEmpleadorValidationRules.telefonoEmpleador}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Teléfono Empleador"
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
              name="faxEmpleador"
              control={control}
              rules={AfiliacionEmpleadorValidationRules.faxEmpleador}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Fax Empleador"
                  placeholder="Número de fax"
                  value={field.value}
                  onChange={field.onChange}
                  maxLength={20}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="correoElectronicoEmpleador"
              control={control}
              rules={AfiliacionEmpleadorValidationRules.correoElectronicoEmpleador}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Correo Electrónico Empleador"
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
              name="suministroDeTransporte"
              control={control}
              rules={AfiliacionEmpleadorValidationRules.suministroDeTransporte}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Suministro de Transporte"
                  placeholder="Seleccionar"
                  options={booleanOptions}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="naturaleza"
              control={control}
              rules={AfiliacionEmpleadorValidationRules.naturaleza}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Naturaleza"
                  placeholder="Seleccionar naturaleza"
                  options={[
                    { value: "JURIDICA", label: "JURIDICA" },
                    { value: "PRIVADA", label: "PRIVADA" }
                  ]}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="fechaRadicacion"
              control={control}
              rules={AfiliacionEmpleadorValidationRules.fechaRadicacion}
              render={({ field, fieldState }) => (
                <FormDatePicker
                  label="Fecha de Radicación"
                  placeholder="Seleccionar fecha de radicación"
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

            <Controller
              name="origen"
              control={control}
              rules={AfiliacionEmpleadorValidationRules.origen}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Origen"
                  placeholder="Seleccionar origen"
                  options={[
                    { value: "NUEVA", label: "NUEVA" },
                    { value: "TRASLADO", label: "TRASLADO" }
                  ]}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="fechaCobertura"
              control={control}
              rules={AfiliacionEmpleadorValidationRules.fechaCobertura}
              render={({ field, fieldState }) => (
                <FormDatePicker
                  label="Fecha de Cobertura"
                  placeholder="Seleccionar fecha de cobertura"
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
                  maxDate={getMaxDateCoverage()}
                />
              )}
            />

            <Controller
              name="codigoArl"
              control={control}
              rules={AfiliacionEmpleadorValidationRules.codigoArl}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Código ARL"
                  placeholder="Código ARL"
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
              name="tipoDocArlAnterior"
              control={control}
              rules={AfiliacionEmpleadorValidationRules.tipoDocArlAnterior}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Tipo Documento ARL Anterior"
                  placeholder="Seleccionar tipo"
                  options={DocumentTypesOptions.filter((i: { value: string }) => ["N", "NI"].includes(i.value))}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="nitArlAnterior"
              control={control}
              rules={AfiliacionEmpleadorValidationRules.nitArlAnterior}
              render={({ field, fieldState }) => (
                <FormInput
                  label="NIT ARL Anterior"
                  placeholder="NIT ARL anterior"
                  value={field.value}
                  onChange={field.onChange}
                  maxLength={20}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="fechaNotificacionTraslado"
              control={control}
              rules={AfiliacionEmpleadorValidationRules.fechaNotificacionTraslado}
              render={({ field, fieldState }) => (
                <FormDatePicker
                  label="Fecha Notificación Traslado"
                  placeholder="Seleccionar fecha notificación"
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
                  maxDate={new Date()}
                />
              )}
            />
          </div>

          <div className="col-span-3 my-8">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Información del Representante Legal</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            <Controller
              name="tipoDocRepresentanteLegal"
              control={control}
              rules={AfiliacionEmpleadorValidationRules.tipoDocRepresentanteLegal}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Tipo Documento Representante Legal"
                  placeholder="Seleccionar tipo"
                  options={DocumentTypesOptions.filter((i: { value: string }) => i.value !== 'NI')}
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
              name="numeDocRepresentanteLegal"
              control={control}
              rules={AfiliacionEmpleadorValidationRules.numeDocRepresentanteLegal}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Número Documento Representante Legal"
                  placeholder="Número documento"
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
              name="primerNombreRepresentanteLegal"
              control={control}
              rules={AfiliacionEmpleadorValidationRules.primerNombreRepresentanteLegal}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Primer Nombre Representante Legal"
                  placeholder="Primer nombre"
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
              name="segundoNombreRepresentanteLegal"
              control={control}
              rules={AfiliacionEmpleadorValidationRules.segundoNombreRepresentanteLegal}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Segundo Nombre Representante Legal"
                  placeholder="Segundo nombre (opcional)"
                  value={field.value}
                  onChange={field.onChange}
                  maxLength={100}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="primerApellidoRepresentanteLegal"
              control={control}
              rules={AfiliacionEmpleadorValidationRules.primerApellidoRepresentanteLegal}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Primer Apellido Representante Legal"
                  placeholder="Primer apellido"
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
              name="segundoApellidoRepresentanteLegal"
              control={control}
              rules={AfiliacionEmpleadorValidationRules.segundoApellidoRepresentanteLegal}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Segundo Apellido Representante Legal"
                  placeholder="Segundo apellido (opcional)"
                  value={field.value}
                  onChange={field.onChange}
                  maxLength={100}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="fechaNacimientoRepresentanteLegal"
              control={control}
              rules={AfiliacionEmpleadorValidationRules.fechaNacimientoRepresentanteLegal}
              render={({ field, fieldState }) => (
                <FormDatePicker
                  label="Fecha Nacimiento Representante Legal"
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

            <Controller
              name="sexoRepresentanteLegal"
              control={control}
              rules={AfiliacionEmpleadorValidationRules.sexoRepresentanteLegal}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Sexo Representante Legal"
                  placeholder="Seleccionar sexo"
                  options={genderOptions}
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
              name="paisRepresentanteLegal"
              control={control}
              rules={AfiliacionEmpleadorValidationRules.paisRepresentanteLegal}
              render={({ field, fieldState }) => (
                <FormInput
                  label="País Representante Legal"
                  placeholder="País"
                  value={field.value}
                  onChange={field.onChange}
                  maxLength={50}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="departamentoRepresentanteLegal"
              control={control}
              rules={AfiliacionEmpleadorValidationRules.departamentoRepresentanteLegal}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Departamento Representante Legal"
                  placeholder="Seleccionar departamento"
                  options={departamentosDaneOptions}
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
              name="municipioRepresentanteLegal"
              control={control}
              rules={AfiliacionEmpleadorValidationRules.municipioRepresentanteLegal}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Municipio Representante Legal"
                  placeholder="Seleccionar municipio"
                  options={getMunicipiosDaneOptionsByDepartamento(currentDepartamentoRepresentanteLegal)}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  required
                  disabled={!currentDepartamentoRepresentanteLegal}
                />
              )}
            />

            <Controller
              name="direccionRepresentanteLegal"
              control={control}
              rules={AfiliacionEmpleadorValidationRules.direccionRepresentanteLegal}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Dirección Representante Legal"
                  placeholder="Dirección completa"
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
              name="telefonoRepresentanteLegal"
              control={control}
              rules={AfiliacionEmpleadorValidationRules.telefonoRepresentanteLegal}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Teléfono Representante Legal"
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
              name="correoElectronicoRepresentanteLegal"
              control={control}
              rules={AfiliacionEmpleadorValidationRules.correoElectronicoRepresentanteLegal}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Correo Electrónico Representante Legal"
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
              name="nitAfpRepresentanteLegal"
              control={control}
              rules={AfiliacionEmpleadorValidationRules.nitAfpRepresentanteLegal}
              render={({ field, fieldState }) => (
                <FormInput
                  label="NIT AFP Representante Legal"
                  placeholder="NIT AFP"
                  value={field.value}
                  onChange={field.onChange}
                  maxLength={20}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="nitEpsRepresentanteLegal"
              control={control}
              rules={AfiliacionEmpleadorValidationRules.nitEpsRepresentanteLegal}
              render={({ field, fieldState }) => (
                <FormInput
                  label="NIT EPS Representante Legal"
                  placeholder="NIT EPS"
                  value={field.value}
                  onChange={field.onChange}
                  maxLength={20}
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