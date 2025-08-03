"use client"

import { Controller, Control, FieldErrors } from "react-hook-form"
import { useEffect, useState } from "react"
import { FormInput } from "@/lib/components/core/form/form-input"
import { FormSelect } from "@/lib/components/core/form/form-select"
import { FormDatePicker } from "@/lib/components/core/form/form-datepicker"
import { 
  getMaxDateCoverage,
  EmpleadorDatosValidationRules
} from "../../validations/validation-rules"
import { 
  DocumentTypesOptions,
  departamentosDaneOptions,
  getMunicipiosDaneOptionsByDepartamento,
} from "../../options"
import type { EmpleadorDatos } from "../../types/afiliacion-empleador-types"

interface DatosEmpleadorProps {
  control: Control<EmpleadorDatos>
  errors: FieldErrors<EmpleadorDatos>
  watch: (name: keyof EmpleadorDatos) => any
  setValue: (name: keyof EmpleadorDatos, value: any) => void
}

export function DatosEmpleador({ control, errors, watch, setValue }: DatosEmpleadorProps) {
  const currentDepartamentoEmpleador = watch("departamentoEmpleador")
  const [selectedDepartamentoEmpleador, setSelectedDepartamentoEmpleador] = useState<string | undefined>(undefined)

  useEffect(() => {
    setSelectedDepartamentoEmpleador(currentDepartamentoEmpleador)
    if (currentDepartamentoEmpleador !== selectedDepartamentoEmpleador) {
      setValue("municipioEmpleador", "")
    }
  }, [currentDepartamentoEmpleador, setValue, selectedDepartamentoEmpleador])

  const booleanOptions = [
    { value: "S", label: "SÍ" },
    { value: "N", label: "NO" },
  ]

  const naturalezaOptions = [
    { value: "1", label: "1 - PÚBLICA" },
    { value: "2", label: "2 - PRIVADA" },
    { value: "3", label: "3 - MIXTA" },
  ]

  const origenOptions = [
    { value: "1", label: "1 - AFILIACIÓN NUEVA" },
    { value: "2", label: "2 - TRASLADO" },
  ]

  const zonaOptions = [
    { value: "U", label: "U - URBANO" },
    { value: "R", label: "R - RURAL" }
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
        Información del Empleador
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Controller
          name="tipoDocEmpleador"
          control={control}
          rules={EmpleadorDatosValidationRules.tipoDocEmpleador}
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
          rules={EmpleadorDatosValidationRules.documentoEmpleador}
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
          rules={EmpleadorDatosValidationRules.digitoVerificacionEmpleador}
          render={({ field, fieldState }) => (
            <FormInput
              label="Dígito Verificación"
              placeholder="Dígito verificación"
              value={field.value || ""}
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
          rules={EmpleadorDatosValidationRules.razonSocialEmpleador}
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
          rules={EmpleadorDatosValidationRules.departamentoEmpleador}
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
          rules={EmpleadorDatosValidationRules.municipioEmpleador}
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
          rules={EmpleadorDatosValidationRules.direccionEmpleador}
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
          name="telefonoEmpleador"
          control={control}
          rules={EmpleadorDatosValidationRules.telefonoEmpleador}
          render={({ field, fieldState }) => (
            <FormInput
              label="Teléfono Empleador"
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
          rules={EmpleadorDatosValidationRules.fax}
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
          rules={EmpleadorDatosValidationRules.correoElectronico}
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

        <Controller
          name="zona"
          control={control}
          // @ts-expect-error - TODO: fix this
          rules={EmpleadorDatosValidationRules.zona}
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
          name="actEconomicaPrincipalEmpleador"
          control={control}
          rules={EmpleadorDatosValidationRules.actEconomicaPrincipalEmpleador}
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
          name="suministroDeTransporte"
          control={control}
          rules={EmpleadorDatosValidationRules.suministroDeTransporte}
          render={({ field, fieldState }) => (
            <FormSelect
              label="Suministro de Transporte"
              placeholder="Seleccionar"
              options={booleanOptions}
              value={field.value || ""}
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
          rules={EmpleadorDatosValidationRules.fechaRadicacion}
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
          name="naturaleza"
          control={control}
          rules={EmpleadorDatosValidationRules.naturaleza}
          render={({ field, fieldState }) => (
            <FormSelect
              label="Naturaleza"
              placeholder="Seleccionar naturaleza"
              options={naturalezaOptions}
              value={field.value || ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={!!fieldState.error}
              errorMessage={fieldState.error?.message}
            />
          )}
        />

        <Controller
          name="origen"
          control={control}
          rules={EmpleadorDatosValidationRules.origen}
          render={({ field, fieldState }) => (
            <FormSelect
              label="Origen"
              placeholder="Seleccionar origen"
              options={origenOptions}
              value={field.value || ""}
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
          rules={EmpleadorDatosValidationRules.fechaCobertura}
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
          rules={EmpleadorDatosValidationRules.codigoArl}
          render={({ field, fieldState }) => (
            <FormInput
              label="Código ARL"
              placeholder="Código ARL"
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
          name="tipoDocArlAnterior"
          control={control}
          rules={EmpleadorDatosValidationRules.tipoDocArlAnterior}
          render={({ field, fieldState }) => (
            <FormSelect
              label="Tipo Documento ARL Anterior"
              placeholder="Seleccionar tipo"
              options={DocumentTypesOptions.filter((i: { value: string }) => ["N", "NI"].includes(i.value))}
              value={field.value || ""}
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
          rules={EmpleadorDatosValidationRules.nitArlAnterior}
          render={({ field, fieldState }) => (
            <FormInput
              label="NIT ARL Anterior"
              placeholder="NIT ARL anterior"
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
          name="fechaNotificacionTraslado"
          control={control}
          rules={EmpleadorDatosValidationRules.fechaNotificacionTraslado}
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

        {/* Campos del representante legal que van en EmpleadorDatos */}
        <Controller
          name="tipoDocRepresentanteLegal"
          control={control}
          rules={EmpleadorDatosValidationRules.tipoDocRepresentanteLegal}
          render={({ field, fieldState }) => (
            <FormSelect
              label="Tipo Documento Representante Legal"
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
          name="numeDocRepresentanteLegal"
          control={control}
          rules={EmpleadorDatosValidationRules.numeDocRepresentanteLegal}
          render={({ field, fieldState }) => (
            <FormInput
              label="Documento Representante Legal"
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
          name="nombreRepresentanteLegal"
          control={control}
          rules={EmpleadorDatosValidationRules.nombreRepresentanteLegal}
          render={({ field, fieldState }) => (
            <FormInput
              label="Nombre Representante Legal"
              placeholder="Nombre completo"
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
      </div>
    </div>
  )
}