'use client'

import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { getClasses, getSubjectsByClass, getChaptersBySubject, getTopicsByChapter, getSubtopicsByTopic } from "@/actions/hierarchy"
import { Loader2 } from "lucide-react"

export type NavItem = {
    id: string
    title: string
    type: 'TOPIC' | 'SUBTOPIC'
    parentId?: string
}

type LearningPathNavigatorProps = {
    onSelect: (topicId: string, subtopicId: string | null) => void
    onNavigationListChange: (items: NavItem[]) => void
}

export function LearningPathNavigator({ onSelect, onNavigationListChange }: LearningPathNavigatorProps) {
    // Data states
    const [classes, setClasses] = useState<any[]>([])
    const [subjects, setSubjects] = useState<any[]>([])
    const [chapters, setChapters] = useState<any[]>([])
    const [topics, setTopics] = useState<any[]>([])
    const [subtopics, setSubtopics] = useState<any[]>([])

    // Selection states
    const [selectedClass, setSelectedClass] = useState<string>('')
    const [selectedSubject, setSelectedSubject] = useState<string>('')
    const [selectedChapter, setSelectedChapter] = useState<string>('')
    const [selectedTopic, setSelectedTopic] = useState<string>('')
    const [selectedSubtopic, setSelectedSubtopic] = useState<string | null>(null)

    // Loading states
    const [loading, setLoading] = useState({
        classes: false,
        subjects: false,
        chapters: false,
        topics: false,
        subtopics: false
    })

    // Initial load
    useEffect(() => {
        loadClasses()
    }, [])

    async function loadClasses() {
        setLoading(prev => ({ ...prev, classes: true }))
        const data = await getClasses()
        setClasses(data)
        setLoading(prev => ({ ...prev, classes: false }))
    }

    // Cascading loads
    useEffect(() => {
        if (selectedClass) {
            setLoading(prev => ({ ...prev, subjects: true }))
            getSubjectsByClass(selectedClass).then(data => {
                setSubjects(data)
                setLoading(prev => ({ ...prev, subjects: false }))
            })
        } else {
            setSubjects([])
        }
        setSelectedSubject('')
        setSelectedChapter('')
        setSelectedTopic('')
        setSelectedSubtopic(null)
    }, [selectedClass])

    useEffect(() => {
        if (selectedSubject) {
            setLoading(prev => ({ ...prev, chapters: true }))
            getChaptersBySubject(selectedSubject).then(data => {
                setChapters(data)
                setLoading(prev => ({ ...prev, chapters: false }))
            })
        } else {
            setChapters([])
        }
        setSelectedChapter('')
        setSelectedTopic('')
        setSelectedSubtopic(null)
    }, [selectedSubject])

    useEffect(() => {
        if (selectedChapter) {
            setLoading(prev => ({ ...prev, topics: true }))
            getTopicsByChapter(selectedChapter).then(data => {
                setTopics(data)
                setLoading(prev => ({ ...prev, topics: false }))
            })
        } else {
            setTopics([])
        }
        setSelectedTopic('')
        setSelectedSubtopic(null)
    }, [selectedChapter])

    useEffect(() => {
        if (selectedTopic) {
            setLoading(prev => ({ ...prev, subtopics: true }))
            getSubtopicsByTopic(selectedTopic).then(data => {
                setSubtopics(data)
                setLoading(prev => ({ ...prev, subtopics: false }))

                // If no subtopics, select the topic itself
                if (data.length === 0) {
                    onSelect(selectedTopic, null)
                    setSelectedSubtopic(null)
                } else {
                    // If subtopics exist, select the first one by default? 
                    // Or let user choose. Let's select first one for smoother flow.
                    if (data.length > 0) {
                        setSelectedSubtopic(data[0].id)
                    }
                }
            })
        } else {
            setSubtopics([])
            setSelectedSubtopic(null)
        }
    }, [selectedTopic])

    // Handle Subtopic Selection
    useEffect(() => {
        if (selectedTopic) {
            if (subtopics.length > 0 && selectedSubtopic) {
                onSelect(selectedTopic, selectedSubtopic)
            } else if (subtopics.length === 0) {
                onSelect(selectedTopic, null)
            }
        }
    }, [selectedSubtopic, selectedTopic, subtopics])

    // Update Navigation List (Siblings) for Next/Prev
    useEffect(() => {
        if (!selectedChapter || topics.length === 0) {
            onNavigationListChange([])
            return
        }

        // Build a flat list of navigable items in this chapter
        // Topic 1
        //   Subtopic 1.1
        //   Subtopic 1.2
        // Topic 2
        // ...

        // This is tricky because we fetch subtopics only when topic is selected.
        // To support full Next/Prev across the whole chapter, we'd need to fetch ALL subtopics for ALL topics in the chapter.
        // That might be too heavy.
        // Let's limit Next/Prev to:
        // 1. Between Subtopics of current Topic
        // 2. Between Topics (if no subtopics or jumping to next topic)

        // For now, let's just provide the list of TOPICS.
        // If we want subtopic navigation, we handle it locally.

        // Actually, the requirement is "change topic and subtopics".
        // Let's construct a list based on what we know.
        // If we only know current topic's subtopics, we can navigate within them.
        // When we hit the end of subtopics, we'd want to go to next Topic.

        // Let's pass the list of TOPICS to the parent.
        // And the list of SUBTOPICS of CURRENT TOPIC.
        // The parent can figure out "Next".

        // Simplified approach:
        // Just pass the list of Topics for now.
        // If the user wants to navigate subtopics, they can use the tabs.
        // But "Next" button is requested.

        // Let's pass:
        // items: NavItem[]

        const items: NavItem[] = topics.map(t => ({
            id: t.id,
            title: t.title,
            type: 'TOPIC'
        }))

        // If we have subtopics for the CURRENT topic, we could inject them?
        // But we don't know subtopics of other topics.

        onNavigationListChange(items)

    }, [topics, selectedChapter])


    return (
        <Card className="mb-6">
            <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Class Select */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Class</label>
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

                    {/* Subject Select */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Subject</label>
                        <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={!selectedClass || loading.subjects}>
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

                    {/* Chapter Select */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Chapter</label>
                        <Select value={selectedChapter} onValueChange={setSelectedChapter} disabled={!selectedSubject || loading.chapters}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Chapter" />
                            </SelectTrigger>
                            <SelectContent>
                                {chapters.map(c => (
                                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Topic Select */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Topic</label>
                        <Select value={selectedTopic} onValueChange={setSelectedTopic} disabled={!selectedChapter || loading.topics}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Topic" />
                            </SelectTrigger>
                            <SelectContent>
                                {topics.map(t => (
                                    <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Subtopic Tabs */}
                {subtopics.length > 0 && (
                    <div className="mt-6">
                        <Tabs value={selectedSubtopic || undefined} onValueChange={setSelectedSubtopic}>
                            <TabsList className="w-full justify-start overflow-x-auto">
                                {subtopics.map(st => (
                                    <TabsTrigger key={st.id} value={st.id}>
                                        {st.title}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
