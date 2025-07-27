"use client"

import { useForm, Controller } from "react-hook-form"
import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { FormInput } from "@/lib/components/core/form/form-input"
import { FormSelect } from "@/lib/components/core/form/form-select"
import { FormDatePicker } from "@/lib/components/core/form/form-datepicker"
import { FormWrapper } from "@/lib/components/core/form/form-wrapper"
import { useCatalogStore } from "@/lib/components/core/stores/catalog-store"
import { useRegistroStore } from "../stores/registro-store"
import { ListaRegistros } from "./lista-registros"
import { 
  arlValidationRules, 
  sanitizeFormData, 
  MIN_DATE_AFILIATION, 
  MINIMUM_WAGE, 
  getMaxDateCoverage 
} from "../validations/validation-rules"
import { toast } from "@/lib/utils/toast"
import { useDebouncedCallback } from "@/lib/components/core/hooks/use-debounced-callback"
import type { Registro, ARLFormData } from "../types/arl-registration"
import { ARLMassiveUpload } from "./massive-upload"

const initialDefaultValues: ARLFormData = {
  tipoDocPersona: "",
  numeDocPersona: "",
  apellido1: "",
  apellido2: "",
  nombre1: "",
  nombre2: "",
  fechaNacimiento: "",
  sexo: "",
  codigoMuniResidencia: "",
  direccion: "",
  telefono: "",
  codigoEPS: "",
  codigoAFP: "",
  fechaInicioCobertura: "",
  codigoOcupacion: "",
  salario: "",
  codigoActividadEconomica: "",
  tipoDocEmp: "",
  numeDocEmp: "",
  modoTrabajo: "",
}

