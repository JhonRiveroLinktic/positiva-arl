import { Header } from "@/lib/components/core/components/header";
import { Banner } from "@/lib/components/core/components/banner";
import { CardDownloadExcel } from "@/lib/components/core/components/card-download-excel";
import { UserRegistrationForm } from "@/lib/components/afiliaciones-arl/components/user-registration-form";

export default function Home() {
  return (
    <main>
      <Header />
      <div className="w-full flex flex-col items-center justify-items-center gap-4 px-4 py-8 bg-gray-50 min-h-screen">
        <Banner 
          title="Formulario de Afiliación ARL" 
          description="Complete todos los campos requeridos para procesar su afiliación a la ARL." 
        /> 
        <CardDownloadExcel />

        
        <UserRegistrationForm />
      </div>
    </main>
  );
}
