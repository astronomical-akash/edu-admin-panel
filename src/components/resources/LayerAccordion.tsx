'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Edit, Trash2, FileText, Video, Image as ImageIcon, Presentation, BrainCircuit, ArrowUp, ArrowDown } from "lucide-react"
import { DocumentViewer } from "./DocumentViewer"
import { QuizPlayer } from "./QuizPlayer"

// Define types locally or import from prisma/types
type Resource = {
    id: string
    title: string
    type: 'QUIZ' | 'VIDEO' | 'PRINTABLE' | 'INFOGRAPHICS' | 'SLIDES' | 'MINDMAP'
    content: any
    fileUrl?: string | null
    fileName?: string | null
    mimeType?: string | null
    description?: string | null
    orderIndex?: number
}

type LayerAccordionProps = {
    layerName: string
    resources: Resource[]
    defaultOpen?: boolean
    onEdit?: (resource: Resource) => void
    onDelete?: (resourceId: string) => void
    onReorder?: (resourceId: string, direction: 'up' | 'down') => void
}

export function LayerAccordion({ layerName, resources, defaultOpen = false, onEdit, onDelete, onReorder }: LayerAccordionProps) {
    if (!resources || resources.length === 0) return null

    const getIcon = (type: string) => {
        switch (type) {
            case 'QUIZ': return <BrainCircuit className="h-4 w-4" />
            case 'VIDEO': return <Video className="h-4 w-4" />
            case 'PRINTABLE': return <FileText className="h-4 w-4" />
            case 'INFOGRAPHICS': return <ImageIcon className="h-4 w-4" />
            case 'SLIDES': return <Presentation className="h-4 w-4" />
            default: return <FileText className="h-4 w-4" />
        }
    }

    const getBadgeColor = (type: string) => {
        switch (type) {
            case 'QUIZ': return "bg-purple-100 text-purple-800 hover:bg-purple-100"
            case 'VIDEO': return "bg-blue-100 text-blue-800 hover:bg-blue-100"
            case 'PRINTABLE': return "bg-orange-100 text-orange-800 hover:bg-orange-100"
            case 'INFOGRAPHICS': return "bg-pink-100 text-pink-800 hover:bg-pink-100"
            case 'SLIDES': return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
            default: return "bg-gray-100 text-gray-800 hover:bg-gray-100"
        }
    }

    return (
        <Accordion type="single" collapsible defaultValue={defaultOpen ? "item-1" : undefined} className="w-full border rounded-lg bg-white shadow-sm mb-4">
            <AccordionItem value="item-1" className="border-none">
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50 rounded-t-lg">
                    <div className="flex items-center gap-3">
                        <span className="font-semibold text-lg">{layerName}</span>
                        <Badge variant="secondary" className="rounded-full px-3">
                            {resources.length} resource{resources.length !== 1 ? 's' : ''}
                        </Badge>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-2 space-y-8">
                    {resources.map((resource, index) => (
                        <div key={resource.id} className="relative pl-8 border-l-2 border-gray-100 last:border-0 pb-8 last:pb-0">
                            {/* Timeline dot */}
                            <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-white border-2 border-primary ring-4 ring-white" />

                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Badge className={getBadgeColor(resource.type)}>
                                                <span className="flex items-center gap-1">
                                                    {getIcon(resource.type)}
                                                    {resource.type}
                                                </span>
                                            </Badge>
                                            <h3 className="text-lg font-medium">{resource.title}</h3>
                                        </div>
                                        {resource.description && (
                                            <p className="text-muted-foreground text-sm">{resource.description}</p>
                                        )}
                                    </div>

                                    {(onEdit || onDelete || onReorder) && (
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {onReorder && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => onReorder(resource.id, 'up')}
                                                        disabled={index === 0}
                                                        title="Move Up"
                                                    >
                                                        <ArrowUp className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => onReorder(resource.id, 'down')}
                                                        disabled={index === resources.length - 1}
                                                        title="Move Down"
                                                    >
                                                        <ArrowDown className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                            {onEdit && (
                                                <Button variant="ghost" size="icon" onClick={() => onEdit(resource)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            )}
                                            {onDelete && (
                                                <Button variant="ghost" size="icon" onClick={() => onDelete(resource.id)} className="text-red-500 hover:text-red-600">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Resource Content Viewer */}
                                <div className="mt-4">
                                    {resource.type === 'QUIZ' && resource.content && (
                                        <QuizPlayer
                                            content={typeof resource.content === 'string' ? JSON.parse(resource.content) : resource.content}
                                            title={resource.title}
                                        />
                                    )}

                                    {resource.type === 'VIDEO' && resource.fileUrl && (
                                        <div className="aspect-video rounded-lg overflow-hidden bg-black">
                                            <video
                                                src={resource.fileUrl}
                                                controls
                                                className="w-full h-full"
                                                poster="/video-placeholder.png" // Optional
                                            />
                                        </div>
                                    )}

                                    {(resource.type === 'PRINTABLE' || resource.type === 'SLIDES' || resource.type === 'INFOGRAPHICS') && resource.fileUrl && (
                                        <DocumentViewer
                                            fileUrl={resource.fileUrl}
                                            fileName={resource.fileName || resource.title}
                                            mimeType={resource.mimeType || 'application/pdf'}
                                        />
                                    )}

                                    {/* Fallback for missing content */}
                                    {!resource.fileUrl && !resource.content && (
                                        <Card className="bg-muted/30 border-dashed">
                                            <CardContent className="flex items-center justify-center py-8 text-muted-foreground">
                                                No content available for this resource.
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}
