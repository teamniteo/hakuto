/**
 * EXAMPLE - DO NOT COPY DIRECTLY
 * This is a reference implementation for form field components.
 * Adapt styling and structure to match your project's design system.
 */
import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const Field = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    orientation?: "vertical" | "horizontal" | "responsive"
  }
>(({ className, orientation = "vertical", ...props }, ref) => (
  <div
    ref={ref}
    data-slot="field"
    className={cn(
      "group grid gap-2",
      orientation === "horizontal" && "grid-cols-[1fr_auto] items-center",
      orientation === "responsive" && "sm:grid-cols-[1fr_auto] sm:items-center",
      "data-[invalid=true]:text-destructive",
      className
    )}
    {...props}
  />
))
Field.displayName = "Field"

const FieldGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="field-group"
    className={cn("space-y-4", className)}
    {...props}
  />
))
FieldGroup.displayName = "FieldGroup"

const FieldLabel = React.forwardRef<
  React.ComponentRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => (
  <Label
    ref={ref}
    data-slot="field-label"
    className={cn(
      "text-sm font-medium leading-none",
      "group-data-[invalid=true]:text-destructive",
      className
    )}
    {...props}
  />
))
FieldLabel.displayName = "FieldLabel"

const FieldDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="field-description"
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
FieldDescription.displayName = "FieldDescription"

const FieldError = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & { message?: string }
>(({ className, message, ...props }, ref) => {
  if (!message) return null
  return (
    <p
      ref={ref}
      data-slot="field-error"
      className={cn("text-sm font-medium text-destructive", className)}
      role="alert"
      {...props}
    >
      {message}
    </p>
  )
})
FieldError.displayName = "FieldError"

const FieldContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="field-content"
    className={cn("space-y-1", className)}
    {...props}
  />
))
FieldContent.displayName = "FieldContent"

export {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldContent,
}
