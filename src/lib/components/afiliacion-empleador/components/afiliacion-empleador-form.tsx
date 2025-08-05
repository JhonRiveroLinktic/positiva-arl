"use client"

import { useForm } from "react-hook-form"
import { useEffect } from "react"
import { FormWrapper } from "@/lib/components/core/form/form-wrapper"
import { useRegistroStore } from "../stores/registro-store"
import { ListaRegistros } from "./lista-registros"
import { sanitizeFormData } from "../validations/validation-rules"
import { toast } from "@/lib/utils/toast"
import type { RegistroCompleto, AfiliacionEmpleadorFormData } from "../types/afiliacion-empleador-types"

import { DatosEmpleador } from "./forms/datos-empleador-form"
import { DatosRepresentanteLegal } from "./forms/datos-representante-legal-form"
import { DatosSedes } from "./forms/datos-sedes"
import { DatosCentrosTrabajo } from "./forms/datos-centros-trabajo"

const initialDefaultValues: AfiliacionEmpleadorFormData = {
  empleadorDatos: {
    tipoDocEmpleador: "",
    documentoEmpleador: "",
    digitoVerificacionEmpleador: "",
    razonSocialEmpleador: "",
    departamentoEmpleador: "",
    municipioEmpleador: "",
    direccionEmpleador: "",
    telefonoEmpleador: "",
    fax: "",
    correoElectronico: "",
    zona: "",
    actEconomicaPrincipalEmpleador: "",
    suministroDeTransporte: "",
    fechaRadicacion: "",
    naturaleza: "",
    estado: 1,
    tipoDocRepresentanteLegal: "",
    numeDocRepresentanteLegal: "",
    nombreRepresentanteLegal: "",
    fechaCobertura: "",
    origen: "",
    codigoArl: "",
    tipoDocArlAnterior: "",
    nitArlAnterior: "",
    fechaNotificacionTraslado: "",
    metodoSubida: "",
  },
  representanteLegal: {
    tipoDoc: "",
    documento: "",
    primerApellido: "",
    segundoApellido: "",
    primerNombre: "",
    segundoNombre: "",
    fechaNacimiento: "",
    sexo: "",
    pais: "",
    departamento: "",
    municipio: "",
    zona: "",
    fax: "",
    telefono: "",
    direccion: "",
    correoElectronico: "",
    nitAfp: "",
    nitEps: "",
  },
  sedes: [],
  centrosTrabajo: [],
  archivos: [],
}

export function AfiliacionEmpleadorFormIntegrado() {
  const {
    agregarRegistro,
    actualizarRegistro,
    registroEditando,
    setRegistroEditando,
    limpiarDatosTemporales,
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

  useEffect(() => {
    const subscription = watch((value) => {
      if (!isEditMode) {
        if (value.empleadorDatos) {
          localStorage.setItem('empleador-datos-temp', JSON.stringify(value.empleadorDatos))
        }
        if (value.representanteLegal) {
          localStorage.setItem('representante-legal-temp', JSON.stringify(value.representanteLegal))
        }
        if (value.sedes) {
          localStorage.setItem('sedes-temp', JSON.stringify(value.sedes))
        }
        if (value.centrosTrabajo) {
          localStorage.setItem('centros-trabajo-temp', JSON.stringify(value.centrosTrabajo))
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [watch, isEditMode])

  const onValidSubmit = async (data: AfiliacionEmpleadorFormData) => {
    if (!data.sedes || data.sedes.length === 0) {
      toast.error({
        title: "Sede requerida",
        description: "Debe registrar al menos una sede para la empresa.",
      })
      return
    }

    for (const sede of data.sedes) {
      const centrosDeEstaSede = data.centrosTrabajo.filter(
        centro => centro.idSede === sede.id
      )
      
      if (centrosDeEstaSede.length === 0) {
        toast.error({
          title: "Centro de trabajo requerido",
          description: `Debe registrar al menos un centro de trabajo para la sede "${sede.nombreSede}".`,
        })
        return
      }
    }
    
    try {
      const sanitizedData = {
        empleadorDatos: sanitizeFormData(data.empleadorDatos),
        representanteLegal: sanitizeFormData(data.representanteLegal),
        sedes: data.sedes || [],
        centrosTrabajo: data.centrosTrabajo || [],
        archivos: data.archivos || [],
      }

      if (isEditMode && registroEditando) {
        const registroActualizado: RegistroCompleto = {
          ...registroEditando,
          ...sanitizedData,
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
          ...sanitizedData,
          metodoSubida: undefined,
        }
        agregarRegistro(nuevoRegistro)
        toast.success({
          title: "Registro guardado",
          description: "El registro se guardó localmente.",
        })
      }

      limpiarDatosTemporales()
      form.reset(initialDefaultValues)
      setRegistroEditando(null)
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
    limpiarDatosTemporales()
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
        <div className="mb-12">
          <DatosEmpleador
            control={control}
            errors={errors.empleadorDatos || {}}
            watch={watch}
            setValue={setValue}
          />
        </div>

        <div className="mb-12">
          <DatosRepresentanteLegal
            control={control}
            errors={errors.representanteLegal || {}}
            watch={watch}
            setValue={setValue}
          />
        </div>

        <div className="mb-12">
          <DatosSedes
            control={control}
            errors={errors}
            watch={watch}
            setValue={setValue}
          />
        </div>

        <div className="mb-12">
          <DatosCentrosTrabajo
            control={control}
            errors={errors}
            watch={watch}
            setValue={setValue}
          />
        </div>
      </FormWrapper>

      <ListaRegistros />
    </div>
  )
}