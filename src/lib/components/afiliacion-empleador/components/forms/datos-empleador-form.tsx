"use client"

import { Controller, Control, FieldErrors, useWatch } from "react-hook-form"
import { useEffect, useState } from "react"
import { FormInput } from "@/lib/components/core/form/form-input"
import { FormSelect } from "@/lib/components/core/form/form-select"
import { FormDatePicker } from "@/lib/components/core/form/form-datepicker"
import { 
  getMaxDateCoverage,
  EmpleadorDatosValidationRules
} from "../../validations/validation-rules"
import type { AfiliacionEmpleadorFormData } from "../../types/afiliacion-empleador-types"
import { useCatalogStore } from "@/lib/components/core/stores/catalog-store"
import { genderCodeOptions } from "@/lib/options/gender-codes"
import { 
  DocumentTypesOptions,
  departamentosDaneOptions,
  getMunicipiosDaneOptionsByDepartamento,
  EPSOptions,
  PensionFundOptions,
} from "@/lib/components/independiente-con-contrato/options"

interface DatosEmpleadorProps {
  control: Control<AfiliacionEmpleadorFormData>
  errors: FieldErrors<AfiliacionEmpleadorFormData["empleadorDatos"]>
  watch: (name?: string | string[]) => any
  setValue: (name: any, value: any) => void
}

