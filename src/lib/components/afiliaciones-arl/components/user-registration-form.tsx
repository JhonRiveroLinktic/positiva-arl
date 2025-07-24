"use client"

import { useForm, Controller } from "react-hook-form"
import { FormWrapper } from "@/lib/components/core/form/form-wrapper"
import { FormInput } from "@/lib/components/core/form/form-input"
import { FormSelect } from "@/lib/components/core/form/form-select"
import { FormDatePicker } from "@/lib/components/core/form/form-datepicker"
import { createValidationRules, sanitizeInput, sanitizeEmail, sanitizePhone } from "@/lib/utils/validations"
import { toast } from "@/lib/utils/toast"
import { Upload } from "lucide-react"
import { Button } from "@/lib/components/ui/button"

const documentTypes = [
  { value: "CC", label: "Cédula de Ciudadanía" },
  { value: "TI", label: "Tarjeta de Identidad" },
  { value: "CE", label: "Cédula de Extranjería" },
  { value: "PP", label: "Pasaporte" },
]

const genders = [
  { value: "M", label: "Masculino" },
  { value: "F", label: "Femenino" },
  { value: "O", label: "Otro" },
]

const cities = [
  { value: "BOG", label: "Bogotá" },
  { value: "MED", label: "Medellín" },
  { value: "CAL", label: "Cali" },
  { value: "BAQ", label: "Barranquilla" },
  { value: "CTG", label: "Cartagena" },
]

interface UserFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  documentType: string
  documentNumber: string
  birthDate: Date
  gender: string
  city: string
}

export function UserRegistrationForm() {
  const form = useForm<UserFormData>({
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      documentType: "",
      documentNumber: "",
      birthDate: undefined,
      gender: "",
      city: "",
    },
  })

  const {
    control,
    handleSubmit,
    reset,
    trigger,
    formState: { isSubmitting },
  } = form

  const onSubmit = async (data: UserFormData) => {
    try {
      const isValid = await trigger()

      if (!isValid) {
        toast.warning({
          title: "Formulario incompleto",
          description: "Por favor corrige los errores antes de continuar",
        })
        return
      }

      const sanitizedData = {
        ...data,
        firstName: sanitizeInput(data.firstName),
        lastName: sanitizeInput(data.lastName),
        email: sanitizeEmail(data.email),
        phone: sanitizePhone(data.phone),
        documentNumber: sanitizeInput(data.documentNumber),
      }

      await new Promise((resolve) => setTimeout(resolve, 2000))

      console.log("Datos sanitizados:", sanitizedData)

      toast.success({
        title: "Usuario registrado",
        description: "El usuario ha sido registrado exitosamente",
      })

      reset()
    } catch (error) {
      toast.error({
        title: "Error al registrar",
        description: "Ocurrió un error inesperado. Inténtalo de nuevo.",
      })
    }
  }

  const handleClear = () => {
    reset()
    toast.info("Formulario limpiado")
  }

  const massiveUploadButton = (
    <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
      <Upload className="h-4 w-4" />
      Carga Masiva
    </Button>
  )

  return (
    <FormWrapper
      title="Registro de Usuario"
      form={form}
      onSubmit={handleSubmit(onSubmit)}
      onClear={handleClear}
      isSubmitting={isSubmitting}
      showMassiveUpload={true}
      massiveUploadComponent={massiveUploadButton}
      footerContent={
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
          <strong>Información:</strong> Todos los campos marcados con (*) son obligatorios. Los datos se validan en
          tiempo real y se sanitizan automáticamente por seguridad.
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-6">
        <Controller
          name="firstName"
          control={control}
          rules={createValidationRules.text({
            min: 2,
            max: 50,
            pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
            message: "Solo se permiten letras y espacios",
          })}
          render={({ field, fieldState }) => (
            <FormInput
              label="Nombres"
              placeholder="Ingresa tus nombres"
              required
              error={!!fieldState.error}
              errorMessage={fieldState.error?.message}
              {...field}
            />
          )}
        />

        <Controller
          name="lastName"
          control={control}
          rules={createValidationRules.text({
            min: 2,
            max: 50,
            pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
            message: "Solo se permiten letras y espacios",
          })}
          render={({ field, fieldState }) => (
            <FormInput
              label="Apellidos"
              placeholder="Ingresa tus apellidos"
              required
              error={!!fieldState.error}
              errorMessage={fieldState.error?.message}
              {...field}
            />
          )}
        />

        <Controller
          name="email"
          control={control}
          rules={createValidationRules.email()}
          render={({ field, fieldState }) => (
            <FormInput
              label="Correo Electrónico"
              type="email"
              placeholder="ejemplo@correo.com"
              required
              error={!!fieldState.error}
              errorMessage={fieldState.error?.message}
              {...field}
            />
          )}
        />

        <Controller
          name="phone"
          control={control}
          rules={createValidationRules.phone()}
          render={({ field, fieldState }) => (
            <FormInput
              label="Teléfono"
              type="tel"
              placeholder="3001234567"
              required
              error={!!fieldState.error}
              errorMessage={fieldState.error?.message}
              {...field}
            />
          )}
        />

        <Controller
          name="documentType"
          control={control}
          rules={createValidationRules.select("Selecciona el tipo de documento")}
          render={({ field, fieldState }) => (
            <FormSelect
              label="Tipo de Documento"
              placeholder="Selecciona el tipo"
              options={documentTypes}
              required
              error={!!fieldState.error}
              errorMessage={fieldState.error?.message}
              {...field}
            />
          )}
        />

        <Controller
          name="documentNumber"
          control={control}
          rules={createValidationRules.text({
            min: 6,
            max: 15,
            pattern: /^[0-9]+$/,
            message: "Solo se permiten números",
          })}
          render={({ field, fieldState }) => (
            <FormInput
              label="Número de Documento"
              placeholder="123456789"
              required
              error={!!fieldState.error}
              errorMessage={fieldState.error?.message}
              {...field}
            />
          )}
        />

        <Controller
          name="birthDate"
          control={control}
          rules={createValidationRules.date("Selecciona tu fecha de nacimiento")}
          render={({ field, fieldState }) => (
            <FormDatePicker
              label="Fecha de Nacimiento"
              placeholder="Selecciona tu fecha de nacimiento"
              minDate={new Date("1900-01-01")}
              maxDate={new Date()}
              required
              error={!!fieldState.error}
              errorMessage={fieldState.error?.message}
              {...field}
            />
          )}
        />

        <Controller
          name="gender"
          control={control}
          rules={createValidationRules.select("Selecciona tu género")}
          render={({ field, fieldState }) => (
            <FormSelect
              label="Género"
              placeholder="Selecciona tu género"
              options={genders}
              required
              error={!!fieldState.error}
              errorMessage={fieldState.error?.message}
              {...field}
            />
          )}
        />

        <div className="md:col-span-2">
          <Controller
            name="city"
            control={control}
            rules={createValidationRules.select("Selecciona tu ciudad")}
            render={({ field, fieldState }) => (
              <FormSelect
                label="Ciudad de Residencia"
                placeholder="Selecciona tu ciudad"
                options={cities}
                required
                error={!!fieldState.error}
                errorMessage={fieldState.error?.message}
                {...field}
              />
            )}
          />
        </div>
      </div>
    </FormWrapper>
  )
}