"use client"

import { useForm, Controller } from "react-hook-form"
import { FormWrapper } from "@/lib/components/core/form/form-wrapper"
import { FormInput } from "@/lib/components/core/form/form-input"
import { FormSelect } from "@/lib/components/core/form/form-select"
import { FormDatePicker } from "@/lib/components/core/form/form-datepicker"
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/ui/card"
import { Badge } from "@/lib/components/ui/badge"
import { useCatalogStore } from "@/lib/components/core/stores/catalog-store"
import { useRegistroStore } from "../stores/registro-store"
import { prorrogaFechaContratoTrabajadorIndependienteValidationRules } from "../validations/validation-rules"
import { convertToSupabaseFormat } from "../types/prorroga-fecha-contrato-types"
import type { ProrrogaFechaContratoTrabajadorIndependienteFormData } from "../types/prorroga-fecha-contrato-types"
import { toast } from "@/lib/utils/toast"

const initialDefaultValues: ProrrogaFechaContratoTrabajadorIndependienteFormData = {
  tipo_doc_contratante: "",
  documento_contratante: "",
  razon_social: "",
  codigo_subempresa: "",
  tipo_doc_trabajador: "",
  documento_trabajador: "",
  fecha_inicio_contrato_original: "",
  fecha_fin_contrato_anterior: "",
  fecha_fin_contrato_nueva: "",
  valor_contrato_prorroga: "",
  correo_electronico: ""
}

export function ProrrogaFechaContratoTrabajadorIndependienteForm() {
  const { agregarRegistro } = useRegistroStore()
  const { documentTypes } = useCatalogStore()

  const form = useForm<ProrrogaFechaContratoTrabajadorIndependienteFormData>({
    defaultValues: initialDefaultValues,
  })

  const { control, handleSubmit, reset, formState: { errors } } = form

  const onSubmit = (data: ProrrogaFechaContratoTrabajadorIndependienteFormData) => {
    try {
      const registro = convertToSupabaseFormat({
        ...data,
        id: `prorroga-${Date.now()}`,
        metodo_subida: "manual"
      })

      agregarRegistro(registro)
      reset()
      toast.success({
        title: "Registro agregado",
        description: "El registro se ha guardado correctamente.",
      })
    } catch (error) {
      console.error("Error al guardar:", error)
      toast.error({
        title: "Error",
        description: "Hubo un error al guardar el registro.",
      })
    }
  }

  const onClear = () => {
    reset()
  }

  return (
    <FormWrapper
      form={form}
      onSubmit={onSubmit}
      onClear={onClear}
      title="Prórroga de Fecha de Contrato - Trabajador Independiente"
      description="Complete los datos para registrar la prórroga de fecha de contrato"
    >
      <div className="space-y-6">
        {/* Información del Contratante */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary">1</Badge>
              Información del Contratante
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="tipo_doc_contratante"
                control={control}
                rules={prorrogaFechaContratoTrabajadorIndependienteValidationRules.tipo_doc_contratante}
                render={({ field, fieldState }) => (
                  <FormSelect
                    label="Tipo de Documento del Contratante"
                    placeholder="Seleccione tipo de documento"
                    options={documentTypes}
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
                name="documento_contratante"
                control={control}
                rules={prorrogaFechaContratoTrabajadorIndependienteValidationRules.documento_contratante}
                render={({ field, fieldState }) => (
                  <FormInput
                    label="Número de Documento del Contratante"
                    placeholder="Número de documento"
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

            <Controller
              name="razon_social"
              control={control}
              rules={prorrogaFechaContratoTrabajadorIndependienteValidationRules.razon_social}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Razón Social"
                  placeholder="Nombre o razón social del contratante"
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
              name="codigo_subempresa"
              control={control}
              rules={prorrogaFechaContratoTrabajadorIndependienteValidationRules.codigo_subempresa}
              render={({ field, fieldState }) => (
                <FormInput
                  label="Código de Subempresa"
                  placeholder="Código de subempresa (solo para NIT 899999061)"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                />
              )}
            />
          </CardContent>
        </Card>

        {/* Información del Trabajador */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary">2</Badge>
              Información del Trabajador
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="tipo_doc_trabajador"
                control={control}
                rules={prorrogaFechaContratoTrabajadorIndependienteValidationRules.tipo_doc_trabajador}
                render={({ field, fieldState }) => (
                  <FormSelect
                    label="Tipo de Documento del Trabajador"
                    placeholder="Seleccione tipo de documento"
                    options={documentTypes}
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
                name="documento_trabajador"
                control={control}
                rules={prorrogaFechaContratoTrabajadorIndependienteValidationRules.documento_trabajador}
                render={({ field, fieldState }) => (
                  <FormInput
                    label="Número de Documento del Trabajador"
                    placeholder="Número de documento"
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
          </CardContent>
        </Card>

        {/* Información del Contrato */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="secondary">3</Badge>
              Información del Contrato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Controller
                name="fecha_inicio_contrato_original"
                control={control}
                rules={prorrogaFechaContratoTrabajadorIndependienteValidationRules.fecha_inicio_contrato_original}
                render={({ field, fieldState }) => (
                  <FormDatePicker
                    label="Fecha de Inicio del Contrato Original"
                    placeholder="Seleccione fecha"
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
                name="fecha_fin_contrato_anterior"
                control={control}
                rules={prorrogaFechaContratoTrabajadorIndependienteValidationRules.fecha_fin_contrato_anterior}
                render={({ field, fieldState }) => (
                  <FormDatePicker
                    label="Fecha de Fin del Contrato Anterior"
                    placeholder="Seleccione fecha"
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
                name="fecha_fin_contrato_nueva"
                control={control}
                rules={prorrogaFechaContratoTrabajadorIndependienteValidationRules.fecha_fin_contrato_nueva}
                render={({ field, fieldState }) => (
                  <FormDatePicker
                    label="Nueva Fecha de Fin del Contrato"
                    placeholder="Seleccione fecha"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="valor_contrato_prorroga"
                control={control}
                rules={prorrogaFechaContratoTrabajadorIndependienteValidationRules.valor_contrato_prorroga}
                render={({ field, fieldState }) => (
                  <FormInput
                    label="Valor del Contrato (Prórroga)"
                    placeholder="Valor del contrato"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={!!fieldState.error}
                    errorMessage={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                name="correo_electronico"
                control={control}
                rules={prorrogaFechaContratoTrabajadorIndependienteValidationRules.correo_electronico}
                render={({ field, fieldState }) => (
                  <FormInput
                    label="Correo Electrónico de Notificación"
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
          </CardContent>
        </Card>
      </div>
    </FormWrapper>
  )
} 