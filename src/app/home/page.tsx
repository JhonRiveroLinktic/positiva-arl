"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/ui/card"
import { ProtectedRoute } from "@/lib/components/core/auth/protected-route"
import { Header } from "@/lib/components/core/components/header"
import { ArrowRight } from "lucide-react"
import { useAuth } from "@/lib/components/core/auth/auth-context"

const items = [
  {
    title: "01. Plantilla masiva Trabajador Dependiente - Seguimiento",
    description: "Formulario para cargar trabajadores dependientes",
    path: "/forms/seguimiento-afiliaciones-arl"
  },
  {
    title: "02. Plantilla masiva Trabajador Independiente con Contrato",
    description: "Formulario para cargar trabajadores independientes con contrato",
    path: "/forms/independiente-con-contrato"
  },
  // {
  //   title: "03. Formulario Afiliación Empleador (Empresas, Sedes - Sucursales - Centro de trabajo Y RL)",
  //   description: "Formulario para registrar empleadores",
  //   path: "/forms/afiliacion-empleador"
  // },
  {
    title: "04. Plantilla masiva Trabajador Independiente Voluntario",
    description: "Formulario para cargar trabajadores independientes voluntarios",
    path: "/forms/independiente-voluntario"
  },
  {
    title: "05. Cambio Actividad Económica Independiente con Contrato",
    description: "Formulario para cambio de actividad económica a ejecutar del trabajador",
    path: "/forms/cambio-actividad-economica-independiente-con-contrato"
  },
  {
    title: "06. Novedad Actualización Cargo Trabajador - Dependiente e Independiente con Contrato",
    description: "Formulario para cambio de cargo de trabajador",
    path: "/forms/novedad-actualizacion-cargo-trabajador"
  },
  {
    title: "07. Ajuste Fecha de Contrato Prorroga de Trabajador Independiente",
    description: "Formulario para prorrogar la fecha de contrato del trabajador independiente",
    path: "/forms/prorroga-fecha-contrato-trabajador-independiente"
  },
  {
    title: "08. Novedad Actualización Datos Trabajador",
    description: "Formulario para actualización de datos de trabajador",
    path: "/forms/novedad-actualizacion-datos-trabajador"
  },
  // {
  //   title: "09. Novedad Retiro Empleador",
  //   description: "Formulario para retiro de empleadores",
  //   path: "/forms/novedad-retiro-empleador"
  // },
  {
    title: "10. Retiro de Trabajador",
    description: "Formulario para retiro de trabajadores",
    path: "/forms/retiro-trabajadores"
  },
  {
    title: "11. Novedad Actualización Datos Empleador",
    description: "Formulario para actualización de datos de empleadores",
    path: "/forms/novedad-actualizacion-datos-empleador"
  },
  {
    title: "12. Novedad Sede Empleador",
    description: "Formulario para registro de sedes de empleadores",
    path: "/forms/novedad-sede-empleador"
  },
  {
    title: "13. Cambio de Ocupación - Trabajador Independiente Voluntario",
    description: "Formulario para realizar el cambio de ocupación del trabajador independiente voluntario",
    path: "/forms/cambio-ocupacion-independiente-voluntario"
  },
  {
    title: "14. Notificación Desplazamiento Trabajador",
    description: "Formulario para notificación de desplazamiento de trabajadores",
    path: "/forms/notificacion-desplazamiento-trabajador"
  },
  // {
  //   title: "Cambio de Riesgo",
  //   description: "Formulario para cambio de riesgo",
  //   path: "/forms/cambio-riesgo"
  // },
  // {
  //   title: "Fecha de Cambios",
  //   description: "Formulario para reportar fecha de cambios",
  //   path: "/forms/fecha-cambios"
  // },
] as const

const itemsActualizaciones = [
  // {
  //   title: "Actualización Razón Social - Dependientes / Independientes",
  //   description: "Formulario para actualizar la razón social de trabajadores dependientes e independientes",
  //   path: "/forms/actualizacion-razon-social-dependientes-independientes"
  // },
  {
    title: "Actualización Valor Contrato - Independientes",
    description: "Formulario para actualizar el valor del contrato de trabajadores independientes",
    path: "/forms/actualizacion-valor-contrato-independientes"
  },
  // {
  //   title: "Actualización Razón Social - Empleadores / Independientes",
  //   description: "Formulario para actualizar la razón social de empleadores y trabajadores independientes",
  //   path: "/forms/cambio-razon-social"
  // }
]

