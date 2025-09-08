import { toast as toastify } from "react-toastify"

type ToastType = "success" | "error" | "info" | "warning" | "default"

export function useToast() {
  return {
    toast: (options: { title?: string; description?: string; variant?: ToastType }) => {
      const msg = options.title
        ? options.description
          ? `${options.title}: ${options.description}`
          : options.title
        : options.description || ""
      switch (options.variant) {
        case "success":
          toastify.success(msg)
          break
        case "error":
          toastify.error(msg)
          break
        case "info":
          toastify.info(msg)
          break
        case "warning":
          toastify.warn(msg)
          break
        default:
          toastify(msg)
      }
    },
  }
}
