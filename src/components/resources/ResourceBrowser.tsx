'use client'

import { useState, useEffect } from "react"
import { getAllResourcesWithFilters, deleteResource } from "@/actions/resource"
import { getLayers, getClasses, getSubjectsByClass, getSubjectDetails } from "@/actions/hierarchy"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    FileText,
    Video,
    FileImage,
    FileQuestion,
    Presentation,
    Network,
    Search,
    Eye,
    Trash2,
    Calendar,
    Layers as LayersIcon,
    Filter
} from "lucide-react"
import { ResourceDetailsModal } from "./ResourceDetailsModal"
import { toast } from "sonner"
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

type Resource = Awaited<ReturnType<typeof getAllResourcesWithFilters>>[number]

const RESOURCE_TYPE_ICONS = {
    QUIZ: FileQuestion,
    VIDEO: Video,
    PRINTABLE: FileText,
    INFOGRAPHICS: FileImage,
    SLIDES: Presentation,
    MINDMAP: Network
}

const RESOURCE_TYPE_COLORS = {
    QUIZ: "bg-blue-100 text-blue-800",
    VIDEO: "bg-purple-100 text-purple-800",
    PRINTABLE: "bg-green-100 text-green-800",
    INFOGRAPHICS: "bg-orange-100 text-orange-800",
    SLIDES: "bg-pink-100 text-pink-800",
    MINDMAP: "bg-teal-100 text-teal-800"
}

const STATUS_COLORS = {
    DRAFT: "bg-gray-100 text-gray-800",
    REVIEW: "bg-yellow-100 text-yellow-800",
    PUBLISHED: "bg-green-100 text-green-800"
}