type HomeItem = typeof items[number]
type HomeItemActualizaciones = typeof itemsActualizaciones[number]

export default function HomePage() {
  const router = useRouter()
  const { user } = useAuth()

  const formularios = items.slice(0, 4)
  const novedades = items.slice(4)
  const actualizaciones = itemsActualizaciones

  let visibleFormularios: HomeItem[] = []
  let visibleNovedades: HomeItem[] = []
  let visibleActualizaciones: HomeItemActualizaciones[] = []

  if (user?.user_type === "tipo1") {
    visibleFormularios = [...formularios]
    visibleNovedades = [...novedades]
  } else if (user?.user_type === "tipo2") {
    visibleFormularios = [...formularios]
    visibleNovedades = [...novedades]
  } else if (user?.user_type === "tipo3") {
    visibleFormularios = [...formularios]
    visibleNovedades = [...novedades]
    visibleActualizaciones = [...actualizaciones]
  }

  const renderItemCard = (item: HomeItem | HomeItemActualizaciones) => (
    <Card
      onClick={() => router.push(item.path)}
      key={item.path}
      className="group relative overflow-hidden rounded-2xl border border-orange-100 bg-white hover:border-orange-400 hover:bg-orange-50/40 hover:shadow-lg transition-all duration-200 cursor-pointer"
   >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-gray-800 group-hover:text-orange-600">
          {item.title}
        </CardTitle>
        <div className="mt-2 h-1 w-12 rounded-full bg-orange-400/80 group-hover:bg-orange-500" />
      </CardHeader>
      <CardContent className="flex items-start justify-between">
        <p className="text-sm text-gray-600 pr-4">{item.description}</p>
        <ArrowRight className="h-5 w-5 text-orange-500 group-hover:text-orange-600 group-hover:translate-x-1 transition-transform" />
      </CardContent>
    </Card>
  )

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center py-12">
          {user?.user_type !== "tipo1" && user?.user_type !== "tipo2" && user?.user_type !== "tipo3" ? (
            <div className="bg-red-100 border border-red-300 text-red-700 rounded-lg p-6 text-center max-w-lg mx-auto">
              <h2 className="text-xl font-bold mb-2">Acceso denegado</h2>
              <p>
                No tienes permisos para acceder a ningún módulo. Por favor comunícate con soporte.
              </p>
            </div>
          ) : (
            <div className="w-full max-w-6xl px-2 md:px-4 space-y-10">
              {visibleFormularios.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-gray-800">Formularios</h2>
                  <div className="h-1 w-16 bg-orange-400 rounded-full mt-2 mb-6" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {visibleFormularios.map(renderItemCard)}
                  </div>
                </section>
              )}

              {visibleNovedades.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-gray-800">Novedades</h2>
                  <div className="h-1 w-16 bg-orange-400 rounded-full mt-2 mb-6" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {visibleNovedades.map(renderItemCard)}
                  </div>
                </section>
              )}

              <section>
                <h2 className="text-2xl font-bold text-gray-800">Consultas</h2>
                <div className="h-1 w-16 bg-orange-400 rounded-full mt-2 mb-6" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 
                <Card
                  onClick={() => router.push("/forms/consultas")}
                  key="/forms/consultas"
                  className="group relative overflow-hidden rounded-2xl border border-orange-100 bg-white hover:border-orange-400 hover:bg-orange-50/40 hover:shadow-lg transition-all duration-200 cursor-pointer"
              >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold text-gray-800 group-hover:text-orange-600">
                      Consultas
                    </CardTitle>
                    <div className="mt-2 h-1 w-12 rounded-full bg-orange-400/80 group-hover:bg-orange-500" />
                  </CardHeader>
                  <CardContent className="flex items-start justify-between">
                    <p className="text-sm text-gray-600 pr-4">Consulta registros en todas las tablas del sistema por tipo y número de documento</p>
                    <ArrowRight className="h-5 w-5 text-orange-500 group-hover:text-orange-600 group-hover:translate-x-1 transition-transform" />
                  </CardContent>
                </Card>
                </div>
                </section>
                
                <section>
                  {visibleActualizaciones.length > 0 && (
                    <section>
                    <h2 className="text-2xl font-bold text-gray-800">Actualizaciones directas en Balú</h2>
                    <div className="h-1 w-16 bg-orange-400 rounded-full mt-2 mb-6" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {visibleActualizaciones.map(renderItemCard)}
                      </div>
                    </section>
                  )}
                </section>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
