'use client'

import { useState, useEffect } from "react"
import { getResourceById, deleteResource } from "@/actions/resource"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
    FileText,
    Video,
    FileImage,
    FileQuestion,
    Presentation,
    Network,
    Download,
    Edit,
    Trash2,
    Calendar,
    User,
    Layers as LayersIcon,
    ChevronRight,
    Globe,
    BarChart3
} from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { DocumentViewer } from "./DocumentViewer"

type Resource = Awaited<ReturnType<typeof getResourceById>>

const RESOURCE_TYPE_ICONS = {
    QUIZ: FileQuestion,
    VIDEO: Video,
    PRINTABLE: FileText,
    INFOGRAPHICS: FileImage,
    SLIDES: Presentation,
    MINDMAP: Network
}

const STATUS_COLORS = {
    DRAFT: "bg-gray-100 text-gray-800",
    REVIEW: "bg-yellow-100 text-yellow-800",
    PUBLISHED: "bg-green-100 text-green-800"
}

interface ResourceDetailsModalProps {
    resourceId: string
    open: boolean
    onOpenChange: (open: boolean) => void
    onUpdate?: () => void
}

export function ResourceDetailsModal({
    resourceId,
    open,
    onOpenChange,
    onUpdate
}: ResourceDetailsModalProps) {
    const [resource, setResource] = useState<Resource>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        if (open && resourceId) {
            loadResource()
        }
    }, [resourceId, open])

    async function loadResource() {
        setLoading(true)
        try {
            const data = await getResourceById(resourceId)
            setResource(data)
        } catch (error) {
            console.error("Error loading resource:", error)
            toast.error("Failed to load resource details")
        } finally {
            setLoading(false)
        }
    }

    // Delete state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)

    async function handleDelete() {
        setDeleting(true)
        try {
            const result = await deleteResource(resourceId)
            if (result.success) {
                toast.success("Resource deleted successfully")
                setDeleteDialogOpen(false)
                onOpenChange(false)
                onUpdate?.()
            } else {
                toast.error(result.error || "Failed to delete resource")
            }
        } catch (error) {
            toast.error("An unexpected error occurred")
        } finally {
            setDeleting(false)
        }
    }

    function getResourceIcon(type: string) {
        const Icon = RESOURCE_TYPE_ICONS[type as keyof typeof RESOURCE_TYPE_ICONS] || FileText
        return <Icon className="h-6 w-6" />
    }

    function renderFilePreview() {
        if (!resource?.fileUrl) return null

        const isVideo = resource.mimeType?.startsWith('video/')
        const isImage = resource.mimeType?.startsWith('image/')
        const isDocument = resource.mimeType?.includes('pdf') ||
            resource.mimeType?.includes('wordprocessingml') ||
            resource.mimeType?.includes('text') ||
            resource.fileName?.match(/\.(pdf|docx?|txt)$/i)

        if (isVideo) {
            return (
                <div className="space-y-2">
                    <h3 className="font-semibold text-sm">Video Preview</h3>
                    <video
                        controls
                        className="w-full rounded-lg border"
                        src={resource.fileUrl}
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>
            )
        }

        if (isImage) {
            return (
                <div className="space-y-2">
                    <h3 className="font-semibold text-sm">Image Preview</h3>
                    <img
                        src={resource.fileUrl}
                        alt={resource.title}
                        className="w-full rounded-lg border"
                    />
                </div>
            )
        }

        if (isDocument) {
            return (
                <DocumentViewer
                    fileUrl={resource.fileUrl}
                    fileName={resource.fileName || 'document'}
                    mimeType={resource.mimeType || 'application/octet-stream'}
                />
            )
        }

        return null
    }

    if (loading) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Loading Resource...</DialogTitle>
                    </DialogHeader>
                    <div className="py-12 text-center">
                        <p className="text-muted-foreground">Please wait while we fetch the details.</p>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    if (!resource) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Error</DialogTitle>
                    </DialogHeader>
                    <div className="py-12 text-center">
                        <p className="text-muted-foreground">Resource not found</p>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent
                    className="w-[90vw] max-w-[1000px] max-h-[90vh] overflow-y-auto min-w-[500px]"
                    style={{ resize: 'both', overflow: 'auto' }}
                >
                    <DialogHeader>
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    {getResourceIcon(resource.type)}
                                </div>
                                <div>
                                    <DialogTitle className="text-2xl">{resource.title}</DialogTitle>
                                    <DialogDescription className="mt-1">
                                        {resource.description || "No description provided"}
                                    </DialogDescription>
                                </div>
                            </div>
                            <Badge className={STATUS_COLORS[resource.status as keyof typeof STATUS_COLORS]}>
                                {resource.status}
                            </Badge>
                        </div>
                    </DialogHeader>

                    <div className="space-y-6 mt-4">
                        {/* Hierarchy Path */}
                        <div className="bg-muted/50 rounded-lg p-4">
                            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                <LayersIcon className="h-4 w-4" />
                                Content Hierarchy
                            </h3>
                            <div className="flex items-center gap-2 text-sm flex-wrap">
                                <span className="font-medium">{resource.topic.chapter.subject.class.name}</span>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                <span>{resource.topic.chapter.subject.name}</span>
                                {resource.topic.chapter.subject.board && (
                                    <>
                                        <span className="text-muted-foreground">({resource.topic.chapter.subject.board})</span>
                                    </>
                                )}
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                <span>{resource.topic.chapter.title}</span>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium text-primary">{resource.topic.title}</span>
                                {resource.subtopic && (
                                    <>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">{resource.subtopic.title}</span>
                                    </>
                                )}
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                <Badge variant="outline">{resource.layer.name}</Badge>
                            </div>
                        </div>

                        <Separator />

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Type
                                </p>
                                <p className="font-semibold">{resource.type.replace('_', ' ')}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Globe className="h-4 w-4" />
                                    Language
                                </p>
                                <p className="font-semibold">{resource.language.toUpperCase()}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4" />
                                    Difficulty
                                </p>
                                <p className="font-semibold capitalize">{resource.difficulty}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Created
                                </p>
                                <p className="font-semibold">
                                    {new Date(resource.createdAt).toLocaleDateString()}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Created By
                                </p>
                                <p className="font-semibold">
                                    {resource.createdBy.name || resource.createdBy.email}
                                </p>
                            </div>

                            {resource.updatedBy && (
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Updated By
                                    </p>
                                    <p className="font-semibold">
                                        {resource.updatedBy.name || resource.updatedBy.email}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Tags */}
                        {resource.tags && Array.isArray(resource.tags) && resource.tags.length > 0 && (
                            <>
                                <Separator />
                                <div>
                                    <h3 className="font-semibold text-sm mb-2">Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {(resource.tags as string[]).map((tag, index) => (
                                            <Badge key={index} variant="secondary">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* File Info */}
                        {resource.fileUrl && (
                            <>
                                <Separator />
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-sm">File Information</h3>
                                        <Button variant="outline" size="sm" asChild>
                                            <a href={resource.fileUrl} download={resource.fileName} target="_blank">
                                                <Download className="h-4 w-4 mr-2" />
                                                Download
                                            </a>
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="text-muted-foreground">Filename</p>
                                            <p className="font-medium">{resource.fileName}</p>
                                        </div>
                                        {resource.fileSize && (
                                            <div>
                                                <p className="text-muted-foreground">Size</p>
                                                <p className="font-medium">
                                                    {(resource.fileSize / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* File Preview */}
                                    {renderFilePreview()}
                                </div>
                            </>
                        )}

                        {/* Content (for QUIZ/MINDMAP) */}
                        {resource.content && (
                            <>
                                <Separator />
                                <div>
                                    <h3 className="font-semibold text-sm mb-2">Content</h3>
                                    <div className="bg-muted/50 rounded-lg p-4 max-h-60 overflow-y-auto">
                                        <pre className="text-sm whitespace-pre-wrap">
                                            {resource.content}
                                        </pre>
                                    </div>
                                </div>
                            </>
                        )}

                        <Separator />

                        {/* Actions */}
                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    router.push(`/dashboard/resources/edit/${resourceId}`)
                                    onOpenChange(false)
                                }}
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => setDeleteDialogOpen(true)}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the resource.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault()
                                handleDelete()
                            }}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={deleting}
                        >
                            {deleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
