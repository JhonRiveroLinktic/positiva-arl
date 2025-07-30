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
  IndependienteConContratoValidationRules, 
  sanitizeFormData
} from "../validations/validation-rules"
import { toast } from "@/lib/utils/toast"
import type { Registro, IndependienteConContratoFormData } from "../types/independiente-types"
import { IndependienteConContratoMassiveUpload } from "./massive-upload"
import { genderCodeOptions } from "@/lib/options/gender-codes"
import { 
  DocumentTypesOptions,
  departamentosDaneOptions,
  getMunicipiosDaneOptionsByDepartamento,
  EPSOptions,
  PensionFundOptions,
} from "../options"
import { SubEmpresaOptions } from "@/lib/options/codigo-subempresa"

const initialDefaultValues: IndependienteConContratoFormData = {
  tipoDocTrabajador: "",
  numeDocTrabajador: "",
  apellido1Trabajador: "",
  apellido2Trabajador: "",
  nombre1Trabajador: "",
  nombre2Trabajador: "",
  fechaNacimientoTrabajador: "",
  sexoTrabajador: "",
  emailTrabajador: "",
  codigoDaneDptoResidencia: "",
  codigoDaneMuniResidencia: "",
  direccionResidencia: "",
  telefonoTrabajador: "",
  cargoOcupacion: "",
  codigoEPS: "",
  codigoAFP: "",
  tipoContrato: "",
  naturalezaContrato: "",
  suministraTransporte: "",
  fechaInicioContrato: "",
  fechaFinContrato: "",
  valorTotalContrato: "",
  codigoActividadEjecutar: "",
  departamentoLabor: "",
  ciudadLabor: "",
  fechaInicioCobertura: "",
  esAfiliacionTaxista: "",
  tipoDocContratante: "",
  numeDocContratante: "",
  actividadCentroTrabajoContratante: "",
  codigoSubempresa: "",
}

