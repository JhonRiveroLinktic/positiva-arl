"use client"

import type React from "react"
import type { UseFormReturn, FieldValues } from "react-hook-form"

import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/ui/card"
import { Button } from "@/lib/components/ui/button"
import { Save, RotateCcw, X } from "lucide-react"
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
      {/* Header */}
      <CardHeader className={headerClassName}>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
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

          {/* Massive Upload Component */}
          {showMassiveUpload && massiveUploadComponent && (
            <div className="flex items-center gap-2">{massiveUploadComponent}</div>
          )}
        </CardTitle>
      </CardHeader>

      {/* Content */}
      <CardContent className={contentClassName}>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Form Fields */}
          <div className="space-y-6">{children}</div>

          {/* Footer */}
          <div className={`flex flex-col gap-4 ${footerClassName || ""}`}>
            {/* Additional footer content */}
            {footerContent}

            {/* Action Buttons */}
            <div className="flex gap-4">
              {/* Submit Button */}
              <Button
                type="submit"
                variant={submitButtonVariant}
                disabled={isSubmitting || !isFormValid}
                className={`flex items-center gap-2 ${submitButtonClassName}`}
              >
                {submitButtonIcon}
                {getSubmitButtonText()}
              </Button>

              {/* Clear Button */}
              {showClearButton && onClear && (
                <Button
                  type="button"
                  variant={clearButtonVariant}
                  onClick={onClear}
                  disabled={isSubmitting}
                  className={`flex items-center gap-2 ${clearButtonClassName || ""}`}
                >
                  {clearButtonIcon}
                  {clearButtonText}
                </Button>
              )}

              {/* Cancel Edit Button (alternative position) */}
              {isEditing && onCancelEdit && (
                <Button type="button" variant="outline" onClick={onCancelEdit} disabled={isSubmitting}>
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