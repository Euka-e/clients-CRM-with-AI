"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation } from "@/lib/convex"
import { useToast } from "@/components/ui/use-toast"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

const clientSchema = z.object({
  fullName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  phoneNumber: z.string().min(5, "Teléfono inválido"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  relationshipStatus: z.enum(["Activo", "Inactivo", "Potencial"]),
  company: z.string().optional(),
  notes: z.string().optional(),
  priority: z.enum(["Alta", "Media", "Baja"]),
})


interface ClientFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client?: {
    _id: string
    fullName: string
    phoneNumber: string
    email: string
    relationshipStatus: "Activo" | "Inactivo" | "Potencial"
    notes?: string
    priority: "Alta" | "Media" | "Baja"
    company?: string
  }
  mode: "create" | "edit"
}

export function ClientFormDialog({ open, onOpenChange, client, mode }: ClientFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const createClient = useMutation("clients:create")
  const updateClient = useMutation("clients:update")
  const { toast } = useToast()

  const form = useForm<z.infer<typeof clientSchema>>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      fullName: client?.fullName || "",
      phoneNumber: client?.phoneNumber || "",
      email: client?.email || "",
      relationshipStatus: client?.relationshipStatus || "Potencial",
      notes: client?.notes || "",
      priority: client?.priority || "Media",
      company: client?.company || "",
    },
  })

  useEffect(() => {
    if (open && client) {
      form.reset({
        fullName: client.fullName || "",
        phoneNumber: client.phoneNumber || "",
        email: client.email || "",
        relationshipStatus: client.relationshipStatus || "Potencial",
        notes: client.notes || "",
        priority: client.priority || "Media",
        company: client.company || "",
      })
    }
    if (open && !client && mode === "create") {
      form.reset({
        fullName: "",
        phoneNumber: "",
        email: "",
        relationshipStatus: "Potencial",
        notes: "",
        priority: "Media",
        company: "",
      })
    }
  }, [client, open, mode, form])

  const onSubmit = async (values: z.infer<typeof clientSchema>) => {
    setIsSubmitting(true)
    try {
      const submitData = {
        fullName: values.fullName,
        phoneNumber: values.phoneNumber,
        email: values.email || undefined,
        relationshipStatus: values.relationshipStatus,
        company: values.company || undefined,
        notes: values.notes || undefined,
        priority: values.priority,
      }

      if (mode === "create") {
        await createClient(submitData, {})
        toast({ title: "Cliente creado exitosamente", variant: "success" })
      } else if (client?._id) {
        await updateClient({ id: client._id, ...submitData }, {})
        toast({ title: "Cliente actualizado exitosamente", variant: "success" })
      }

      form.reset()
      onOpenChange(false)
    } catch (error) {
      toast({ title: "Error al guardar el cliente", variant: "error" })
      console.error("Error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Agregar Nuevo Cliente" : "Editar Cliente"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Completa la información del nuevo cliente." : "Actualiza la información del cliente."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Completo *</FormLabel>
                    <FormControl>
                      <Input placeholder="Juan Pérez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono *</FormLabel>
                    <FormControl>
                      <Input placeholder="+34 612 345 678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="juan@ejemplo.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="relationshipStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado de Relación *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Activo">Activo</SelectItem>
                        <SelectItem value="Inactivo">Inactivo</SelectItem>
                        <SelectItem value="Potencial">Potencial</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridad</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona prioridad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Alta">Alta</SelectItem>
                        <SelectItem value="Media">Media</SelectItem>
                        <SelectItem value="Baja">Baja</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Información adicional sobre el cliente..."
                      className="resize-none"
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
                {mode === "create" ? "Crear Cliente" : "Actualizar Cliente"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
