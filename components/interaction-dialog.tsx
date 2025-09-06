"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation } from "@/lib/convex"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const interactionSchema = z.object({
  type: z.enum(["Llamada telefónica", "Email enviado", "Reunión", "Mensaje", "Otro"]),
  notes: z.string().min(5, "La descripción debe tener al menos 5 caracteres"),
})

type InteractionFormData = z.infer<typeof interactionSchema>

interface InteractionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientId: string
  clientName: string
}

export function InteractionDialog({ open, onOpenChange, clientId, clientName }: InteractionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const addInteraction = useMutation("interactions:create")

  const form = useForm<InteractionFormData>({
    resolver: zodResolver(interactionSchema),
    defaultValues: {
      type: "Llamada telefónica",
      notes: "",
    },
  })

  const onSubmit = async (data: InteractionFormData) => {
    setIsSubmitting(true)
    try {
      await addInteraction({
        clientId,
        type: data.type,
        notes: data.notes,
      })

      toast.success("Interacción registrada exitosamente")
      form.reset()
      onOpenChange(false)
    } catch (error) {
      toast.error("Error al registrar la interacción")
      console.error("Error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Marcar Interacción</DialogTitle>
          <DialogDescription>Registra una nueva interacción con {clientName}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Interacción *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Llamada telefónica">Llamada telefónica</SelectItem>
                      <SelectItem value="Email enviado">Email enviado</SelectItem>
                      <SelectItem value="Reunión">Reunión</SelectItem>
                      <SelectItem value="Mensaje">Mensaje</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe la interacción realizada..."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Registrar Interacción
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
