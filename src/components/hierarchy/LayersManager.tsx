'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createLayer, updateLayer, deleteLayer } from "@/actions/hierarchy"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
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
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Pencil, Trash2 } from "lucide-react"

const formSchema = z.object({
    name: z.string().min(1, "Layer name is required"),
    description: z.string().optional(),
})

type Layer = {
    id: string
    name: string
    description: string | null
}

export function LayersManager({ initialLayers }: { initialLayers: Layer[] }) {
    const [layers, setLayers] = useState(initialLayers)
    const [open, setOpen] = useState(false)
    const [editingLayer, setEditingLayer] = useState<Layer | null>(null)
    const [deletingLayerId, setDeletingLayerId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
        },
    })

    async function onSubmit(data: z.infer<typeof formSchema>) {
        try {
            setError(null)

            if (editingLayer) {
                // Update existing layer
                const res = await updateLayer(editingLayer.id, data)
                if (res.success && res.data) {
                    setLayers(layers.map(l => l.id === editingLayer.id ? res.data : l))
                    setOpen(false)
                    setEditingLayer(null)
                    form.reset()
                } else if (res.error) {
                    setError(typeof res.error === 'string' ? res.error : JSON.stringify(res.error))
                }
            } else {
                // Create new layer
                const res = await createLayer(data)
                if (res.success && res.data) {
                    setLayers([...layers, res.data])
                    setOpen(false)
                    form.reset()
                } else if (res.error) {
                    setError(typeof res.error === 'string' ? res.error : JSON.stringify(res.error))
                }
            }
        } catch (err) {
            console.error("Error saving layer:", err)
            setError(err instanceof Error ? err.message : "Unknown error occurred")
        }
    }

    async function handleDelete() {
        if (!deletingLayerId) return

        try {
            setError(null)
            const res = await deleteLayer(deletingLayerId)

            if (res.success) {
                setLayers(layers.filter(l => l.id !== deletingLayerId))
                setDeletingLayerId(null)
            } else if (res.error) {
                setError(typeof res.error === 'string' ? res.error : res.error.toString())
                setDeletingLayerId(null)
            }
        } catch (err) {
            console.error("Error deleting layer:", err)
            setError(err instanceof Error ? err.message : "Unknown error occurred")
            setDeletingLayerId(null)
        }
    }

    function openEditDialog(layer: Layer) {
        setEditingLayer(layer)
        form.reset({
            name: layer.name,
            description: layer.description || "",
        })
        setOpen(true)
    }

    function openCreateDialog() {
        setEditingLayer(null)
        form.reset({
            name: "",
            description: "",
        })
        setOpen(true)
    }

    return (
        <div className="space-y-6">
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-md">
                    <p className="font-medium">Error</p>
                    <p className="text-sm mt-1">{error}</p>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setError(null)}
                        className="mt-2"
                    >
                        Dismiss
                    </Button>
                </div>
            )}

            <div className="flex justify-end">
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openCreateDialog}>Add Layer</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingLayer ? "Edit Layer" : "Add New Layer"}
                            </DialogTitle>
                            <DialogDescription>
                                {editingLayer
                                    ? "Update the layer name and description."
                                    : "Create a new layer to categorize your resources and quizzes."}
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Layer Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Layer 0 - Foundation" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description (Optional)</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="e.g., Foundation level content for beginners"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="flex gap-2">
                                    <Button type="submit">
                                        {editingLayer ? "Update Layer" : "Create Layer"}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setOpen(false)
                                            setEditingLayer(null)
                                            form.reset()
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {layers.map((layer) => (
                    <Card key={layer.id}>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <CardTitle className="flex-1">{layer.name}</CardTitle>
                                <div className="flex gap-1 ml-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => openEditDialog(layer)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                        onClick={() => setDeletingLayerId(layer.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-500">
                                {layer.description || "No description"}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {layers.length === 0 && (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <p className="text-muted-foreground mb-4">No layers created yet</p>
                        <p className="text-sm text-muted-foreground text-center max-w-md">
                            Create layers to categorize your resources and quizzes by difficulty or progression level
                        </p>
                    </CardContent>
                </Card>
            )}

            <AlertDialog open={!!deletingLayerId} onOpenChange={(open) => !open && setDeletingLayerId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this layer. This action cannot be undone.
                            {layers.find(l => l.id === deletingLayerId) && (
                                <span className="block mt-2 font-medium text-foreground">
                                    Layer: {layers.find(l => l.id === deletingLayerId)?.name}
                                </span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
