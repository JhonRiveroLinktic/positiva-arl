"use client"

import { Controller, Control, FieldErrors, useWatch } from "react-hook-form"
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
} from "@/lib/components/independiente-con-contrato/options"
import { genderCodeOptions } from "@/lib/options/gender-codes"
import type { AfiliacionEmpleadorFormData } from "../../types/afiliacion-empleador-types"
import { countriesOptions } from "@/lib/options/countries"

interface DatosRepresentanteLegalProps {
  control: Control<AfiliacionEmpleadorFormData>
  errors: FieldErrors<AfiliacionEmpleadorFormData["representanteLegal"]>
  watch: (name?: string | string[]) => any
  setValue: (name: any, value: any) => void
}

export function DatosRepresentanteLegal({ control, errors, watch, setValue }: DatosRepresentanteLegalProps) {
  const paisSeleccionado = watch("representanteLegal.pais")
  const currentDepartamento = useWatch({ control, name: "representanteLegal.departamento" })
  const [selectedDepartamento, setSelectedDepartamento] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (currentDepartamento && !selectedDepartamento) {
      setSelectedDepartamento(currentDepartamento)
    }
    else if (currentDepartamento && currentDepartamento !== selectedDepartamento && selectedDepartamento) {
      setValue("representanteLegal.municipio", "")
      setSelectedDepartamento(currentDepartamento)
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

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
        Información del Representante Legal
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-start">
        <Controller
          name="representanteLegal.tipoDoc"
          control={control}
          rules={RepresentanteLegalValidationRules.tipoDoc}
          render={({ field, fieldState }) => (
            <FormSelect
              label="Tipo de Documento"
              placeholder="Seleccionar tipo"
              options={DocumentTypesOptions.filter((i) => i.value !== 'N')}
              value={field.value || ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={!!fieldState.error}
              errorMessage={fieldState.error?.message}
              required
            />
          )}
        />

        <Controller
          name="representanteLegal.documento"
          control={control}
          rules={RepresentanteLegalValidationRules.documento}
          render={({ field, fieldState }) => (
            <FormInput
              label="Número de Documento"
              placeholder="Número de documento"
              value={field.value || ""}
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
          name="representanteLegal.primerApellido"
          control={control}
          rules={RepresentanteLegalValidationRules.primerApellido}
          render={({ field, fieldState }) => (
            <FormInput
              label="Primer Apellido"
              placeholder="Primer apellido"
              value={field.value || ""}
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
          name="representanteLegal.segundoApellido"
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
          name="representanteLegal.primerNombre"
          control={control}
          rules={RepresentanteLegalValidationRules.primerNombre}
          render={({ field, fieldState }) => (
            <FormInput
              label="Primer Nombre"
              placeholder="Primer nombre"
              value={field.value || ""}
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
          name="representanteLegal.segundoNombre"
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
          name="representanteLegal.fechaNacimiento"
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
          name="representanteLegal.sexo"
          control={control}
          rules={RepresentanteLegalValidationRules.sexo}
          render={({ field, fieldState }) => (
            <FormSelect
              label="Sexo"
              placeholder="Seleccionar sexo"
              options={genderOptions}
              value={field.value || ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={!!fieldState.error}
              errorMessage={fieldState.error?.message}
              required
            />
          )}
        />

        <Controller
          name="representanteLegal.pais"
          control={control}
          rules={RepresentanteLegalValidationRules.pais}
          render={({ field, fieldState }) => (
            <FormSelect
              label="País"
              placeholder="Seleccionar país"
              options={countriesOptions}
              value={field.value || ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={!!fieldState.error}
              errorMessage={fieldState.error?.message}
            />
          )}
        />
        {paisSeleccionado === "CO" && (
          <>
            <Controller
              name="representanteLegal.departamento"
              control={control}
              rules={RepresentanteLegalValidationRules.departamento}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Departamento"
                  placeholder="Seleccionar departamento"
                  options={departamentosDaneOptions}
                  value={field.value || ""}
                  onChange={(value) => {
                    field.onChange(value)
                    setValue("representanteLegal.municipio", "")
                  }}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  required
                />
              )}
            />

            <Controller
              name="representanteLegal.municipio"
              control={control}
              rules={RepresentanteLegalValidationRules.municipio}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="Municipio"
                  placeholder={
                    !currentDepartamento
                      ? "Seleccione un departamento primero"
                      : "Seleccionar municipio"
                  }
                  options={
                    currentDepartamento
                      ? getMunicipiosDaneOptionsByDepartamento(currentDepartamento)
                      : []
                  }
                  value={field.value || ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  required
                  disabled={!currentDepartamento}
                />
              )}
            />
          </>
        )}

        <Controller
          name="representanteLegal.zona"
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
          name="representanteLegal.direccion"
          control={control}
          rules={RepresentanteLegalValidationRules.direccion}
          render={({ field, fieldState }) => (
            <FormInput
              label="Dirección"
              placeholder="Dirección completa"
              value={field.value || ""}
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
          name="representanteLegal.telefono"
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
          name="representanteLegal.fax"
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
          name="representanteLegal.correoElectronico"
          control={control}
          rules={RepresentanteLegalValidationRules.correoElectronico}
          render={({ field, fieldState }) => (
            <FormInput
              label="Correo Electrónico"
              type="email"
              placeholder="correo@ejemplo.com"
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
          name="representanteLegal.nitAfp"
          control={control}
          rules={RepresentanteLegalValidationRules.nitAfp}
          render={({ field, fieldState }) => (
            <FormSelect
              label="Nit AFP"
              placeholder="Seleccionar AFP"
              options={PensionFundOptions}
              value={field.value || ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={!!fieldState.error}
              errorMessage={fieldState.error?.message}
              required
            />
          )}
        />

        <Controller
          name="representanteLegal.nitEps"
          control={control}
          rules={RepresentanteLegalValidationRules.nitEps}
          render={({ field, fieldState }) => (
            <FormSelect
              label="Nit EPS"
              placeholder="Seleccionar EPS"
              options={EPSOptions}
              value={field.value || ""}
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