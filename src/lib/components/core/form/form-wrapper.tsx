"use client"

import type React from "react"
import type { UseFormReturn, FieldValues } from "react-hook-form"

import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/ui/card"
import { Button } from "@/lib/components/ui/button"
import { Save, RotateCcw, X, Upload } from "lucide-react"
import { FormProvider } from "react-hook-form"

interface FormWrapperProps<T extends FieldValues = FieldValues> {
  // Header configuration
  title: string
  isEditing?: boolean
  onCancelEdit?: () => void

  // Massive upload configuration
  showMassiveUpload?: boolean
  massiveUploadComponent?: React.ReactNode

  // Form content
  children: React.ReactNode
  onSubmit: (e: React.FormEvent) => void

  // Footer buttons configuration
  onClear?: () => void
  isSubmitting?: boolean
  isFormValid?: boolean
  submitButtonText?: string
  clearButtonText?: string
  showClearButton?: boolean

  // Styling
  className?: string
  headerClassName?: string
  contentClassName?: string
  footerClassName?: string

  // Submit button customization
  submitButtonIcon?: React.ReactNode
  submitButtonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  submitButtonClassName?: string

  // Clear button customization
  clearButtonIcon?: React.ReactNode
  clearButtonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  clearButtonClassName?: string

  // Additional footer content
  footerContent?: React.ReactNode
  form?: UseFormReturn<T>
}

export function FormWrapper<T extends FieldValues = FieldValues>({
  // Header
  title,
  isEditing = false,
  onCancelEdit,

  // Massive upload
  showMassiveUpload = false,
  massiveUploadComponent,

  // Form content
  children,
  onSubmit,

  // Footer buttons
  onClear,
  isSubmitting = false,
  isFormValid = true,
  submitButtonText,
  clearButtonText = "Limpiar",
  showClearButton = true,

  // Styling
  className = "shadow-md",
  headerClassName,
  contentClassName,
  footerClassName,

  // Submit button customization
  submitButtonIcon = <Save className="h-4 w-4" />,
  submitButtonVariant = "default",
  submitButtonClassName = "bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50 disabled:cursor-not-allowed",

  // Clear button customization
  clearButtonIcon = <RotateCcw className="h-4 w-4" />,
  clearButtonVariant = "outline",
  clearButtonClassName,

  // Additional footer content
  footerContent,
  form,
}: FormWrapperProps<T>) {
  // Determinar texto del botón submit
  const getSubmitButtonText = () => {
    if (submitButtonText) return submitButtonText
    if (isSubmitting) return "Guardando..."
    if (isEditing) return "Actualizar"
    return "Guardar"
  }

  const content = (
    <Card className={`${className} w-full`}>
      <CardHeader className={headerClassName}>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-2xl">
            {title}
            {isEditing && onCancelEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={onCancelEdit}
                className="flex items-center gap-2 bg-transparent"
              >
                <X className="h-4 w-4" />
                Cancelar
              </Button>
            )}
          </div>

          {showMassiveUpload && massiveUploadComponent && (
            <div className="flex items-center gap-2">
               <Button
                  variant="outline"
                  size="lg"
                  className="flex items-center gap-2 bg-transparent"
                >
                  <Upload className="h-4 w-4" />
                  Carga masiva
              </Button>
            </div>
            
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className={contentClassName}>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-6">{children}</div>
          <div className={`flex flex-col gap-4 ${footerClassName || ""}`}>
            {footerContent}
            <div className="flex gap-6 mt-4">
              <Button
                type="submit"
                size="lg"
                variant={submitButtonVariant}
                disabled={isSubmitting || !isFormValid}
                className={`flex items-center gap-2 !py-5 !px-8 cursor-pointer ${submitButtonClassName}`}
              >
                {submitButtonIcon}
                {getSubmitButtonText()}
              </Button>
              {showClearButton && onClear && (
                <Button
                  type="button"
                  size="lg"
                  variant={clearButtonVariant}
                  onClick={onClear}
                  disabled={isSubmitting}
                  className={`flex items-center gap-2 cursor-pointer ${clearButtonClassName || ""}`}
                >
                  {clearButtonIcon}
                  {clearButtonText}
                </Button>
              )}
              {isEditing && onCancelEdit && (
                <Button type="button" size="lg" variant="outline" onClick={onCancelEdit} disabled={isSubmitting}>
                  Cancelar Edición
                </Button>
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )

  if (form) {
    return <FormProvider {...form}>{content}</FormProvider>
  }
  return content
}