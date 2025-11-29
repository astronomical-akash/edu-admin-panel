'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// --- Schemas ---
const ClassSchema = z.object({
    name: z.string().min(1, "Name is required"),
})

const SubjectSchema = z.object({
    name: z.string().min(1, "Name is required"),
    board: z.string().optional(),
    classId: z.string().min(1, "Class ID is required"),
})

const ChapterSchema = z.object({
    title: z.string().min(1, "Title is required"),
    orderIndex: z.number().default(0),
    subjectId: z.string().min(1, "Subject ID is required"),
})

const TopicSchema = z.object({
    title: z.string().min(1, "Title is required"),
    orderIndex: z.number().default(0),
    chapterId: z.string().min(1, "Chapter ID is required"),
})

// Update Schemas (Partial)
const UpdateClassSchema = ClassSchema.partial()
const UpdateSubjectSchema = SubjectSchema.partial()
const UpdateChapterSchema = ChapterSchema.partial()
const UpdateTopicSchema = TopicSchema.partial()

// --- Actions ---

// Class
export async function createClass(data: z.infer<typeof ClassSchema>) {
    const result = ClassSchema.safeParse(data)
    if (!result.success) return { error: result.error.flatten() }

    try {
        const newClass = await prisma.class.create({ data: result.data })
        revalidatePath('/dashboard/hierarchy')
        return { success: true, data: newClass }
    } catch (error) {
        return { error: "Failed to create class" }
    }
}

export async function updateClass(id: string, data: z.infer<typeof UpdateClassSchema>) {
    const result = UpdateClassSchema.safeParse(data)
    if (!result.success) return { error: result.error.flatten() }

    try {
        const updatedClass = await prisma.class.update({
            where: { id },
            data: result.data
        })
        revalidatePath('/dashboard/hierarchy')
        return { success: true, data: updatedClass }
    } catch (error) {
        return { error: "Failed to update class" }
    }
}

export async function deleteClass(id: string) {
    try {
        await prisma.class.delete({ where: { id } })
        revalidatePath('/dashboard/hierarchy')
        return { success: true }
    } catch (error) {
        return { error: "Failed to delete class" }
    }
}

export async function getClasses() {
    return await prisma.class.findMany({
        orderBy: { name: 'asc' },
        include: {
            subjects: {
                orderBy: { name: 'asc' }
            }
        }
    })
}

// Subject
export async function createSubject(data: z.infer<typeof SubjectSchema>) {
    const result = SubjectSchema.safeParse(data)
    if (!result.success) return { error: result.error.flatten() }

    try {
        const newSubject = await prisma.subject.create({ data: result.data })
        revalidatePath('/dashboard/hierarchy')
        return { success: true, data: newSubject }
    } catch (error) {
        return { error: "Failed to create subject" }
    }
}

export async function updateSubject(id: string, data: z.infer<typeof UpdateSubjectSchema>) {
    const result = UpdateSubjectSchema.safeParse(data)
    if (!result.success) return { error: result.error.flatten() }

    try {
        const updatedSubject = await prisma.subject.update({
            where: { id },
            data: result.data
        })
        revalidatePath('/dashboard/hierarchy')
        return { success: true, data: updatedSubject }
    } catch (error) {
        return { error: "Failed to update subject" }
    }
}

export async function deleteSubject(id: string) {
    try {
        await prisma.subject.delete({ where: { id } })
        revalidatePath('/dashboard/hierarchy')
        return { success: true }
    } catch (error) {
        return { error: "Failed to delete subject" }
    }
}

// Chapter
export async function createChapter(data: z.infer<typeof ChapterSchema>) {
    const result = ChapterSchema.safeParse(data)
    if (!result.success) return { error: result.error.flatten() }

    try {
        const newChapter = await prisma.chapter.create({ data: result.data })
        revalidatePath('/dashboard/subject/[id]')
        return { success: true, data: newChapter }
    } catch (error) {
        return { error: "Failed to create chapter" }
    }
}

