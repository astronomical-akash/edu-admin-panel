'use client'

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
    createChapter, updateChapter, deleteChapter,
    createTopic, updateTopic, deleteTopic,
    createSubtopic, updateSubtopic, deleteSubtopic,
    getLayers, updateSubtopicOrder
} from "@/actions/hierarchy"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
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
    FormDescription,
} from "@/components/ui/form"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Plus, ChevronRight, Edit, Trash2, MoreVertical, GripVertical } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Types (simplified for props)
type SubjectData = {
    id: string
    name: string
    chapters: any[]
}

export function SubjectHierarchyManager({ subject }: { subject: SubjectData }) {
    const [data, setData] = useState(subject)
    const [layers, setLayers] = useState<any[]>([])

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        getLayers().then(setLayers)
    }, [])

    async function handleDragEnd(event: DragEndEvent, topicId: string) {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const chapter = data.chapters.find(c => c.topics.some((t: any) => t.id === topicId))
            if (!chapter) return

            const topic = chapter.topics.find((t: any) => t.id === topicId)
            if (!topic) return

            const oldIndex = topic.subtopics.findIndex((s: any) => s.id === active.id);
            const newIndex = topic.subtopics.findIndex((s: any) => s.id === over?.id);

            const newSubtopics = arrayMove(topic.subtopics, oldIndex, newIndex);

            // Optimistic update
            const newData = { ...data }
            const targetChapter = newData.chapters.find(c => c.id === chapter.id)
            const targetTopic = targetChapter.topics.find((t: any) => t.id === topicId)
            targetTopic.subtopics = newSubtopics
            setData(newData)

            // Server update
            const updates = newSubtopics.map((s: any, i: number) => ({ id: s.id, orderIndex: i }))
            const res = await updateSubtopicOrder(updates)
            if (!res.success) {
                toast.error("Failed to reorder subtopics")
                window.location.reload()
            }
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <ItemDialog
                    title="Add Chapter"
                    label="Chapter Title"
                    onSubmit={async (val) => {
                        const res = await createChapter({ title: val, subjectId: subject.id, orderIndex: 0 })
                        if (res.success && res.data) {
                            window.location.reload()
                        } else {
                            toast.error("Failed to create chapter")
                        }
                    }}
                />
            </div>

            {data.chapters.map((chapter) => (
                <Card key={chapter.id} className="border-l-4 border-l-blue-500">
                    <CardHeader className="py-3 bg-gray-50 dark:bg-gray-900/50">
                        <CardTitle className="text-lg flex justify-between items-center">
                            <span>{chapter.title}</span>
                            <div className="flex items-center gap-2">
                                <ItemActions
                                    onEdit={async (newTitle) => {
                                        const res = await updateChapter(chapter.id, { title: newTitle })
                                        if (res.success) {
                                            window.location.reload()
                                            toast.success("Chapter updated")
                                        } else {
                                            toast.error("Failed to update chapter")
                                        }
                                    }}
                                    onDelete={async () => {
                                        const res = await deleteChapter(chapter.id)
                                        if (res.success) {
                                            window.location.reload()
                                            toast.success("Chapter deleted")
                                        } else {
                                            toast.error(res.error || "Failed to delete chapter")
                                        }
                                    }}
                                    initialValue={chapter.title}
                                    editTitle="Edit Chapter"
                                    deleteTitle="Delete Chapter?"
                                />
                                <ItemDialog
                                    title="Add Topic"
                                    label="Topic Title"
                                    trigger={<Button size="sm" variant="ghost"><Plus className="w-4 h-4 mr-1" /> Topic</Button>}
                                    onSubmit={async (val) => {
                                        const res = await createTopic({ title: val, chapterId: chapter.id, orderIndex: 0 })
                                        if (res.success) window.location.reload()
                                    }}
                                />
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <Accordion type="multiple">
                            {chapter.topics.map((topic: any) => (
                                <AccordionItem key={topic.id} value={topic.id} className="border-b-0">
                                    <div className="flex items-center justify-between w-full pr-4">
                                        <AccordionTrigger className="hover:no-underline py-2 flex-1">
                                            <span className="font-medium">{topic.title}</span>
                                        </AccordionTrigger>
                                        <ItemActions
                                            onEdit={async (newTitle) => {
                                                const res = await updateTopic(topic.id, { title: newTitle })
                                                if (res.success) {
                                                    window.location.reload()
                                                    toast.success("Topic updated")
                                                } else {
                                                    toast.error("Failed to update topic")
                                                }
                                            }}
                                            onDelete={async () => {
                                                const res = await deleteTopic(topic.id)
                                                if (res.success) {
                                                    window.location.reload()
                                                    toast.success("Topic deleted")
                                                } else {
                                                    toast.error(res.error || "Failed to delete topic")
                                                }
                                            }}
                                            initialValue={topic.title}
                                            editTitle="Edit Topic"
                                            deleteTitle="Delete Topic?"
                                        />
                                    </div>
                                    <AccordionContent className="pl-4 border-l-2 ml-2">
                                        <DndContext
                                            sensors={sensors}
                                            collisionDetection={closestCenter}
                                            onDragEnd={(e) => handleDragEnd(e, topic.id)}
                                        >
                                            <SortableContext
                                                items={topic.subtopics.map((s: any) => s.id)}
                                                strategy={verticalListSortingStrategy}
                                            >
                                                <ul className="space-y-2">
                                                    {topic.subtopics.map((sub: any) => (
                                                        <SortableSubtopicItem
                                                            key={sub.id}
                                                            sub={sub}
                                                            layers={layers}
                                                        />
                                                    ))}
                                                </ul>
                                            </SortableContext>
                                        </DndContext>
                                        <div className="pt-2">
                                            <SubtopicDialog
                                                title="Add Subtopic"
                                                layers={layers}
                                                trigger={<Button size="sm" variant="outline" className="h-6 text-xs">Add Subtopic</Button>}
                                                onSubmit={async (data) => {
                                                    const res = await createSubtopic({ ...data, topicId: topic.id, orderIndex: 0 })
                                                    if (res.success) window.location.reload()
                                                }}
                                            />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

function SortableSubtopicItem({ sub, layers }: { sub: any, layers: any[] }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: sub.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <li
            ref={setNodeRef}
            style={style}
            className="flex items-center justify-between text-sm text-gray-600 group hover:bg-gray-50 p-1 rounded bg-white border border-transparent hover:border-gray-200"
        >
            <div className="flex items-center flex-1">
                <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 mr-1 text-gray-400 hover:text-gray-600">
                    <GripVertical className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                    <span>{sub.title}</span>
                    {sub.description && <span className="text-xs text-gray-400">{sub.description.substring(0, 50)}...</span>}
                </div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <SubtopicActions
                    subtopic={sub}
                    layers={layers}
                    onEdit={async (data) => {
                        const res = await updateSubtopic(sub.id, data)
                        if (res.success) {
                            window.location.reload()
                            toast.success("Subtopic updated")
                        } else {
                            toast.error("Failed to update subtopic")
                        }
                    }}
                    onDelete={async () => {
                        const res = await deleteSubtopic(sub.id)
                        if (res.success) {
                            window.location.reload()
                            toast.success("Subtopic deleted")
                        } else {
                            toast.error(res.error || "Failed to delete subtopic")
                        }
                    }}
                />
            </div>
        </li>
    );
}

function ItemDialog({ title, label, trigger, onSubmit, initialValue = "" }: { title: string, label: string, trigger?: React.ReactNode, onSubmit: (val: string) => Promise<void>, initialValue?: string }) {
    const [open, setOpen] = useState(false)
    const form = useForm({
        resolver: zodResolver(z.object({ title: z.string().min(1) })),
        defaultValues: { title: initialValue }
    })

    async function handleSubmit(data: { title: string }) {
        await onSubmit(data.title)
        setOpen(false)
        form.reset()
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button>{title}</Button>}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{label}</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                </FormItem>
                            )}
                        />
                        <Button type="submit">Save</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

function ItemActions({ onEdit, onDelete, initialValue, editTitle, deleteTitle, variant = "default" }: {
    onEdit: (val: string) => Promise<void>,
    onDelete: () => Promise<void>,
    initialValue: string,
    editTitle: string,
    deleteTitle: string,
    variant?: "default" | "ghost"
}) {
    const [isEditing, setIsEditing] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e: React.MouseEvent) => { e.stopPropagation(); setIsEditing(true) }}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e: React.MouseEvent) => { e.stopPropagation(); setIsDeleting(true) }} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {isEditing && (
                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                    <DialogContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                        <DialogHeader><DialogTitle>{editTitle}</DialogTitle></DialogHeader>
                        <EditForm initialValue={initialValue} onSubmit={async (val) => {
                            await onEdit(val)
                            setIsEditing(false)
                        }} />
                    </DialogContent>
                </Dialog>
            )}

            <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
                <AlertDialogContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{deleteTitle}</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this item and its contents.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={(e: React.MouseEvent) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={async (e: React.MouseEvent) => {
                            e.stopPropagation()
                            await onDelete()
                            setIsDeleting(false)
                        }} className="bg-red-600">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

function EditForm({ initialValue, onSubmit }: { initialValue: string, onSubmit: (val: string) => Promise<void> }) {
    const form = useForm({
        resolver: zodResolver(z.object({ title: z.string().min(1) })),
        defaultValues: { title: initialValue }
    })

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(async (data) => onSubmit(data.title))} className="space-y-4">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                        </FormItem>
                    )}
                />
                <Button type="submit">Update</Button>
            </form>
        </Form>
    )
}

