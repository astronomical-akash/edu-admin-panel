'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createResource, updateResource } from "@/actions/resource"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { QuizBuilder, QuizData } from "./QuizBuilder"
import { FileUp } from "lucide-react"

const FormSchema = z.object({
    title: z.string().min(1, "Title is required"),
    type: z.enum(["QUIZ", "VIDEO", "PRINTABLE", "INFOGRAPHICS", "SLIDES", "MINDMAP"]),
    description: z.string().optional(),
    content: z.string().optional(),
    topicId: z.string().min(1),
    subtopicId: z.string().optional(),
    layerId: z.string().min(1),
})

interface ResourceFormProps {
    prefilledData?: {
        topicId: string
        subtopicId: string | null
        layerId: string
    }
    initialData?: any // Resource object for editing
    onSuccess?: () => void
}

export function ResourceForm({ prefilledData, initialData, onSuccess }: ResourceFormProps) {
    const [file, setFile] = useState<File | null>(null)
    const [quizData, setQuizData] = useState<QuizData>(
        initialData?.type === 'QUIZ' && initialData.content
            ? JSON.parse(initialData.content)
            : { quiz: [] }
    )
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            title: initialData?.title || "",
            type: initialData?.type || "QUIZ",
            description: initialData?.description || "",
            content: initialData?.type === 'MINDMAP' ? initialData.content : "",
            topicId: initialData?.topicId || prefilledData?.topicId || "",
            subtopicId: initialData?.subtopicId || prefilledData?.subtopicId || "",
            layerId: initialData?.layerId || prefilledData?.layerId || "",
        }
    })

    const resourceType = form.watch("type")

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        setLoading(true)
        setError(null)

        try {
            const formData = new FormData()

            // Add all form fields
            Object.entries(data).forEach(([key, value]) => {
                if (value) formData.append(key, value)
            })

            // Add type-specific data
            if (data.type === "QUIZ") {
                if (quizData.quiz.length === 0) {
                    setError("Please add at least one question to the quiz")
                    setLoading(false)
                    return
                }
                formData.set('content', JSON.stringify(quizData))
            } else if (data.type === "MINDMAP") {
                formData.set('content', data.content || '')
            }

            // Add file if present
            if (file) {
                formData.append('file', file)
            } else if (!initialData && ['VIDEO', 'PRINTABLE', 'INFOGRAPHICS', 'SLIDES'].includes(data.type)) {
                // Only require file if creating new resource
                setError(`Please upload a file for ${data.type} type`)
                setLoading(false)
                return
            }

            let res;
            if (initialData) {
                res = await updateResource(initialData.id, formData)
            } else {
                res = await createResource(formData)
            }

            console.log("Resource creation response:", res)

            if (res && res.success) {
                console.log("Success! Calling onSuccess callback")
                onSuccess?.()
            } else {
                console.log("Failed with error:", res?.error)
                setError(typeof res?.error === 'string' ? res.error : JSON.stringify(res?.error || "Unknown error"))
            }
        } catch (err) {
            console.error("Error saving resource:", err)
            setError(err instanceof Error ? err.message : "Unknown error occurred")
        } finally {
            setLoading(false)
        }
    }

    function renderTypeSpecificFields() {
        switch (resourceType) {
            case "QUIZ":
                return (
                    <div className="space-y-4">
                        <QuizBuilder value={quizData} onChange={setQuizData} />
                    </div>
                )

            case "VIDEO":
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <FormLabel>Upload Video File</FormLabel>
                            <div className="border-2 border-dashed rounded-lg p-6 text-center">
                                <Input
                                    type="file"
                                    accept="video/*"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    className="max-w-sm mx-auto"
                                />
                                {file && (
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                    </p>
                                )}
                            </div>
                        </div>
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Video Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder="Describe what this video teaches..."
                                            rows={4}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                )

            case "PRINTABLE":
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <FormLabel>Upload Printable (PDF/Word/Text)</FormLabel>
                            <div className="border-2 border-dashed rounded-lg p-6 text-center">
                                <Input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.txt"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    className="max-w-sm mx-auto"
                                />
                                {file && (
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                                    </p>
                                )}
                            </div>
                            <FormDescription>
                                Accepted formats: PDF, Word (.doc, .docx), Text (.txt)
                            </FormDescription>
                        </div>
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Printable Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder="Describe the content of this printable..."
                                            rows={4}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                )

            case "INFOGRAPHICS":
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <FormLabel>Upload Infographic Image</FormLabel>
                            <div className="border-2 border-dashed rounded-lg p-6 text-center">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    className="max-w-sm mx-auto"
                                />
                                {file && (
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                                    </p>
                                )}
                            </div>
                            <FormDescription>
                                Accepted formats: PNG, JPG, JPEG, SVG
                            </FormDescription>
                        </div>
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Infographic Description / Alt Text</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder="Describe the infographic content..."
                                            rows={4}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                )

            case "SLIDES":
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <FormLabel>Upload Slides (PDF)</FormLabel>
                            <div className="border-2 border-dashed rounded-lg p-6 text-center">
                                <Input
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    className="max-w-sm mx-auto"
                                />
                                {file && (
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                                    </p>
                                )}
                            </div>
                            <FormDescription>
                                Upload slides in PDF format
                            </FormDescription>
                        </div>
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Slides Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder="Describe the slides content..."
                                            rows={4}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                )

            case "MINDMAP":
                return (
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mindmap (Markdown Format)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder="# Main Topic&#10;## Subtopic 1&#10;- Point 1&#10;- Point 2&#10;&#10;## Subtopic 2&#10;- Point A&#10;- Point B"
                                            rows={12}
                                            className="font-mono text-sm"
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Use Markdown syntax to create a structured mindmap
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mindmap Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder="Brief description of this mindmap..."
                                            rows={3}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                )

            default:
                return null
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-md">
                        <p className="font-medium">Error</p>
                        <p className="text-sm mt-1">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Resource Title</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="e.g., Introduction to Variables" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Resource Type</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="QUIZ">Quiz (MCQ)</SelectItem>
                                        <SelectItem value="VIDEO">Video</SelectItem>
                                        <SelectItem value="PRINTABLE">Printable (PDF/Word)</SelectItem>
                                        <SelectItem value="INFOGRAPHICS">Infographics</SelectItem>
                                        <SelectItem value="SLIDES">Slides (PDF)</SelectItem>
                                        <SelectItem value="MINDMAP">Mindmap (Markdown)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Card>
                    <CardContent className="pt-6">
                        {renderTypeSpecificFields()}
                    </CardContent>
                </Card>

                <div className="flex gap-2">
                    <Button type="submit" disabled={loading}>
                        {loading ? "Saving..." : (initialData ? "Save Changes" : "Create Resource")}
                    </Button>
                    {onSuccess && (
                        <Button type="button" variant="outline" onClick={onSuccess}>
                            Cancel
                        </Button>
                    )}
                </div>
            </form>
        </Form>
    )
}
