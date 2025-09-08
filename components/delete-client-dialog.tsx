"use client"

import { useState } from "react"
import { useMutation } from "@/lib/convex"
import { useToast } from "@/components/ui/use-toast"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2 } from "lucide-react"

interface DeleteClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client: {
    _id: string
    fullName: string
  }
}

export function DeleteClientDialog({ open, onOpenChange, client, onDelete, confirmOnly }: DeleteClientDialogProps & { onDelete?: () => void, confirmOnly?: boolean }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const deleteClient = useMutation("clients:delete")
  const { toast } = useToast()

  const handleDelete = async () => {
    if (confirmOnly && onDelete) {
      onOpenChange(false)
      onDelete()
      return
    }
    setIsDeleting(true)
    try {
      await deleteClient(client._id, {})
      toast({ title: "Cliente eliminado exitosamente", variant: "success" })
      onOpenChange(false)
    } catch (error) {
      toast({ title: "Error al eliminar el cliente", variant: "error" })
      console.error("Error:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente el cliente <strong>{client.fullName}</strong> y
            todos sus datos asociados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmOnly ? "Sí, eliminar" : "Eliminar Cliente"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