// --- Subtopic Specific Components ---

function SubtopicDialog({ title, layers, trigger, onSubmit, initialData }: {
    title: string,
    layers: any[],
    trigger?: React.ReactNode,
    onSubmit: (data: any) => Promise<void>,
    initialData?: { title: string, description?: string, requiredLayers?: any[] }
}) {
    const [open, setOpen] = useState(false)

    const form = useForm({
        resolver: zodResolver(z.object({
            title: z.string().min(1, "Title is required"),
            description: z.string().optional(),
            layerIds: z.array(z.string()).optional()
        })),
        defaultValues: {
            title: initialData?.title || "",
            description: initialData?.description || "",
            layerIds: initialData?.requiredLayers?.map((l: any) => l.id) || []
        }
    })

    async function handleSubmit(data: any) {
        await onSubmit(data)
        setOpen(false)
        form.reset()
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button>{title}</Button>}
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder="What should students learn at the end of this layer?"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="layerIds"
                            render={() => (
                                <FormItem>
                                    <FormLabel>Required Layers</FormLabel>
                                    <div className="grid grid-cols-2 gap-2 border p-4 rounded-md">
                                        {layers.map((layer) => (
                                            <FormField
                                                key={layer.id}
                                                control={form.control}
                                                name="layerIds"
                                                render={({ field }) => {
                                                    return (
                                                        <FormItem
                                                            key={layer.id}
                                                            className="flex flex-row items-start space-x-3 space-y-0"
                                                        >
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={field.value?.includes(layer.id)}
                                                                    onCheckedChange={(checked) => {
                                                                        return checked
                                                                            ? field.onChange([...(field.value || []), layer.id])
                                                                            : field.onChange(
                                                                                field.value?.filter(
                                                                                    (value) => value !== layer.id
                                                                                )
                                                                            )
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">
                                                                {layer.name}
                                                            </FormLabel>
                                                        </FormItem>
                                                    )
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <FormDescription>
                                        Select the layers applicable to this subtopic.
                                    </FormDescription>
                                </FormItem>
                            )}
                        />
                        <Button type="submit">Save</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

function SubtopicActions({ subtopic, layers, onEdit, onDelete }: {
    subtopic: any,
    layers: any[],
    onEdit: (data: any) => Promise<void>,
    onDelete: () => Promise<void>
}) {
    const [isEditing, setIsEditing] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e: React.MouseEvent) => { e.stopPropagation(); setIsEditing(true) }}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e: React.MouseEvent) => { e.stopPropagation(); setIsDeleting(true) }} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {isEditing && (
                <SubtopicDialog
                    title="Edit Subtopic"
                    layers={layers}
                    initialData={subtopic}
                    trigger={<span className="hidden"></span>} // Hidden trigger, controlled by open state logic if needed, but here we just use the Dialog directly
                    onSubmit={async (data) => {
                        await onEdit(data)
                        setIsEditing(false)
                    }}
                />
            )}
            {/* Note: The above SubtopicDialog usage is slightly incorrect because it manages its own open state. 
                We need to control it or render it conditionally. 
                Let's render it conditionally and pass open=true prop if we could, but the component manages its own state.
                Better approach: Make SubtopicDialog accept 'open' and 'onOpenChange' props.
            */}

            {isEditing && (
                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                    <DialogContent onClick={(e: React.MouseEvent) => e.stopPropagation()} className="max-w-md">
                        <DialogHeader><DialogTitle>Edit Subtopic</DialogTitle></DialogHeader>
                        <SubtopicForm
                            initialData={subtopic}
                            layers={layers}
                            onSubmit={async (data) => {
                                await onEdit(data)
                                setIsEditing(false)
                            }}
                        />
                    </DialogContent>
                </Dialog>
            )}

            <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
                <AlertDialogContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Subtopic?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this subtopic and its contents.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={(e: React.MouseEvent) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={async (e: React.MouseEvent) => {
                            e.stopPropagation()
                            await onDelete()
                            setIsDeleting(false)
                        }} className="bg-red-600">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

function SubtopicForm({ initialData, layers, onSubmit }: {
    initialData?: { title: string, description?: string, requiredLayers?: any[] },
    layers: any[],
    onSubmit: (data: any) => Promise<void>
}) {
    const form = useForm({
        resolver: zodResolver(z.object({
            title: z.string().min(1, "Title is required"),
            description: z.string().optional(),
            layerIds: z.array(z.string()).optional()
        })),
        defaultValues: {
            title: initialData?.title || "",
            description: initialData?.description || "",
            layerIds: initialData?.requiredLayers?.map((l: any) => l.id) || []
        }
    })

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    {...field}
                                    placeholder="What should students learn at the end of this layer?"
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="layerIds"
                    render={() => (
                        <FormItem>
                            <FormLabel>Required Layers</FormLabel>
                            <div className="grid grid-cols-2 gap-2 border p-4 rounded-md">
                                {layers.map((layer) => (
                                    <FormField
                                        key={layer.id}
                                        control={form.control}
                                        name="layerIds"
                                        render={({ field }) => {
                                            return (
                                                <FormItem
                                                    key={layer.id}
                                                    className="flex flex-row items-start space-x-3 space-y-0"
                                                >
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value?.includes(layer.id)}
                                                            onCheckedChange={(checked) => {
                                                                return checked
                                                                    ? field.onChange([...(field.value || []), layer.id])
                                                                    : field.onChange(
                                                                        field.value?.filter(
                                                                            (value) => value !== layer.id
                                                                        )
                                                                    )
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                        {layer.name}
                                                    </FormLabel>
                                                </FormItem>
                                            )
                                        }}
                                    />
                                ))}
                            </div>
                        </FormItem>
                    )}
                />
                <Button type="submit">Save</Button>
            </form>
        </Form>
    )
}