export function ResourceBrowser() {
    const [resources, setResources] = useState<Resource[]>([])
    const [loading, setLoading] = useState(true)

    // Hierarchy Data
    const [layers, setLayers] = useState<any[]>([])
    const [classes, setClasses] = useState<any[]>([])
    const [subjects, setSubjects] = useState<any[]>([])
    const [topics, setTopics] = useState<any[]>([])
    const [subtopics, setSubtopics] = useState<any[]>([])

    // Filters
    const [searchQuery, setSearchQuery] = useState("")
    const [typeFilter, setTypeFilter] = useState("ALL")
    const [statusFilter, setStatusFilter] = useState("ALL")
    const [layerFilter, setLayerFilter] = useState("ALL")

    const [classFilter, setClassFilter] = useState("ALL")
    const [subjectFilter, setSubjectFilter] = useState("ALL")
    const [topicFilter, setTopicFilter] = useState("ALL")
    const [subtopicFilter, setSubtopicFilter] = useState("ALL")

    // Details modal
    const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null)
    const [detailsModalOpen, setDetailsModalOpen] = useState(false)

    // Initial Load
    useEffect(() => {
        getLayers().then(setLayers)
        getClasses().then(setClasses)
    }, [])

    // Cascading Filters
    useEffect(() => {
        if (classFilter !== "ALL") {
            getSubjectsByClass(classFilter).then(setSubjects)
        } else {
            setSubjects([])
        }
        setSubjectFilter("ALL")
        setTopicFilter("ALL")
        setSubtopicFilter("ALL")
    }, [classFilter])

    useEffect(() => {
        if (subjectFilter !== "ALL") {
            getSubjectDetails(subjectFilter).then((data: any) => {
                if (data) {
                    // Flatten topics from chapters
                    const allTopics = data.chapters.flatMap((c: any) => c.topics)
                    setTopics(allTopics)
                }
            })
        } else {
            setTopics([])
        }
        setTopicFilter("ALL")
        setSubtopicFilter("ALL")
    }, [subjectFilter])

    useEffect(() => {
        if (topicFilter !== "ALL") {
            const topic = topics.find(t => t.id === topicFilter)
            setSubtopics(topic?.subtopics || [])
        } else {
            setSubtopics([])
        }
        setSubtopicFilter("ALL")
    }, [topicFilter, topics])

    // Load Resources
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadResources()
        }, 300) // Debounce search
        return () => clearTimeout(timeoutId)
    }, [typeFilter, statusFilter, layerFilter, searchQuery, classFilter, subjectFilter, topicFilter, subtopicFilter])

    async function loadResources() {
        setLoading(true)
        try {
            const filters = {
                type: typeFilter,
                status: statusFilter,
                layerId: layerFilter,
                searchQuery: searchQuery || undefined,
                classId: classFilter,
                subjectId: subjectFilter,
                topicId: topicFilter,
                subtopicId: subtopicFilter
            }
            const data = await getAllResourcesWithFilters(filters)
            setResources(data)
        } catch (error) {
            console.error("Error loading resources:", error)
            toast.error("Failed to load resources")
        } finally {
            setLoading(false)
        }
    }

    function openDetails(resourceId: string) {
        setSelectedResourceId(resourceId)
        setDetailsModalOpen(true)
    }

    // Delete state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [resourceToDelete, setResourceToDelete] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)

    function confirmDelete(resourceId: string) {
        setResourceToDelete(resourceId)
        setDeleteDialogOpen(true)
    }

    async function handleDelete() {
        if (!resourceToDelete) return

        setDeleting(true)
        try {
            const result = await deleteResource(resourceToDelete)
            if (result.success) {
                toast.success("Resource deleted successfully")
                loadResources()
            } else {
                toast.error(result.error || "Failed to delete resource")
            }
        } catch (error) {
            toast.error("An unexpected error occurred")
        } finally {
            setDeleting(false)
            setDeleteDialogOpen(false)
            setResourceToDelete(null)
        }
    }

    function getResourceIcon(type: string) {
        const Icon = RESOURCE_TYPE_ICONS[type as keyof typeof RESOURCE_TYPE_ICONS] || FileText
        return <Icon className="h-5 w-5" />
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <Card>
                <CardContent className="pt-6 space-y-4">
                    {/* Row 1: Primary Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="lg:col-span-1">
                            <label className="text-sm font-medium mb-2 block">Search</label>
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">Type</label>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Types</SelectItem>
                                    <SelectItem value="QUIZ">Quiz</SelectItem>
                                    <SelectItem value="VIDEO">Video</SelectItem>
                                    <SelectItem value="PRINTABLE">Printable</SelectItem>
                                    <SelectItem value="INFOGRAPHICS">Infographics</SelectItem>
                                    <SelectItem value="SLIDES">Slides</SelectItem>
                                    <SelectItem value="MINDMAP">Mindmap</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">Status</label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Statuses</SelectItem>
                                    <SelectItem value="DRAFT">Draft</SelectItem>
                                    <SelectItem value="REVIEW">Review</SelectItem>
                                    <SelectItem value="PUBLISHED">Published</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">Layer</label>
                            <Select value={layerFilter} onValueChange={setLayerFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Layers" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Layers</SelectItem>
                                    {layers.map(layer => (
                                        <SelectItem key={layer.id} value={layer.id}>
                                            {layer.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Row 2: Hierarchy Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border-t pt-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Class</label>
                            <Select value={classFilter} onValueChange={setClassFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Classes" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Classes</SelectItem>
                                    {classes.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">Subject</label>
                            <Select
                                value={subjectFilter}
                                onValueChange={setSubjectFilter}
                                disabled={classFilter === "ALL"}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Subjects" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Subjects</SelectItem>
                                    {subjects.map(s => (
                                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">Topic</label>
                            <Select
                                value={topicFilter}
                                onValueChange={setTopicFilter}
                                disabled={subjectFilter === "ALL"}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Topics" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Topics</SelectItem>
                                    {topics.map(t => (
                                        <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">Subtopic</label>
                            <Select
                                value={subtopicFilter}
                                onValueChange={setSubtopicFilter}
                                disabled={topicFilter === "ALL"}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Subtopics" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Subtopics</SelectItem>
                                    {subtopics.map(st => (
                                        <SelectItem key={st.id} value={st.id}>{st.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Resources Grid */}
            <div>
                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">Loading resources...</p>
                    </div>
                ) : resources.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-lg font-medium mb-2">No resources found</p>
                            <p className="text-sm text-muted-foreground">
                                {searchQuery || typeFilter !== "ALL" || statusFilter !== "ALL" || layerFilter !== "ALL" || classFilter !== "ALL"
                                    ? "Try adjusting your filters"
                                    : "Start by creating your first resource"}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {resources.map((resource) => (
                            <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        {/* Header */}
                                        <div className="flex items-start justify-between">
                                            <div className={`p-2 rounded-lg ${RESOURCE_TYPE_COLORS[resource.type as keyof typeof RESOURCE_TYPE_COLORS]}`}>
                                                {getResourceIcon(resource.type)}
                                            </div>
                                            <Badge className={STATUS_COLORS[resource.status as keyof typeof STATUS_COLORS]}>
                                                {resource.status}
                                            </Badge>
                                        </div>

                                        {/* Title */}
                                        <div>
                                            <h3 className="font-semibold text-lg line-clamp-2 mb-1">
                                                {resource.title}
                                            </h3>
                                            {resource.description && (
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {resource.description}
                                                </p>
                                            )}
                                        </div>

                                        {/* Metadata */}
                                        <div className="space-y-2 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <LayersIcon className="h-3 w-3" />
                                                <span>{resource.layer.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-3 w-3" />
                                                <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="text-xs">
                                                <span className="font-medium">
                                                    {resource.topic.chapter.subject.class.name}
                                                </span>
                                                {" • "}
                                                <span>{resource.topic.chapter.subject.name}</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 pt-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => openDetails(resource.id)}
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                View
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => confirmDelete(resource.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Details Modal */}
            {selectedResourceId && (
                <ResourceDetailsModal
                    resourceId={selectedResourceId}
                    open={detailsModalOpen}
                    onOpenChange={(open: boolean) => {
                        setDetailsModalOpen(open)
                        if (!open) setSelectedResourceId(null)
                    }}
                    onUpdate={loadResources}
                />
            )}

            {/* Delete Confirmation Dialog */}
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
        </div>
    )
}
