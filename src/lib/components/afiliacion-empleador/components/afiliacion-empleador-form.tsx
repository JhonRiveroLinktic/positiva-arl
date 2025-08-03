"use client"

import { useForm } from "react-hook-form"
import { useEffect, useState } from "react"
import { FormWrapper } from "@/lib/components/core/form/form-wrapper"
import { useCatalogStore } from "@/lib/components/core/stores/catalog-store"
import { useRegistroStore } from "../stores/registro-store"
import { ListaRegistros } from "./lista-registros"
import { sanitizeFormData } from "../validations/validation-rules"
import { toast } from "@/lib/utils/toast"
import type { RegistroCompleto, AfiliacionEmpleadorFormData } from "../types/afiliacion-empleador-types"

// Importar los componentes existentes
import { DatosEmpleador } from "./forms/datos-empleador-form"
import { DatosRepresentanteLegal } from "./forms/datos-representante-legal-form"
import { DatosSedes } from "./forms/datos-sedes"
import { DatosCentrosTrabajo } from "./forms/datos-centros-trabajo"

const initialDefaultValues: AfiliacionEmpleadorFormData = {
  // Datos del Empleador
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
  
  // Datos del Representante Legal
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
  
  // Arrays para sedes y centros de trabajo
  sedes: [],
  centrosTrabajo: [],
}

export function AfiliacionEmpleadorFormIntegrado() {
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
    formState: { errors, isSubmitting },
  } = form

  const isEditMode = Boolean(registroEditando)

  useEffect(() => {
    if (registroEditando) {
      reset(registroEditando)
    } else {
      reset(initialDefaultValues)
    }
  }, [registroEditando, reset])

  const onValidSubmit = async (data: AfiliacionEmpleadorFormData) => {
    try {
      const sanitizedData = sanitizeFormData(data)

      if (isEditMode && registroEditando) {
        const registroActualizado: RegistroCompleto = {
          ...registroEditando,
          ...(sanitizedData as Omit<RegistroCompleto, "id">),
        }
        actualizarRegistro(registroActualizado)
        setRegistroEditando(null)
        toast.success({
          title: "Registro actualizado",
          description: "El registro se actualizó correctamente.",
        })
      } else {
        const nuevoRegistro: RegistroCompleto = {
          id: Date.now().toString(),
          ...(sanitizedData as Omit<RegistroCompleto, "id">),
          metodoSubida: undefined,
        }
        agregarRegistro(nuevoRegistro)
        toast.success({
          title: "Registro guardado",
          description: "El registro se guardó localmente.",
        })
      }

      form.reset(initialDefaultValues)
    } catch (error) {
      console.error("Error al guardar registro:", error)
      toast.error({
        title: "Error al guardar",
        description: "Ocurrió un error al guardar el registro.",
      })
    }
  }

  const onInvalidSubmit = () => {
    toast.error({
      title: "Error de validación",
      description: "Por favor corrija los errores en el formulario antes de continuar.",
    })
  }

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
        title="Formulario de Afiliación de Empleador"
        onSubmit={handleSubmit(onValidSubmit, onInvalidSubmit)}
        onClear={handleClear}
        isSubmitting={isSubmitting}
        isEditing={isEditMode}
        form={form}
        showMassiveUpload={true}
      >
        {/* SECCIÓN 1: INFORMACIÓN DEL EMPLEADOR */}
        <div className="mb-12">
          <DatosEmpleador
            control={control}
            errors={errors}
            watch={watch}
            setValue={setValue}
          />
        </div>

        {/* SECCIÓN 2: INFORMACIÓN DEL REPRESENTANTE LEGAL */}
        <div className="mb-12">
          <DatosRepresentanteLegal
            control={control}
            errors={errors}
            watch={watch}
            setValue={setValue}
          />
        </div>

        {/* SECCIÓN 3: SEDES DEL EMPLEADOR */}
        <div className="mb-12">
          <DatosSedes
            control={control}
            errors={errors}
            watch={watch}
            setValue={setValue}
          />
        </div>

        {/* SECCIÓN 4: CENTROS DE TRABAJO */}
        <div className="mb-12">
          <DatosCentrosTrabajo
            control={control}
            errors={errors}
            watch={watch}
            setValue={setValue}
          />
        </div>
      </FormWrapper>

      {/* LISTA DE REGISTROS */}
      {/* <ListaRegistros /> */}
    </div>
  )
}