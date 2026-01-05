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
  IndependienteVoluntarioValidationRules, 
  sanitizeFormData,
  convertSalaryToNumber
} from "../validations/validation-rules"
import { MINIMUM_WAGE } from "@/lib/utils/validations"
import { toast } from "@/lib/utils/toast"
import type { Registro, IndependienteVoluntarioFormData } from "../types/independiente-types"
import { IndependienteVoluntarioMassiveUpload } from "./massive-upload"
import { 
  departamentosDaneOptions,
  getMunicipiosDaneOptionsByDepartamento,
} from "@/lib/components/independiente-con-contrato/options/index"
import { useDebouncedCallback } from "../../core/hooks/use-debounced-callback"

const initialDefaultValues: IndependienteVoluntarioFormData = {
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
  codigoEPS: "",
  codigoAFP: "",
  ingresoBaseCotizacion: "",
  codigoOcupacion: "",
  fechaCobertura: "",
  tipoDocConyugeResponsable: "",
  numeDocConyugeResponsable: "",
  nombre1ConyugeResponsable: "",
  nombre2ConyugeResponsable: "",
  apellido1ConyugeResponsable: "",
  apellido2ConyugeResponsable: "",
  dptoResidenciaConyugeResponsable: "",
  muniResidenciaConyugeResponsable: "",
  telefonoConyugeResponsable: "",
}