export function ARLRegistrationForm() {
  const searchParams = useSearchParams()
  const {
    documentTypes,
    genderCodes,
    municipalities,
    epsCodes,
    afpCodes,
    occupations,
    economicActivities,
    workModes,
    loading,
    loadDocumentTypes,
    loadGenderCodes,
    loadMunicipalities,
    loadEpsCodes,
    loadAfpCodes,
    loadOccupations,
    loadEconomicActivities,
    loadWorkModes,
  } = useCatalogStore()

  const {
    agregarRegistro,
    actualizarRegistro,
    registroEditando,
    setRegistroEditando,
  } = useRegistroStore()

  const form = useForm<ARLFormData>({
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: initialDefaultValues,
  })

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = form

  const isEditMode = Boolean(registroEditando)

  // Pre-llenar campos del empleador desde query params
  useEffect(() => {
    const typeDoc = searchParams.get("typeDoc")
    const numeroDoc = searchParams.get("numeroDoc")
    
    if (typeDoc) {
      setValue("tipoDocEmp", typeDoc)
    }
    if (numeroDoc) {
      setValue("numeDocEmp", numeroDoc)
    }
  }, [searchParams, setValue])

  useEffect(() => {
    loadDocumentTypes()
    loadGenderCodes()
    loadMunicipalities()
    loadEpsCodes()
    loadAfpCodes()
    loadOccupations()
    loadEconomicActivities()
    loadWorkModes()
  }, [
    loadDocumentTypes,
    loadGenderCodes,
    loadMunicipalities,
    loadEpsCodes,
    loadAfpCodes,
    loadOccupations,
    loadEconomicActivities,
    loadWorkModes,
  ])

  useEffect(() => {
    if (registroEditando) {
      form.reset(registroEditando)
    } else {
      form.reset(initialDefaultValues)
    }
  }, [registroEditando, form])

  const debouncedSetSalary = useDebouncedCallback((value: string) => {
    const numericValue = Number.parseInt(value)
    if (isNaN(numericValue) || numericValue < MINIMUM_WAGE) {
      setValue("salario", MINIMUM_WAGE.toString(), {
        shouldValidate: true,
        shouldDirty: true,
      })
    }
  }, 1500)
  
  const documentTypeOptions = (documentTypes || []).map((item) => ({
    value: item.code,
    label: `${item.code} - ${item.name}`,
  }))

  const genderCodeOptions = (genderCodes || []).map((item) => ({
    value: item.code,
    label: `${item.code} - ${item.name}`,
  }))

  const municipalityOptions = (municipalities || []).map((item) => ({
    value: item.code,
    label: `${item.code} - ${item.name}${item.department ? `, ${item.department}` : ""}`,
  }))

  const epsCodeOptions = (epsCodes || []).map((item) => ({
    value: item.code,
    label: `${item.code} - ${item.name}`,
  }))

  const afpCodeOptions = (afpCodes || []).map((item) => ({
    value: item.code,
    label: `${item.code} - ${item.name}`,
  }))

  const occupationOptions = (occupations || []).map((item) => ({
    value: item.code,
    label: `${item.code} - ${item.name}`,
  }))

  const economicActivityOptions = (economicActivities || []).map((item) => ({
    value: item.code,
    label: `${item.code} - ${item.name.substring(0, 60)}...`,
  }))

  const workModeOptions = (workModes || []).map((item) => ({
    value: item.code,
    label: `${item.code} - ${item.name}`,
  }))

  const onValidSubmit = async (data: ARLFormData) => {
    try {
      const sanitizedData = sanitizeFormData(data);
      const correo = searchParams.get("correo")
      const telefono = searchParams.get("telefono")

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
          emailCreadorRegistro: correo || undefined,
          telefonoCreadorRegistro: telefono || undefined,
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
        title="Formulario de Afiliación ARL"
        onSubmit={handleSubmit(onValidSubmit, onInvalidSubmit)}
        onClear={handleClear}
        isSubmitting={isSubmitting}
        isEditing={isEditMode}
        form={form}
        showMassiveUpload={true}
        massiveUploadComponent={<ARLMassiveUpload />}
      >
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-8">Información Personal</h3>
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            <Controller
              name="tipoDocPersona"
              control={control}
              rules={arlValidationRules.tipoDocPersona}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Tipo Documento"
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
              name="numeDocPersona"
              control={control}
              rules={arlValidationRules.numeDocPersona}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Número Documento"
                  placeholder="Ingrese número de documento"
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
              name="apellido1"
              control={control}
              rules={arlValidationRules.apellido1}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Primer Apellido"
                  placeholder="Primer apellido"
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

            <Controller
              name="apellido2"
              control={control}
              rules={arlValidationRules.apellido2}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Segundo Apellido"
                  placeholder="Segundo apellido (opcional)"
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
              name="nombre1"
              control={control}
              rules={arlValidationRules.nombre1}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Primer Nombre"
                  placeholder="Primer nombre"
                  maxLength={50}
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
              name="nombre2"
              control={control}
              rules={arlValidationRules.nombre2}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Segundo Nombre"
                  placeholder="Segundo nombre (opcional)"
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
              name="fechaNacimiento"
              control={control}
              rules={arlValidationRules.fechaNacimiento}
              render={({ field, fieldState }) => (
                <FormDatePicker
                  label="Fecha de Nacimiento"
                  placeholder="Selecciona fecha de nacimiento"
                  value={field.value ? new Date(field.value) : undefined}
                  onChange={(date) => field.onChange(date ? date.toISOString().split("T")[0] : "")}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  required
                  maxDate={new Date()}
                />
              )}
            />

            <Controller
              name="sexo"
              control={control}
              rules={arlValidationRules.sexo}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Sexo"
                  placeholder={loading.genderCodes ? "Cargando..." : "Seleccionar sexo"}
                  options={genderCodeOptions}
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
          </div>

          <div className="col-span-3 my-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Contacto y Afiliación</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">

            <Controller
              name="codigoMuniResidencia"
              control={control}
              rules={arlValidationRules.codigoMuniResidencia}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Municipio de Residencia"
                  placeholder={loading.municipalities ? "Cargando..." : "Seleccionar municipio"}
                  options={municipalityOptions}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  required
                  disabled={loading.municipalities}
                />
              )}
            />

            <Controller
              name="direccion"
              control={control}
              rules={arlValidationRules.direccion}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Dirección"
                  placeholder="Dirección completa"
                  value={field.value}
                  maxLength={100}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  required
                />
              )}
            />

            <Controller
              name="telefono"
              control={control}
              rules={arlValidationRules.telefono}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Teléfono"
                  maxLength={10}
                  placeholder="Número de teléfono (ej: 3201234567 o 8605252)"
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
              rules={arlValidationRules.codigoEPS}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="EPS"
                  placeholder={loading.epsCodes ? "Cargando..." : "Seleccionar EPS"}
                  options={epsCodeOptions}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  required
                  disabled={loading.epsCodes}
                />
              )}
            />

            <Controller
              name="codigoAFP"
              control={control}
              rules={arlValidationRules.codigoAFP}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="AFP"
                  placeholder={loading.afpCodes ? "Cargando..." : "Seleccionar AFP"}
                  options={afpCodeOptions}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  required
                  disabled={loading.afpCodes}
                />
              )}
            />

            <Controller
              name="fechaInicioCobertura"
              control={control}
              rules={arlValidationRules.fechaInicioCobertura}
              render={({ field, fieldState }) => (
                <FormDatePicker
                  label="Fecha Inicio Cobertura"
                  placeholder="Selecciona fecha de inicio"
                  value={field.value ? new Date(field.value) : undefined}
                  onChange={(date) => field.onChange(date ? date.toISOString().split("T")[0] : "")}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  required
                  minDate={MIN_DATE_AFILIATION}
                  maxDate={getMaxDateCoverage()}
                />
              )}
            />

            <Controller
              name="codigoOcupacion"
              control={control}
              rules={arlValidationRules.codigoOcupacion}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Ocupación"
                  placeholder={loading.occupations ? "Cargando..." : "Seleccionar ocupación"}
                  options={occupationOptions}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  required
                  disabled={loading.occupations}
                />
              )}
            />
            <div className="col-span-1">
              <Controller
                name="salario"
                control={control}
                rules={arlValidationRules.salario}
                render={({ field, fieldState }) => (
                  <FormInput
                    label="Salario (IBC)"
                    type="number"
                    placeholder="Ingrese salario (mínimo 1423500)"
                    value={field.value}
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
              <p className="text-xs mt-2 text-gray-500">Salario mínimo (SMLMV): ${MINIMUM_WAGE.toLocaleString('es-CO')}. Valores inferiores serán corregidos automáticamente.</p>
            </div>
          </div>
        </div>

        <div className="col-span-3 my-8">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Información Laboral</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          <Controller
            name="codigoActividadEconomica"
            control={control}
            rules={arlValidationRules.codigoActividadEconomica}
            render={({ field, fieldState }) => (
              <FormSelect
                label="Actividad Económica"
                placeholder={loading.economicActivities ? "Cargando..." : "Seleccionar actividad"}
                options={economicActivityOptions}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={!!fieldState.error}
                errorMessage={fieldState.error?.message}
                required
                disabled={loading.economicActivities}
              />
            )}
          />

          <Controller
            name="tipoDocEmp"
            control={control}
            rules={arlValidationRules.tipoDocEmp}
            render={({ field, fieldState }) => (
              <FormSelect
                label="Tipo Doc Empleador"
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
            name="numeDocEmp"
            control={control}
            rules={arlValidationRules.numeDocEmp}
            render={({ field, fieldState }) => (
              <FormInput
                label="Número Doc Empleador"
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
            name="modoTrabajo"
            control={control}
            rules={arlValidationRules.modoTrabajo}
            render={({ field, fieldState }) => (
              <FormSelect
                label="Modo de Trabajo"
                placeholder={loading.workModes ? "Cargando..." : "Seleccionar modo"}
                options={workModeOptions}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={!!fieldState.error}
                errorMessage={fieldState.error?.message}
                required
                disabled={loading.workModes}
              />
            )}
          />
        </div>
      </FormWrapper>

      <ListaRegistros />
    </div>
  )
}
