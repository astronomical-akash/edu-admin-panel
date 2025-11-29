'use client'

import { useState, useEffect } from "react"
import { getClasses, getSubjectsByClass, getSubjectDetails, getLayers } from "@/actions/hierarchy"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus, Circle, CircleDot, CircleDashed } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ResourceForm } from "./ResourceForm"

type Layer = {
    id: string
    name: string
}

type TopicRow = {
    topicId: string
    topicTitle: string
    subtopicId: string | null
    subtopicTitle: string | null
    chapterTitle: string
    layerStatuses: Record<string, 'empty' | 'partial' | 'complete'>
    requiredLayerIds?: string[]
}

export function ResourceTableView() {
    const [classes, setClasses] = useState<any[]>([])
    const [subjects, setSubjects] = useState<any[]>([])
    const [layers, setLayers] = useState<Layer[]>([])
    const [selectedClass, setSelectedClass] = useState<string>("")
    const [selectedSubject, setSelectedSubject] = useState<string>("")
    const [topicRows, setTopicRows] = useState<TopicRow[]>([])
    const [loading, setLoading] = useState(false)

    // Resource form dialog state
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selectedRow, setSelectedRow] = useState<{
        topicId: string
        subtopicId: string | null
        layerId: string
        chapterTitle: string
        topicTitle: string
        subtopicTitle: string | null
        layerName: string
    } | null>(null)

    // Load classes and layers on mount
    useEffect(() => {
        getClasses().then(setClasses)
        getLayers().then(setLayers)
    }, [])

    // Load subjects when class changes
    useEffect(() => {
        if (selectedClass) {
            getSubjectsByClass(selectedClass).then(setSubjects)
            setSelectedSubject("")
            setTopicRows([])
        }
    }, [selectedClass])

    // Load topics and build table when subject changes
    useEffect(() => {
        if (selectedSubject) {
            loadTopicsTable()
        }
    }, [selectedSubject])

    async function loadTopicsTable() {
        setLoading(true)
        try {
            const subjectData: any = await getSubjectDetails(selectedSubject)
            if (!subjectData) return

            const rows: TopicRow[] = []

            for (const chapter of subjectData.chapters) {
                for (const topic of chapter.topics) {
                    // Add row for topic itself
                    const layerStatuses: Record<string, 'empty' | 'partial' | 'complete'> = {}

                    for (const layer of layers) {
                        // Check if topic has resources for this layer
                        const hasResource = topic.resources?.some((r: any) => r.layerId === layer.id)
                        layerStatuses[layer.id] = hasResource ? 'complete' : 'empty'
                    }

                    rows.push({
                        topicId: topic.id,
                        topicTitle: topic.title,
                        subtopicId: null,
                        subtopicTitle: null,
                        chapterTitle: chapter.title,
                        layerStatuses
                    })

                    // Add rows for each subtopic
                    for (const subtopic of topic.subtopics) {
                        const subtopicLayerStatuses: Record<string, 'empty' | 'partial' | 'complete'> = {}
                        const requiredLayerIds = subtopic.requiredLayers?.map((l: any) => l.id) || []

                        for (const layer of layers) {
                            // Check if subtopic has resources for this layer
                            const hasResource = subtopic.resources?.some((r: any) => r.layerId === layer.id)
                            subtopicLayerStatuses[layer.id] = hasResource ? 'complete' : 'empty'
                        }

                        rows.push({
                            topicId: topic.id,
                            topicTitle: topic.title,
                            subtopicId: subtopic.id,
                            subtopicTitle: subtopic.title,
                            chapterTitle: chapter.title,
                            layerStatuses: subtopicLayerStatuses,
                            requiredLayerIds
                        })
                    }
                }
            }

            setTopicRows(rows)
        } catch (error) {
            console.error("Error loading topics:", error)
        } finally {
            setLoading(false)
        }
    }

    function openResourceDialog(row: TopicRow, layerId: string) {
        const layer = layers.find(l => l.id === layerId)
        setSelectedRow({
            topicId: row.topicId,
            subtopicId: row.subtopicId,
            layerId: layerId,
            chapterTitle: row.chapterTitle,
            topicTitle: row.topicTitle,
            subtopicTitle: row.subtopicTitle,
            layerName: layer?.name || ''
        })
        setDialogOpen(true)
    }

    function viewResources(row: TopicRow, layerId: string) {
        // Switch to browse tab and filter
        const tabs = document.querySelector('[role="tablist"]');
        if (tabs) {
            const browseTab = tabs.querySelector('[value="browse"]') as HTMLElement;
            if (browseTab) browseTab.click();
        }
    }

    function getStatusIcon(status: 'empty' | 'partial' | 'complete') {
        switch (status) {
            case 'empty':
                return <Circle className="h-4 w-4 text-gray-300" />
            case 'partial':
                return <CircleDashed className="h-4 w-4 text-yellow-500" />
            case 'complete':
                return <CircleDot className="h-4 w-4 text-green-500" />
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Select Class and Subject</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Class</label>
                            <Select value={selectedClass} onValueChange={setSelectedClass}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Class" />
                                </SelectTrigger>
                                <SelectContent>
                                    {classes.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Subject</label>
                            <Select
                                value={selectedSubject}
                                onValueChange={setSelectedSubject}
                                disabled={!subjects.length}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Subject" />
                                </SelectTrigger>
                                <SelectContent>
                                    {subjects.map(s => (
                                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {selectedSubject && (
                <Card>
                    <CardHeader>
                        <CardTitle>Resource Management Table</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">Loading...</div>
                        ) : topicRows.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No topics found for this subject
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Chapter</TableHead>
                                            <TableHead>Topic</TableHead>
                                            <TableHead>Subtopic</TableHead>
                                            {layers.map(layer => (
                                                <TableHead key={layer.id} className="text-center">
                                                    {layer.name}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {topicRows.map((row, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell className="font-medium">{row.chapterTitle}</TableCell>
                                                <TableCell>{row.topicTitle}</TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {row.subtopicTitle || '—'}
                                                </TableCell>
                                                {layers.map(layer => {
                                                    const isDiagnostic = layer.name.toLowerCase().includes('diagnostic')
                                                    const isLayer1 = layer.name.toLowerCase().includes('layer 1')
                                                    const isLayer2 = layer.name.toLowerCase().includes('layer 2')
                                                    const hasSubtopic = !!row.subtopicId

                                                    // Logic for Subtopics:
                                                    // If requiredLayerIds is present (length > 0), check if this layer is in it.
                                                    // If not in it, render blank.
                                                    if (hasSubtopic && row.requiredLayerIds && row.requiredLayerIds.length > 0) {
                                                        if (!row.requiredLayerIds.includes(layer.id)) {
                                                            return <TableCell key={layer.id} className="bg-gray-50/50"></TableCell>
                                                        }
                                                    }

                                                    // Fallback/Legacy Logic for Topics or Subtopics without specific requirements:
                                                    let isDisabled = false
                                                    if (isDiagnostic && hasSubtopic) isDisabled = true
                                                    if ((isLayer1 || isLayer2) && !hasSubtopic) isDisabled = true

                                                    return (
                                                        <TableCell key={layer.id} className="text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                {getStatusIcon(row.layerStatuses[layer.id])}
                                                                <div className="flex flex-col gap-1">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="h-6 text-xs"
                                                                        onClick={() => openResourceDialog(row, layer.id)}
                                                                        disabled={isDisabled}
                                                                    >
                                                                        <Plus className="h-3 w-3 mr-1" />
                                                                        Add
                                                                    </Button>
                                                                    {row.layerStatuses[layer.id] === 'complete' && (
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            className="h-6 text-xs text-blue-600 hover:text-blue-800"
                                                                            onClick={() => viewResources(row, layer.id)}
                                                                        >
                                                                            View
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                    )
                                                })}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            Add Resource: {selectedRow?.topicTitle}
                            {selectedRow?.subtopicTitle && ` → ${selectedRow.subtopicTitle}`}
                            {' '}({selectedRow?.layerName})
                        </DialogTitle>
                    </DialogHeader>
                    {selectedRow && (
                        <ResourceForm
                            prefilledData={{
                                topicId: selectedRow.topicId,
                                subtopicId: selectedRow.subtopicId,
                                layerId: selectedRow.layerId
                            }}
                            onSuccess={() => {
                                setDialogOpen(false)
                                loadTopicsTable() // Refresh the table
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