export function IndependienteVoluntarioForm() {
  const {
    occupationsDecreto,
    documentTypes,
    epsCodes,
    genderCodes,
    afpCodes,
    loading,
    loadOccupationsDecreto,
    loadDocumentTypes,
    loadEpsCodes,
    loadGenderCodes,
    loadAfpCodes
  } = useCatalogStore()

  const {
    agregarRegistro,
    actualizarRegistro,
    registroEditando,
    setRegistroEditando,
  } = useRegistroStore()

  useEffect(() => {
    loadOccupationsDecreto()
    loadDocumentTypes()
    loadEpsCodes()
    loadGenderCodes()
    loadAfpCodes()
  }, [loadOccupationsDecreto, loadDocumentTypes, loadEpsCodes, loadGenderCodes, loadAfpCodes])

  const form = useForm<IndependienteVoluntarioFormData>({
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
  const currentDepartamentoConyugeResponsable = watch("dptoResidenciaConyugeResponsable");

  const [selectedDepartamento, setSelectedDepartamento] = useState<string | undefined>(undefined);
  const [selectedDepartamentoConyuge, setSelectedDepartamentoConyuge] = useState<string | undefined>(undefined);
  
  const isEditMode = Boolean(registroEditando)

  useEffect(() => {
    if (registroEditando) {
      // Convertir el registro de vuelta al formato del formulario
      const formData = {
        ...registroEditando,
        ingresoBaseCotizacion: registroEditando.ingresoBaseCotizacion.toString()
      }
      reset(formData); 
    } else {
      reset(initialDefaultValues); 
    }
  }, [registroEditando, reset]);

  useEffect(() => {
    setSelectedDepartamento(currentDepartamentoResidencia);
  }, [currentDepartamentoResidencia]);

  useEffect(() => {
    setSelectedDepartamentoConyuge(currentDepartamentoConyugeResponsable);
  }, [currentDepartamentoConyugeResponsable]);  

  const debouncedSetSalary = useDebouncedCallback((value: string) => {
    const numericValue = Number.parseInt(value)
    if (isNaN(numericValue) || numericValue < MINIMUM_WAGE) {
      setValue("ingresoBaseCotizacion", MINIMUM_WAGE.toString(), {
        shouldValidate: true,
        shouldDirty: true,
      })
    }
  }, 1500)
  
  const genderOptions = genderCodes.map((item) => ({
    value: item.code,
    label: item.name,
  }))

  const afpOptions = afpCodes.map((item) => ({
    value: item.code,
    label: `${item.code} - ${item.name}`,
  }))

  const epsOptions = epsCodes.map((item) => ({
    value: item.code,
    label: `${item.code} - ${item.name}`,
  }))

  const documentTypeOptions = documentTypes.map((item) => ({
    value: item.code,
    label: `${item.code} - ${item.name}`,
  }))

  const occupationDecretoOptions = occupationsDecreto.map((item) => ({
    value: item.code,
    label: `${item.code} - ${item.name}`,
  }))

  const onValidSubmit = async (data: IndependienteVoluntarioFormData) => {
    try {
      const sanitizedData = sanitizeFormData(data);
      
      // Convertir el ingreso base de cotización a número
      const ingresoBaseNumerico = convertSalaryToNumber(sanitizedData.ingresoBaseCotizacion || "");

      if (isEditMode && registroEditando) {
        const registroActualizado: Registro = {
          ...registroEditando,
          ...(sanitizedData as Omit<Registro, "id" | "ingresoBaseCotizacion">),
          ingresoBaseCotizacion: ingresoBaseNumerico,
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
          ...(sanitizedData as Omit<Registro, "id" | "ingresoBaseCotizacion">),
          ingresoBaseCotizacion: ingresoBaseNumerico,
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
        title="Formulario de Independiente Voluntario"
        onSubmit={handleSubmit(onValidSubmit, onInvalidSubmit)}
        onClear={handleClear}
        isSubmitting={isSubmitting}
        isEditing={isEditMode}
        form={form}
        showMassiveUpload={true}
        massiveUploadComponent={<IndependienteVoluntarioMassiveUpload />}
      >
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-8">Información del Trabajador</h3>
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            <Controller
              name="tipoDocTrabajador"
              control={control}
              rules={IndependienteVoluntarioValidationRules.tipoDocTrabajador}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Tipo Documento Trabajador"
                  placeholder="Seleccionar tipo"
                  options={documentTypeOptions.filter((i) => i.value !== 'NI')}
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
              rules={IndependienteVoluntarioValidationRules.numeDocTrabajador}
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
              rules={IndependienteVoluntarioValidationRules.nombre1Trabajador}
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
              rules={IndependienteVoluntarioValidationRules.nombre2Trabajador}
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
              rules={IndependienteVoluntarioValidationRules.apellido1Trabajador}
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
              rules={IndependienteVoluntarioValidationRules.apellido2Trabajador}
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
              rules={IndependienteVoluntarioValidationRules.fechaNacimientoTrabajador}
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
              rules={IndependienteVoluntarioValidationRules.sexoTrabajador}
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
              rules={IndependienteVoluntarioValidationRules.emailTrabajador}
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
              rules={IndependienteVoluntarioValidationRules.codigoDaneDptoResidencia}
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
              rules={IndependienteVoluntarioValidationRules.codigoDaneMuniResidencia}
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
              rules={IndependienteVoluntarioValidationRules.direccionResidencia}
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
              rules={IndependienteVoluntarioValidationRules.telefonoTrabajador}
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
              name="codigoEPS"
              control={control}
              rules={IndependienteVoluntarioValidationRules.codigoEPS}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="NIT EPS"
                  placeholder="Seleccionar Código EPS"
                  options={epsOptions}
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
              rules={IndependienteVoluntarioValidationRules.codigoAFP}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Código AFP"
                  placeholder="Seleccionar Código AFP"
                  options={afpOptions}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  required
                />
              )}
            />

            <div className="col-span-1">
              <Controller
                name="ingresoBaseCotizacion"
                control={control}
                rules={IndependienteVoluntarioValidationRules.ingresoBaseCotizacion}
                render={({ field, fieldState }) => (
                  <FormInput
                    label="Ingreso Base de Cotización"
                    type="number"
                    placeholder="Ingreso en pesos"
                    value={field.value || ""}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      debouncedSetSalary(e.target.value);
                    }}
                    onBlur={field.onBlur}
                    error={!!fieldState.error}
                    errorMessage={fieldState.error?.message}
                    required
                  />
                )}
              />
              <p className="text-xs mt-1 text-gray-500">Salario mínimo (SMLMV): ${MINIMUM_WAGE.toLocaleString('es-CO')}. Valores inferiores serán corregidos automáticamente.</p>
            </div>

            <Controller
              name="codigoOcupacion"
              control={control}
              rules={IndependienteVoluntarioValidationRules.codigoOcupacion}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Código de Ocupación"
                  placeholder={loading.occupationsDecreto ? "Cargando..." : "Seleccionar ocupación"}
                  options={occupationDecretoOptions}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  required
                  disabled={loading.occupationsDecreto}
                />
              )}
            />

            <Controller
              name="fechaCobertura"
              control={control}
              rules={IndependienteVoluntarioValidationRules.fechaCobertura}
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
          </div>

          <div className="col-span-3 my-8">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Información del Cónyuge/Responsable/Familiar</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            <Controller
              name="tipoDocConyugeResponsable"
              control={control}
              rules={IndependienteVoluntarioValidationRules.tipoDocConyugeResponsable}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Tipo Documento Cónyuge/Responsable/Familiar"
                  placeholder="Seleccionar tipo"
                  options={documentTypeOptions.filter((i) => i.value !== 'NI')}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="numeDocConyugeResponsable"
              control={control}
              rules={IndependienteVoluntarioValidationRules.numeDocConyugeResponsable}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Número Documento Cónyuge/Responsable/Familiar"
                  placeholder="Número documento"
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
              name="nombre1ConyugeResponsable"
              control={control}
              rules={IndependienteVoluntarioValidationRules.nombre1ConyugeResponsable}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Primer Nombre Cónyuge/Responsable/Familiar"
                  placeholder="Primer nombre"
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
              name="nombre2ConyugeResponsable"
              control={control}
              rules={IndependienteVoluntarioValidationRules.nombre2ConyugeResponsable}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Segundo Nombre Cónyuge/Responsable/Familiar"
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
              name="apellido1ConyugeResponsable"
              control={control}
              rules={IndependienteVoluntarioValidationRules.apellido1ConyugeResponsable}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Primer Apellido Cónyuge/Responsable/Familiar"
                  placeholder="Primer apellido"
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
              name="apellido2ConyugeResponsable"
              control={control}
              rules={IndependienteVoluntarioValidationRules.apellido2ConyugeResponsable}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Segundo Apellido Cónyuge/Responsable/Familiar"
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
              name="dptoResidenciaConyugeResponsable"
              control={control}
              rules={IndependienteVoluntarioValidationRules.dptoResidenciaConyugeResponsable}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Departamento Cónyuge/Responsable/Familiar"
                  placeholder="Seleccionar departamento"
                  options={departamentosDaneOptions}
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value)
                    setValue("muniResidenciaConyugeResponsable", "")
                  }}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="muniResidenciaConyugeResponsable"
              control={control}
              rules={IndependienteVoluntarioValidationRules.muniResidenciaConyugeResponsable}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Municipio Cónyuge/Responsable/Familiar"
                  placeholder={
                    !selectedDepartamentoConyuge
                      ? "Seleccione un departamento primero"
                      : "Seleccionar municipio"
                  }
                  options={
                    selectedDepartamentoConyuge
                      ? getMunicipiosDaneOptionsByDepartamento(selectedDepartamentoConyuge)
                      : []
                  }
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  disabled={!selectedDepartamentoConyuge}
                />
              )}
            />

            <Controller
              name="telefonoConyugeResponsable"
              control={control}
              rules={IndependienteVoluntarioValidationRules.telefonoConyugeResponsable}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Teléfono Cónyuge/Responsable/Familiar"
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
        </div>
          
      </FormWrapper>

      <ListaRegistros />
    </div>
  )
}