export async function updateChapter(id: string, data: z.infer<typeof UpdateChapterSchema>) {
    const result = UpdateChapterSchema.safeParse(data)
    if (!result.success) return { error: result.error.flatten() }

    try {
        const updatedChapter = await prisma.chapter.update({
            where: { id },
            data: result.data
        })
        revalidatePath('/dashboard/subject/[id]')
        return { success: true, data: updatedChapter }
    } catch (error) {
        return { error: "Failed to update chapter" }
    }
}

export async function deleteChapter(id: string) {
    try {
        await prisma.chapter.delete({ where: { id } })
        revalidatePath('/dashboard/subject/[id]')
        return { success: true }
    } catch (error) {
        return { error: "Failed to delete chapter" }
    }
}

// Topic
export async function createTopic(data: z.infer<typeof TopicSchema>) {
    const result = TopicSchema.safeParse(data)
    if (!result.success) return { error: result.error.flatten() }

    try {
        const newTopic = await prisma.topic.create({ data: result.data })
        revalidatePath('/dashboard/subject/[id]')
        return { success: true, data: newTopic }
    } catch (error) {
        return { error: "Failed to create topic" }
    }
}

export async function updateTopic(id: string, data: z.infer<typeof UpdateTopicSchema>) {
    const result = UpdateTopicSchema.safeParse(data)
    if (!result.success) return { error: result.error.flatten() }

    try {
        const updatedTopic = await prisma.topic.update({
            where: { id },
            data: result.data
        })
        revalidatePath('/dashboard/subject/[id]')
        return { success: true, data: updatedTopic }
    } catch (error) {
        return { error: "Failed to update topic" }
    }
}

export async function deleteTopic(id: string) {
    try {
        await prisma.topic.delete({ where: { id } })
        revalidatePath('/dashboard/subject/[id]')
        return { success: true }
    } catch (error) {
        return { error: "Failed to delete topic" }
    }
}

// Subtopic
const SubtopicSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    orderIndex: z.number().default(0),
    topicId: z.string().min(1, "Topic ID is required"),
    layerIds: z.array(z.string()).optional(), // IDs of required layers
})

const UpdateSubtopicSchema = SubtopicSchema.partial()

export async function createSubtopic(data: z.infer<typeof SubtopicSchema>) {
    const result = SubtopicSchema.safeParse(data)
    if (!result.success) return { error: result.error.flatten() }

    const { layerIds, ...subtopicData } = result.data

    try {
        const newSubtopic = await prisma.subtopic.create({
            data: {
                ...subtopicData,
                requiredLayers: layerIds ? {
                    connect: layerIds.map(id => ({ id }))
                } : undefined
            }
        })
        revalidatePath('/dashboard/subject/[id]')
        return { success: true, data: newSubtopic }
    } catch (error) {
        return { error: "Failed to create subtopic" }
    }
}

export async function updateSubtopic(id: string, data: z.infer<typeof UpdateSubtopicSchema>) {
    const result = UpdateSubtopicSchema.safeParse(data)
    if (!result.success) return { error: result.error.flatten() }

    const { layerIds, ...subtopicData } = result.data

    try {
        // If layerIds is provided, we need to update the relation
        // We'll use set to replace existing connections with new ones
        const updateData: any = { ...subtopicData }

        if (layerIds) {
            updateData.requiredLayers = {
                set: layerIds.map(id => ({ id }))
            }
        }

        const updated = await prisma.subtopic.update({
            where: { id },
            data: updateData
        })
        revalidatePath('/dashboard/subject/[id]')
        return { success: true, data: updated }
    } catch (error) {
        return { error: "Failed to update subtopic" }
    }
}

export async function deleteSubtopic(id: string) {
    try {
        const resourceCount = await prisma.resource.count({ where: { subtopicId: id } })
        if (resourceCount > 0) return { error: `Cannot delete subtopic. It has ${resourceCount} resources.` }

        await prisma.subtopic.delete({ where: { id } })
        revalidatePath('/dashboard/subject/[id]')
        return { success: true }
    } catch (error) {
        return { error: "Failed to delete subtopic" }
    }
}

