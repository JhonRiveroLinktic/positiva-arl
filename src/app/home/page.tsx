"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/ui/card"
import { Button } from "@/lib/components/ui/button"
import { ProtectedRoute } from "@/lib/components/core/auth/protected-route"
import { Header } from "@/lib/components/core/components/header"
import { ArrowRight } from "lucide-react"
import { useAuth } from "@/lib/components/core/auth/auth-context"

const forms = [
  {
    title: "Seguimiento",
    description: "Formulario de seguimiento de casos",
    path: "/forms/seguimiento-afiliaciones-arl"
  },
  {
    title: "Plantilla masiva Trabajador Independiente con Contrato",
    description: "Formulario para cargar trabajadores independientes con contrato",
    path: "/forms/independiente-con-contrato"
  },
  {
    title: "Formulario Afiliación Empleador (Empresas, Sedes - Sucursales - Centro de trabajo Y RL)",
    description: "Formulario para registrar empleadores",
    path: "/forms/afiliacion-empleador"
  },
  {
    title: "Plantilla masiva Trabajador Independiente Voluntario",
    description: "Formulario para cargar trabajadores independientes voluntarios",
    path: "/forms/independiente-voluntario"
  },
  {
    title: "Cambio Actividad Económica Independiente con Contrato",
    description: "Formulario para cambio de actividad económica a ejecutar del trabajador",
    path: "/forms/cambio-actividad-economica-independiente-con-contrato"
  },
  {
    title: "Novedad Actualización Cargo Trabajador - Dependiente e Independiente con Contrato",
    description: "Formulario para cambio de cargo de trabajador",
    path: "/forms/novedad-actualizacion-cargo-trabajador"
  },
  {
    title: "Novedad Actualización Datos Trabajador",
    description: "Formulario para actualización de datos de trabajador",
    path: "/forms/novedad-actualizacion-datos-trabajador"
  },
  {
    title: "Retiro de Trabajadores",
    description: "Formulario para retiro de trabajadores",
    path: "/forms/retiro-trabajadores"
  },
  {
    title: "Cambio de Riesgo",
    description: "Formulario para cambio de riesgo",
    path: "/forms/cambio-riesgo"
  },
  {
    title: "Fecha de Cambios",
    description: "Formulario para reportar fecha de cambios",
    path: "/forms/fecha-cambios"
  },
  {
    title: "Prorroga de Fecha de Contrato Trabajador Independiente",
    description: "Formulario para prorrogar la fecha de contrato del trabajador independiente",
    path: "/forms/prorroga-fecha-contrato-trabajador-independiente"
  },
  {
    title: "Cambio de Ocupación - Trabajador Independiente Voluntario",
    description: "Formulario para realizar el cambio de ocupación del trabajador independiente voluntario",
    path: "/forms/cambio-ocupacion-independiente-voluntario"
  },
] as const;

type FormType = typeof forms[number];

export default function HomePage() {
  const router = useRouter()
  const { user } = useAuth();

  let visibleForms: FormType[] = [];
  if (user?.user_type === 'tipo1') {
    visibleForms = [forms[0]];
  } else if (user?.user_type === 'tipo2') {
    visibleForms = [forms[1], forms[2], forms[3], forms[4], forms[5], forms[6], forms[7], forms[8], forms[9], forms[10], forms[11]];
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-12">
          {user?.user_type !== 'tipo1' && user?.user_type !== 'tipo2' ? (
            <div className="bg-red-100 border border-red-300 text-red-700 rounded-lg p-6 text-center max-w-lg mx-auto">
              <h2 className="text-xl font-bold mb-2">Acceso denegado</h2>
              <p>No tienes permisos para acceder a ningún módulo. Por favor comunícate con soporte.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl px-2 md:px-4">
              {visibleForms.map(form => (
                <Card onClick={() => router.push(form.path)} key={form.path}
                  className="group relative overflow-hidden rounded-3xl border-2 border-orange-200 shadow-xl bg-gradient-to-br from-orange-50 via-white to-orange-100 hover:from-orange-50 hover:to-orange-100 hover:scale-105 hover:shadow-2xl transition-all duration-300 cursor-pointer w-full h-full flex flex-col justify-between p-4 sm:p-6">
                  <div className=" bg-gradient-to-br from-orange-200/40 to-orange-100/10 opacity-0 group-hover:opacity-80 transition-opacity duration-300 z-0" />
                  <CardHeader className="z-10 relative pb-2 flex flex-col items-center">
                    <CardTitle className="text-2xl font-bold text-orange-700 group-hover:text-orange-900 transition-colors duration-200 drop-shadow-sm text-center w-full">
                      {form.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="z-10 relative flex flex-col justify-between items-center w-full px-0 pb-4 sm:px-2 sm:pb-8">
                    <p className="mb-6 text-gray-700 group-hover:text-gray-900 transition-colors duration-200 min-h-[40px] text-center text-base sm:text-lg font-medium w-full">
                      {form.description}
                    </p>
                    <button onClick={() => router.push(form.path)} className="w-full mt-2 sm:mt-4 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-bold py-2 sm:py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg group-hover:scale-110 transition-transform duration-200 text-base">
                      Ir al formulario
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
