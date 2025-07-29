import { Alert, AlertDescription } from "@/lib/components/ui/alert";
import { Info, Download } from "lucide-react";

type Props = {
  file?: string
  fileTitle?: string
}

export function CardDownloadExcel({file = '', fileTitle = ''}: Props) {
  return (
    <Alert className="border-orange-200 bg-orange-50 p-4 shadow-md">
      <Info className="!h-5 !w-5 !text-orange-700" />
      <AlertDescription>
        <div className="space-y-3">
          <p className="font-semibold text-orange-800 text-base">
              ¿Necesitas afiliar varios empleados a la vez?
          </p>
          <p className="text-orange-700 text-base">
            Descarga nuestra plantilla base en Excel, diligénciala con la información de cada trabajador y súbela fácilmente mediante la opción de carga masiva.
          </p>
          <a 
            href={file}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-orange-700 hover:text-orange-900 underline font-medium text-base"
          >
            <Download className="h-5 w-5" />
              {fileTitle}
          </a>
        </div>
      </AlertDescription>
    </Alert>
  )
}