export async function updateSubtopicOrder(items: { id: string, orderIndex: number }[]) {
    try {
        await prisma.$transaction(
            items.map(item =>
                prisma.subtopic.update({
                    where: { id: item.id },
                    data: { orderIndex: item.orderIndex }
                })
            )
        )
        revalidatePath('/dashboard/subject/[id]')
        return { success: true }
    } catch (error) {
        return { error: "Failed to update subtopic order" }
    }
}

// Layer
const LayerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
})

const UpdateLayerSchema = LayerSchema.partial()

export async function createLayer(data: z.infer<typeof LayerSchema>) {
    const result = LayerSchema.safeParse(data)
    if (!result.success) return { error: result.error.flatten() }

    try {
        const newLayer = await prisma.layer.create({ data: result.data })
        revalidatePath('/dashboard/layers')
        return { success: true, data: newLayer }
    } catch (error) {
        return { error: "Failed to create layer" }
    }
}

export async function getLayers() {
    return await prisma.layer.findMany({
        orderBy: { name: 'asc' }
    })
}

export async function updateLayer(id: string, data: z.infer<typeof UpdateLayerSchema>) {
    const result = UpdateLayerSchema.safeParse(data)
    if (!result.success) return { error: result.error.flatten() }

    try {
        const updatedLayer = await prisma.layer.update({
            where: { id },
            data: result.data
        })
        revalidatePath('/dashboard/layers')
        return { success: true, data: updatedLayer }
    } catch (error) {
        return { error: "Failed to update layer" }
    }
}

export async function deleteLayer(id: string) {
    try {
        // Check if layer has resources or quizzes
        const layer = await prisma.layer.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        resources: true,
                        quizzes: true
                    }
                }
            }
        })

        if (!layer) {
            return { error: "Layer not found" }
        }

        const totalContent = layer._count.resources + layer._count.quizzes
        if (totalContent > 0) {
            return {
                error: `Cannot delete layer. It has ${totalContent} associated resource(s) or quiz(zes). Please reassign or delete them first.`
            }
        }

        await prisma.layer.delete({ where: { id } })
        revalidatePath('/dashboard/layers')
        return { success: true }
    } catch (error) {
        return { error: "Failed to delete layer" }
    }
}

// Fetch full hierarchy for a subject
export async function getSubjectDetails(subjectId: string) {
    const result = await prisma.subject.findUnique({
        where: { id: subjectId },
        include: {
            chapters: {
                orderBy: { orderIndex: 'asc' },
                include: {
                    topics: {
                        orderBy: { orderIndex: 'asc' },
                        include: {
                            resources: {
                                select: { layerId: true }
                            },
                            subtopics: {
                                orderBy: { orderIndex: 'asc' },
                                include: {
                                    requiredLayers: true,
                                    resources: {
                                        select: { layerId: true }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    })
    return result
}

// Cascading Getters
export async function getSubjectsByClass(classId: string) {
    return await prisma.subject.findMany({ where: { classId }, orderBy: { name: 'asc' } })
}

export async function getChaptersBySubject(subjectId: string) {
    return await prisma.chapter.findMany({ where: { subjectId }, orderBy: { orderIndex: 'asc' } })
}

export async function getTopicsByChapter(chapterId: string) {
    return await prisma.topic.findMany({ where: { chapterId }, orderBy: { orderIndex: 'asc' } })
}

export async function getSubtopicsByTopic(topicId: string) {
    return await prisma.subtopic.findMany({ where: { topicId }, orderBy: { orderIndex: 'asc' } })
}

// Fetch full hierarchy for a class (helper)
export async function getHierarchy(classId: string) {
    return await prisma.subject.findMany({
        where: { classId },
        include: {
            chapters: {
                include: {
                    topics: {
                        include: {
                            subtopics: true
                        }
                    }
                }
            }
        }
    })
}
