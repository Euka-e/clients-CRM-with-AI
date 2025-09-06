"use client"

import { useState } from "react"
import { useMutation } from "@/lib/convex"

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
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface DeleteClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client: {
    _id: string
    name: string
  }
}

export function DeleteClientDialog({ open, onOpenChange, client }: DeleteClientDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const deleteClient = useMutation("clients:delete")

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteClient(client._id)
      toast.success("Cliente eliminado exitosamente")
      onOpenChange(false)
    } catch (error) {
      toast.error("Error al eliminar el cliente")
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
            Esta acción no se puede deshacer. Se eliminará permanentemente el cliente <strong>{client.name}</strong> y
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
            Eliminar Cliente
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