export function IndependienteConContratoForm() {
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

  const form = useForm<IndependienteConContratoFormData>({
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

  const currentDepartamentoResidencia = watch("codigoDaneDptoResidencia");
  const currentDepartamentoLabor = watch("departamentoLabor");

  const [selectedDepartamento, setSelectedDepartamento] = useState<string | undefined>(undefined);
  const [selectedDepartamentoWork, setSelectedDepartamentoWork] = useState<string | undefined>(undefined);
  
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

  useEffect(() => {
    setSelectedDepartamentoWork(currentDepartamentoLabor);
  }, [currentDepartamentoLabor]);

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

  const onValidSubmit = async (data: IndependienteConContratoFormData) => {
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
      setSelectedDepartamento(undefined);
      setSelectedDepartamentoWork(undefined);
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
    setSelectedDepartamentoWork(undefined);
    toast.info({
      title: "Formulario limpiado",
      description: "Todos los campos han sido limpiados.",
    })
  }

  return (
    <div className="space-y-8 w-full">
      <FormWrapper
        title="Formulario de Independiente con Contrato"
        onSubmit={handleSubmit(onValidSubmit, onInvalidSubmit)}
        onClear={handleClear}
        isSubmitting={isSubmitting}
        isEditing={isEditMode}
        form={form}
        showMassiveUpload={true}
        massiveUploadComponent={<IndependienteConContratoMassiveUpload />}
        >
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-8">Información del Trabajador</h3>
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            <Controller
              name="tipoDocTrabajador"
              control={control}
              rules={IndependienteConContratoValidationRules.tipoDocTrabajador}
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
              name="numeDocTrabajador"
              control={control}
              rules={IndependienteConContratoValidationRules.numeDocTrabajador}
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
              name="nombre1Trabajador"
              control={control}
              rules={IndependienteConContratoValidationRules.nombre1Trabajador}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Primer Nombre"
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
              name="nombre2Trabajador"
              control={control}
              rules={IndependienteConContratoValidationRules.nombre2Trabajador}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Segundo Nombre"
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
              name="apellido1Trabajador"
              control={control}
              rules={IndependienteConContratoValidationRules.apellido1Trabajador}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Primer Apellido"
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
              name="apellido2Trabajador"
              control={control}
              rules={IndependienteConContratoValidationRules.apellido2Trabajador}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Segundo Apellido"
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
              name="fechaNacimientoTrabajador"
              control={control}
              rules={IndependienteConContratoValidationRules.fechaNacimientoTrabajador}
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

            <Controller
              name="sexoTrabajador"
              control={control}
              rules={IndependienteConContratoValidationRules.sexoTrabajador}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Sexo"
                  placeholder={loading.genderCodes ? "Cargando..." : "Seleccionar sexo"}
                  options={genderOptions}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  required
                  disabled={loading.genderCodes}
                />
              )}
            />

            <Controller
              name="emailTrabajador"
              control={control}
              rules={IndependienteConContratoValidationRules.emailTrabajador}
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
          </div>

          <div className="col-span-3 my-8">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Información de Residencia del Trabajador</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            <Controller
              name="codigoDaneDptoResidencia"
              control={control}
              rules={IndependienteConContratoValidationRules.codigoDaneDptoResidencia}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Código DANE Departamento"
                  placeholder="Seleccionar Código DANE"
                  options={departamentosDaneOptions}
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value)
                    setValue("codigoDaneMuniResidencia", "")
                  }}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  required
                />
              )}
            />

            <Controller
              name="codigoDaneMuniResidencia"
              control={control}
              rules={IndependienteConContratoValidationRules.codigoDaneMuniResidencia}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Código DANE Municipio"
                  placeholder={
                    !selectedDepartamento
                      ? "Seleccione un departamento primero"
                      : "Seleccionar Código DANE"
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
              name="direccionResidencia"
              control={control}
              rules={IndependienteConContratoValidationRules.direccionResidencia}
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
              name="telefonoTrabajador"
              control={control}
              rules={IndependienteConContratoValidationRules.telefonoTrabajador}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Teléfono"
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
          </div>

          <div className="col-span-3 my-8">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Información Laboral del Trabajador</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            <Controller
              name="cargoOcupacion"
              control={control}
              rules={IndependienteConContratoValidationRules.cargoOcupacion}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Cargo/Ocupación"
                  placeholder="Seleccionar Cargo u ocupación"
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

            <Controller
              name="codigoEPS"
              control={control}
              rules={IndependienteConContratoValidationRules.codigoEPS}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="NIT EPS"
                  placeholder="Seleccionar Código EPS"
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
              name="codigoAFP"
              control={control}
              rules={IndependienteConContratoValidationRules.codigoAFP}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="NIT AFP"
                  placeholder="Seleccionar Código AFP"
                  options={PensionFundOptions}
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

          <div className="col-span-3 my-8">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Información del Contrato</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            <Controller
              name="tipoContrato"
              control={control}
              rules={IndependienteConContratoValidationRules.tipoContrato}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Tipo de Contrato"
                  placeholder="Seleccionar Tipo de Contrato"
                  options={tipoContratoOptions}
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
              name="naturalezaContrato"
              control={control}
              rules={IndependienteConContratoValidationRules.naturalezaContrato}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Naturaleza del Contrato"
                  placeholder="Seleccionar naturaleza"
                  options={naturalezaOptions}
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
              name="suministraTransporte"
              control={control}
              rules={IndependienteConContratoValidationRules.suministraTransporte}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Suministra Transporte"
                  placeholder="Seleccionar"
                  options={booleanOptions}
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
              name="fechaInicioContrato"
              control={control}
              rules={IndependienteConContratoValidationRules.fechaInicioContrato}
              render={({ field, fieldState }) => (
                <FormDatePicker
                  label="Fecha de Inicio del Contrato"
                  placeholder="Seleccionar fecha de inicio"
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
                />
              )}
            />

            <Controller
              name="fechaFinContrato"
              control={control}
              rules={IndependienteConContratoValidationRules.fechaFinContrato}
              render={({ field, fieldState }) => (
                <FormDatePicker
                  label="Fecha de Terminación del Contrato"
                  placeholder="Seleccionar fecha de terminación"
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
                />
              )}
            />

            <Controller
              name="valorTotalContrato"
              control={control}
              rules={IndependienteConContratoValidationRules.valorTotalContrato}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Valor Total del Contrato"
                  type="number"
                  placeholder="Valor en pesos"
                  value={field.value || ""}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                  }}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  required
                />
              )}
            />

            <Controller
              name="codigoActividadEjecutar"
              control={control}
              rules={IndependienteConContratoValidationRules.codigoActividadEjecutar}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Código de Actividad a Ejecutar"
                  placeholder="Seleccionar Código de actividad"
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
              name="departamentoLabor"
              control={control}
              rules={IndependienteConContratoValidationRules.departamentoLabor}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Departamento donde Labora"
                  placeholder="Seleccionar Código de actividad"
                  options={departamentosDaneOptions}
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value)
                    setValue("ciudadLabor", "")
                  }}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  required
                />
              )}
            />
            
            <Controller
              name="ciudadLabor"
              control={control}
              rules={IndependienteConContratoValidationRules.ciudadLabor}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Ciudad donde Labora"
                  placeholder={
                    !selectedDepartamentoWork
                      ? "Seleccione un departamento primero"
                      : "Seleccionar Código DANE"
                  }
                  options={
                    selectedDepartamentoWork
                      ? getMunicipiosDaneOptionsByDepartamento(selectedDepartamentoWork)
                      : []
                  }
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  required
                  disabled={!selectedDepartamentoWork}
                />
              )}
            />

            <Controller
              name="fechaInicioCobertura"
              control={control}
              rules={IndependienteConContratoValidationRules.fechaInicioCobertura}
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
                  required
                  maxDate={getMaxDateCoverage()}
                />
              )}
            />

            <Controller
              name="esAfiliacionTaxista"
              control={control}
              rules={IndependienteConContratoValidationRules.esAfiliacionTaxista}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="¿La Afiliación es de Taxista?"
                  placeholder="Seleccionar"
                  options={booleanOptions}
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

          <div className="col-span-3 my-8">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Información del Contratante</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            <Controller
              name="tipoDocContratante"
              control={control}
              rules={IndependienteConContratoValidationRules.tipoDocContratante}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Tipo Documento Contratante"
                  placeholder="Seleccionar tipo"
                  options={DocumentTypesOptions}
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
              name="numeDocContratante"
              control={control}
              rules={IndependienteConContratoValidationRules.numeDocContratante}
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
              name="actividadCentroTrabajoContratante"
              control={control}
              rules={IndependienteConContratoValidationRules.actividadCentroTrabajoContratante}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Actividad Centro de Trabajo del Contratante"
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
              name="codigoSubempresa"
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