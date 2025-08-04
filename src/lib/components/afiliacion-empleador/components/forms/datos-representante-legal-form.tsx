"use client"

import { Controller, Control, FieldErrors } from "react-hook-form"
import { useEffect, useState } from "react"
import { FormInput } from "@/lib/components/core/form/form-input"
import { FormSelect } from "@/lib/components/core/form/form-select"
import { FormDatePicker } from "@/lib/components/core/form/form-datepicker"
import { RepresentanteLegalValidationRules } from "../../validations/validation-rules"
import { 
  DocumentTypesOptions,
  departamentosDaneOptions,
  getMunicipiosDaneOptionsByDepartamento,
  EPSOptions,
  PensionFundOptions,
} from "../../options"
import { genderCodeOptions } from "@/lib/options/gender-codes"
import type { RepresentanteLegal } from "../../types/afiliacion-empleador-types"

interface DatosRepresentanteLegalProps {
  control: Control<RepresentanteLegal>
  errors: FieldErrors<RepresentanteLegal>
  watch: (name: keyof RepresentanteLegal) => any
  setValue: (name: keyof RepresentanteLegal, value: any) => void
}

export function DatosRepresentanteLegal({ control, errors, watch, setValue }: DatosRepresentanteLegalProps) {
  const currentDepartamento = watch("departamento")
  const [selectedDepartamento, setSelectedDepartamento] = useState<string | undefined>(undefined)

  useEffect(() => {
    setSelectedDepartamento(currentDepartamento)
    if (currentDepartamento !== selectedDepartamento) {
      setValue("municipio", "")
    }
  }, [currentDepartamento, setValue, selectedDepartamento])

  const genderOptions = genderCodeOptions.map((item) => ({
    value: item.code,
    label: `${item.code} - ${item.name}`,
  }))

  const zonaOptions = [
    { value: "U", label: "U - URBANO" },
    { value: "R", label: "R - RURAL" }
  ]

  const paisOptions = [
    { value: "CO", label: "CO - COLOMBIA" },
    { value: "US", label: "US - ESTADOS UNIDOS" },
    { value: "VE", label: "VE - VENEZUELA" },
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
        Información del Representante Legal
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-start">
        <Controller
          name="tipoDoc"
          control={control}
          rules={RepresentanteLegalValidationRules.tipoDoc}
          render={({ field, fieldState }) => (
            <FormSelect
              label="Tipo de Documento"
              placeholder="Seleccionar tipo"
              options={DocumentTypesOptions.filter((i: { value: string }) => 
                ["CC", "TI", "CE", "CD", "PT", "SC"].includes(i.value)
              )}
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
          name="documento"
          control={control}
          rules={RepresentanteLegalValidationRules.documento}
          render={({ field, fieldState }) => (
            <FormInput
              label="Número de Documento"
              placeholder="Número de documento"
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
          name="primerApellido"
          control={control}
          rules={RepresentanteLegalValidationRules.primerApellido}
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
          name="segundoApellido"
          control={control}
          rules={RepresentanteLegalValidationRules.segundoApellido}
          render={({ field, fieldState }) => (
            <FormInput
              label="Segundo Apellido"
              placeholder="Segundo apellido"
              value={field.value || ""}
              onChange={field.onChange}
              maxLength={100}
              onBlur={field.onBlur}
              error={!!fieldState.error}
              errorMessage={fieldState.error?.message}
            />
          )}
        />

        <Controller
          name="primerNombre"
          control={control}
          rules={RepresentanteLegalValidationRules.primerNombre}
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
          name="segundoNombre"
          control={control}
          rules={RepresentanteLegalValidationRules.segundoNombre}
          render={({ field, fieldState }) => (
            <FormInput
              label="Segundo Nombre"
              placeholder="Segundo nombre"
              value={field.value || ""}
              onChange={field.onChange}
              maxLength={100}
              onBlur={field.onBlur}
              error={!!fieldState.error}
              errorMessage={fieldState.error?.message}
            />
          )}
        />

        <Controller
          name="fechaNacimiento"
          control={control}
          rules={RepresentanteLegalValidationRules.fechaNacimiento}
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
          name="sexo"
          control={control}
          rules={RepresentanteLegalValidationRules.sexo}
          render={({ field, fieldState }) => (
            <FormSelect
              label="Sexo"
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
          name="pais"
          control={control}
          rules={RepresentanteLegalValidationRules.pais}
          render={({ field, fieldState }) => (
            <FormSelect
              label="País"
              placeholder="Seleccionar país"
              options={paisOptions}
              value={field.value || ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={!!fieldState.error}
              errorMessage={fieldState.error?.message}
            />
          )}
        />

        <Controller
          name="departamento"
          control={control}
          rules={RepresentanteLegalValidationRules.departamento}
          render={({ field, fieldState }) => (
            <FormSelect
              label="Departamento"
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
          name="municipio"
          control={control}
          rules={RepresentanteLegalValidationRules.municipio}
          render={({ field, fieldState }) => (
            <FormSelect
              label="Municipio"
              placeholder="Seleccionar municipio"
              options={getMunicipiosDaneOptionsByDepartamento(currentDepartamento)}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={!!fieldState.error}
              errorMessage={fieldState.error?.message}
              required
              disabled={!currentDepartamento}
            />
          )}
        />

        <Controller
          name="zona"
          control={control}
          rules={RepresentanteLegalValidationRules.zona}
          render={({ field, fieldState }) => (
            <FormSelect
              label="Zona"
              placeholder="Seleccionar zona"
              options={zonaOptions}
              value={field.value || ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={!!fieldState.error}
              errorMessage={fieldState.error?.message}
            />
          )}
        />

        <Controller
          name="direccion"
          control={control}
          rules={RepresentanteLegalValidationRules.direccion}
          render={({ field, fieldState }) => (
            <FormInput
              label="Dirección"
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
          name="telefono"
          control={control}
          rules={RepresentanteLegalValidationRules.telefono}
          render={({ field, fieldState }) => (
            <FormInput
              label="Teléfono"
              placeholder="Número de teléfono"
              value={field.value || ""}
              onChange={field.onChange}
              maxLength={20}
              onBlur={field.onBlur}
              error={!!fieldState.error}
              errorMessage={fieldState.error?.message}
            />
          )}
        />

        <Controller
          name="fax"
          control={control}
          rules={RepresentanteLegalValidationRules.fax}
          render={({ field, fieldState }) => (
            <FormInput
              label="Fax"
              placeholder="Número de fax"
              value={field.value || ""}
              onChange={field.onChange}
              maxLength={20}
              onBlur={field.onBlur}
              error={!!fieldState.error}
              errorMessage={fieldState.error?.message}
            />
          )}
        />

        <Controller
          name="correoElectronico"
          control={control}
          rules={RepresentanteLegalValidationRules.correoElectronico}
          render={({ field, fieldState }) => (
            <FormInput
              label="Correo Electrónico"
              type="email"
              placeholder="correo@ejemplo.com"
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
          name="nitAfp"
          control={control}
          rules={RepresentanteLegalValidationRules.nitAfp}
          render={({ field, fieldState }) => (
            <FormSelect
              label="Tipo de Documento"
              placeholder="Seleccionar tipo"
              options={DocumentTypesOptions.filter((i: { value: string }) => 
                ["CC", "TI", "CE", "CD", "PT", "SC"].includes(i.value)
              )}
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
          name="nitEps"
          control={control}
          rules={RepresentanteLegalValidationRules.nitEps}
          render={({ field, fieldState }) => (
            <FormSelect
              label="Tipo de Documento"
              placeholder="Seleccionar tipo"
              options={DocumentTypesOptions.filter((i: { value: string }) => 
                ["CC", "TI", "CE", "CD", "PT", "SC"].includes(i.value)
              )}
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
    </div>
  )
}