export function DatosEmpleador({ control, errors, watch, setValue }: DatosEmpleadorProps) {
  const {
    occupations,
    economicActivities,
    loading,
  } = useCatalogStore()

  const currentOrigen = useWatch({ control, name: "empleadorDatos.origen" })
  const currentTipoDocEmpleador = useWatch({ control, name: "empleadorDatos.tipoDocEmpleador" })
  const currentDepartamentoEmpleador = useWatch({ control, name: "empleadorDatos.departamentoEmpleador" })
  
  const [selectedDepartamentoEmpleador, setSelectedDepartamentoEmpleador] = useState<string | undefined>(undefined)

  const isTraslado = currentOrigen === "2"
  const isNit = currentTipoDocEmpleador === "N"

  useEffect(() => {
    if (!isTraslado) {
      setValue("empleadorDatos.codigoArl", "")
      setValue("empleadorDatos.nitArlAnterior", "")
      setValue("empleadorDatos.fechaNotificacionTraslado", "")
    }
  }, [isTraslado, setValue])

  useEffect(() => {
    if (!isNit) {
      setValue("empleadorDatos.digitoVerificacionEmpleador", "")
    }
  }, [isNit, setValue])

  useEffect(() => {
    if (currentDepartamentoEmpleador && !selectedDepartamentoEmpleador) {
      setSelectedDepartamentoEmpleador(currentDepartamentoEmpleador)
    }
    else if (currentDepartamentoEmpleador && currentDepartamentoEmpleador !== selectedDepartamentoEmpleador && selectedDepartamentoEmpleador) {
      setValue("empleadorDatos.municipioEmpleador", "")
      setSelectedDepartamentoEmpleador(currentDepartamentoEmpleador)
    }
  }, [currentDepartamentoEmpleador, setValue, selectedDepartamentoEmpleador])

  const genderOptions = genderCodeOptions.map((item) => ({
    value: item.code,
    label: item.name,
  }))

  const tipoContratoOptions = [
    { value: "AD", label: "AD - ADMINISTRATIVO" },
    { value: "CO", label: "CO - COMERCIAL" },
    { value: "CI", label: "CI - CIVIL" },
  ]

  const economicActivityOptions = (economicActivities || []).map((item) => ({
    value: item.code,
    label: `${item.code} - ${item.name.substring(0, 60)}...`,
  }))

  const occupationOptions = (occupations || []).map((item) => ({
    value: item.code,
    label: `${item.code} - ${item.name}`,
  }))

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
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-start">
        <Controller
          name="empleadorDatos.tipoDocEmpleador"
          control={control}
          rules={EmpleadorDatosValidationRules.tipoDocEmpleador}
          render={({ field, fieldState }) => (
            <FormSelect
              label="Tipo Documento Empleador"
              placeholder="Seleccionar tipo"
              options={DocumentTypesOptions}
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
          name="empleadorDatos.documentoEmpleador"
          control={control}
          rules={EmpleadorDatosValidationRules.documentoEmpleador}
          render={({ field, fieldState }) => (
            <FormInput
              label="Documento Empleador"
              placeholder="Número documento empleador"
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

        {isNit && (
          <Controller
            name="empleadorDatos.digitoVerificacionEmpleador"
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
        )}
        
        <Controller
          name="empleadorDatos.razonSocialEmpleador"
          control={control}
          rules={EmpleadorDatosValidationRules.razonSocialEmpleador}
          render={({ field, fieldState }) => (
            <FormInput
              label="Razón Social Empleador"
              placeholder="Razón social del empleador"
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
          name="empleadorDatos.departamentoEmpleador"
          control={control}
          rules={EmpleadorDatosValidationRules.departamentoEmpleador}
          render={({ field, fieldState }) => (
            <FormSelect
              label="Departamento Empleador"
              placeholder="Seleccionar departamento"
              options={departamentosDaneOptions}
              value={field.value || ""}
              onChange={(value) => {
                field.onChange(value)
                setValue("empleadorDatos.municipioEmpleador", "")
              }}
              onBlur={field.onBlur}
              error={!!fieldState.error}
              errorMessage={fieldState.error?.message}
              required
            />
          )}
        />

        <Controller
          name="empleadorDatos.municipioEmpleador"
          control={control}
          rules={EmpleadorDatosValidationRules.municipioEmpleador}
          render={({ field, fieldState }) => (
            <FormSelect
              label="Municipio Empleador"
              placeholder={
                !currentDepartamentoEmpleador
                  ? "Seleccione un departamento primero"
                  : "Seleccionar municipio"
              }
              options={getMunicipiosDaneOptionsByDepartamento(currentDepartamentoEmpleador)}
              value={field.value || ""}
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
          name="empleadorDatos.direccionEmpleador"
          control={control}
          rules={EmpleadorDatosValidationRules.direccionEmpleador}
          render={({ field, fieldState }) => (
            <FormInput
              label="Dirección Empleador"
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
          name="empleadorDatos.telefonoEmpleador"
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
          name="empleadorDatos.fax"
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
          name="empleadorDatos.correoElectronico"
          control={control}
          rules={EmpleadorDatosValidationRules.correoElectronico}
          render={({ field, fieldState }) => (
            <FormInput
              label="Correo Electrónico"
              type="email"
              placeholder="correo@ejemplo.com"
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
          name="empleadorDatos.zona"
          control={control}
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
          name="empleadorDatos.actEconomicaPrincipalEmpleador"
          control={control}
          rules={EmpleadorDatosValidationRules.actEconomicaPrincipalEmpleador}
          render={({ field, fieldState }) => (
            <FormSelect
              label="Actividad Económica Principal"
              placeholder="Código actividad económica"
              options={economicActivityOptions}
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
          name="empleadorDatos.suministroDeTransporte"
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
          name="empleadorDatos.fechaRadicacion"
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
          name="empleadorDatos.naturaleza"
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
          name="empleadorDatos.origen"
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
          name="empleadorDatos.fechaCobertura"
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

        {isTraslado && (
          <>
            <Controller
              name="empleadorDatos.codigoArl"
              control={control}
              rules={EmpleadorDatosValidationRules.codigoArl}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="NIT ARL (solo cuando es traslado)"
                  placeholder="NIT ARL anterior"
                  options={PensionFundOptions}
                  value={field.value || ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="empleadorDatos.nitArlAnterior"
              control={control}
              rules={EmpleadorDatosValidationRules.nitArlAnterior}
              render={({ field, fieldState }) => (
                <FormSelect
                  label="NIT EPS Anterior (solo cuando es traslado)"
                  placeholder="NIT EPS anterior"
                  options={EPSOptions}
                  value={field.value || ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="empleadorDatos.fechaNotificacionTraslado"
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
          </>
        )}

        <Controller
          name="empleadorDatos.tipoDocRepresentanteLegal"
          control={control}
          rules={EmpleadorDatosValidationRules.tipoDocRepresentanteLegal}
          render={({ field, fieldState }) => (
            <FormSelect
              label="Tipo de Documento Representante Legal"
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
          name="empleadorDatos.numeDocRepresentanteLegal"
          control={control}
          rules={EmpleadorDatosValidationRules.numeDocRepresentanteLegal}
          render={({ field, fieldState }) => (
            <FormInput
              label="Documento Representante Legal"
              placeholder="Número documento"
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
          name="empleadorDatos.nombreRepresentanteLegal"
          control={control}
          rules={EmpleadorDatosValidationRules.nombreRepresentanteLegal}
          render={({ field, fieldState }) => (
            <FormInput
              label="Nombre Representante Legal"
              placeholder="Nombre completo"
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
      </div>
    </div>
  )
}