"use client"

import { Toaster as SonnerToaster } from "sonner"

type ToasterProps = React.ComponentProps<typeof SonnerToaster>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <SonnerToaster
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-bg-card group-[.toaster]:text-text-primary group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-text-muted",
          actionButton:
            "group-[.toast]:bg-accent group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-bg-subtle group-[.toast]:text-text-secondary",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
