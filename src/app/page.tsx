import { redirect } from "next/navigation";

export default function Home() {
  redirect("/home");
}

// import { Header } from "@/lib/components/core/components/header";
// import { Banner } from "@/lib/components/core/components/banner";
// import { CardDownloadExcel } from "@/lib/components/core/components/card-download-excel";
// import { ARLRegistrationForm } from "@/lib/components/afiliaciones-arl/components/registro-arl-form";
// import { Suspense } from "react";

// function FormularioRegistroFallback() {
//   return (
//     <div className="flex items-center justify-center min-h-[400px]">
//       <div className="text-center">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
//         <p className="text-gray-600">Cargando formulario...</p>
//       </div>
//     </div>
//   )
// }

// export default function Home() {
//   return (
//     <main>
//       <Header />
//       <div className="w-full flex flex-col items-center justify-items-center gap-6 px-4 py-8 bg-gray-50 min-h-screen">
//         <Banner 
//           title="Formulario de Afiliación ARL" 
//           description="Complete todos los campos requeridos para procesar su afiliación a la ARL." 
//         /> 
//         <CardDownloadExcel
//           title="¿Necesitas afiliar varios empleados a la vez?"
//           description="Descarga nuestra plantilla base en Excel, diligénciala con la información de cada trabajador y súbela fácilmente mediante la opción de carga masiva."
//           fileTitle="Descargar Plantilla Masiva Dependiente" 
//           file="https://agjsaigtrimzgwxqldfx.supabase.co/storage/v1/object/public/assets//PLANTILLA%20MASIVA%20DEPENDIENTE.xlsx" 
//         />
//         <Suspense fallback={<FormularioRegistroFallback />}>
//           <ARLRegistrationForm />
//         </Suspense>
//       </div>
//     </main>
//   );
// }
