import { Alert, AlertDescription } from "@/lib/components/ui/alert";
import { Info, Download } from "lucide-react";

type Props = {
  file?: string
  fileTitle?: string
  title?: string
  description?: string
}

export function CardDownloadExcel({file = '', fileTitle = '', title = '', description = ''}: Props) {
  return (
    <Alert className="border-orange-200 bg-orange-50 p-4 shadow-md">
      <Info className="!h-5 !w-5 !text-orange-700" />
      <AlertDescription>
        <div className="space-y-3">
          <p className="font-semibold text-orange-800 text-base">
            {title}
          </p>
          <p className="text-orange-700 text-sm sm:text-base">
            {description}
          </p>
          <a 
            href={file}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-orange-700 hover:text-orange-900 underline font-medium text-sm sm:text-base"
          >
            <Download className="min-h-5 h-5 min-w-5 h-5" />
              {fileTitle}
          </a>
        </div>
      </AlertDescription>
    </Alert>
  )
}