'use client'

import { useState, useEffect } from 'react'
import { LearningPathNavigator, NavItem } from './LearningPathNavigator'
import { LayerAccordion } from './LayerAccordion'
import { getLearningPathResources, updateResourceOrder } from '@/actions/resource'
import { getLayers } from '@/actions/hierarchy'
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"

export function LearningPathView() {
    const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null)
    const [selectedSubtopicId, setSelectedSubtopicId] = useState<string | null>(null)

    const [resources, setResources] = useState<Record<string, any[]>>({})
    const [layers, setLayers] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [navItems, setNavItems] = useState<NavItem[]>([])

    // Load Layers on mount
    useEffect(() => {
        getLayers().then(data => setLayers(data))
    }, [])

    // Fetch resources when selection changes
    useEffect(() => {
        if (!selectedTopicId) {
            setResources({})
            return
        }

        async function fetchResources() {
            setLoading(true)
            setError('')
            try {
                const result = await getLearningPathResources(selectedTopicId!, selectedSubtopicId)
                if (result.success && result.data) {
                    setResources(result.data)
                } else {
                    setError(result.error || 'Failed to fetch resources')
                }
            } catch (err) {
                setError('An unexpected error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchResources()
    }, [selectedTopicId, selectedSubtopicId])

    async function handleReorder(resourceId: string, direction: 'up' | 'down') {
        // Find the layer containing the resource
        let targetLayerName = ''
        let layerResources: any[] = []

        for (const [name, resList] of Object.entries(resources)) {
            if (resList.find(r => r.id === resourceId)) {
                targetLayerName = name
                layerResources = [...resList]
                break
            }
        }

        if (!targetLayerName) return

        const index = layerResources.findIndex(r => r.id === resourceId)
        if (index === -1) return
        if (direction === 'up' && index === 0) return
        if (direction === 'down' && index === layerResources.length - 1) return

        const swapIndex = direction === 'up' ? index - 1 : index + 1

        // Swap
        const temp = layerResources[index]
        layerResources[index] = layerResources[swapIndex]
        layerResources[swapIndex] = temp

        // Optimistic Update
        setResources(prev => ({
            ...prev,
            [targetLayerName]: layerResources
        }))

        // Prepare update payload
        const updates = layerResources.map((res, idx) => ({
            id: res.id,
            orderIndex: idx
        }))

        try {
            const result = await updateResourceOrder(updates)
            if (!result.success) {
                toast.error("Failed to save order")
                // Revert logic could go here, for now we rely on user refreshing if it fails
            }
        } catch (error) {
            toast.error("Failed to save order")
        }
    }

    // Navigation Handlers
    const handleNext = () => {
        if (!selectedTopicId || navItems.length === 0) return

        const currentIndex = navItems.findIndex(item => item.id === selectedTopicId)
        if (currentIndex !== -1 && currentIndex < navItems.length - 1) {
            // Navigation logic placeholder
        }
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Learning Path</h1>
            </div>

            <LearningPathNavigator
                onSelect={(tId, stId) => {
                    setSelectedTopicId(tId)
                    setSelectedSubtopicId(stId)
                }}
                onNavigationListChange={setNavItems}
            />

            {selectedTopicId ? (
                <div className="space-y-6">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : error ? (
                        <Alert variant="destructive">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    ) : (
                        <div className="space-y-8">
                            {/* Render Layers in Order */}
                            {layers.map(layer => {
                                const layerResources = resources[layer.name]
                                if (!layerResources || layerResources.length === 0) return null

                                return (
                                    <LayerAccordion
                                        key={layer.id}
                                        layerName={layer.name}
                                        resources={layerResources}
                                        defaultOpen={true}
                                        onReorder={handleReorder}
                                    />
                                )
                            })}

                            {/* Render Uncategorized if any */}
                            {resources['Uncategorized'] && resources['Uncategorized'].length > 0 && (
                                <LayerAccordion
                                    layerName="Uncategorized"
                                    resources={resources['Uncategorized']}
                                    defaultOpen={true}
                                    onReorder={handleReorder}
                                />
                            )}

                            {Object.keys(resources).length === 0 && (
                                <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                                    No resources found for this topic.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-20 bg-muted/10 rounded-lg border border-dashed">
                    <h3 className="text-lg font-medium text-muted-foreground">
                        Select a topic to view the learning path
                    </h3>
                </div>
            )}
        </div>
    )
}
