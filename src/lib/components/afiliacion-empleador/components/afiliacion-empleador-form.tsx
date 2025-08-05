"use client"

import { useForm } from "react-hook-form"
import { useEffect } from "react"
import { FormWrapper } from "@/lib/components/core/form/form-wrapper"
import { useRegistroStore } from "../stores/registro-store"
import { ListaRegistros } from "./lista-registros"
import { sanitizeFormData } from "../validations/validation-rules"
import { toast } from "@/lib/utils/toast"
import type { RegistroCompleto, AfiliacionEmpleadorFormData, EmpleadorDatos, RepresentanteLegal } from "../types/afiliacion-empleador-types"

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

  // Cargar datos al inicializar
  useEffect(() => {
    if (registroEditando) {
      reset(registroEditando)
    } else {
      reset(initialDefaultValues)
    }
  }, [registroEditando, reset])

  // Sincronizar datos del formulario con localStorage
  useEffect(() => {
    const subscription = watch((value) => {
      if (!isEditMode) {
        // Debug temporal para verificar datos
        console.log("=== DATOS EN TIEMPO REAL ===")
        console.log("Empleador datos:", value.empleadorDatos)
        console.log("Representante legal:", value.representanteLegal)
        console.log("============================")
        
        // Guardar datos temporales en localStorage
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
    // Debug temporal para verificar datos
    console.log("=== DATOS DEL FORMULARIO ===")
    console.log("Empleador datos:", data.empleadorDatos)
    console.log("Representante legal:", data.representanteLegal)
    console.log("Sedes:", data.sedes)
    console.log("Centros trabajo:", data.centrosTrabajo)
    console.log("============================")
    
    try {
      // Sanitizar los datos anidados
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

      // Limpiar datos temporales después de guardar
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
            control={control as any}
            errors={errors.empleadorDatos || {}}
            watch={(name: keyof EmpleadorDatos) => watch(`empleadorDatos.${name}` as any)}
            setValue={(name: keyof EmpleadorDatos, value: any) => {
              setValue(`empleadorDatos.${name}` as any, value)
              // Trigger re-render para campos dependientes
              if (name === 'departamentoEmpleador') {
                setValue('empleadorDatos.municipioEmpleador' as any, '')
              }
            }}
          />
        </div>

        <div className="mb-12">
          <DatosRepresentanteLegal
            control={control as any}
            errors={errors.representanteLegal || {}}
            watch={(name: keyof RepresentanteLegal) => watch(`representanteLegal.${name}` as any)}
            setValue={(name: keyof RepresentanteLegal, value: any) => {
              setValue(`representanteLegal.${name}` as any, value)
              // Trigger re-render para campos dependientes
              if (name === 'departamento') {
                setValue('representanteLegal.municipio' as any, '')
              }
            }}
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