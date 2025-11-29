'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { writeFile } from "fs/promises"
import path from "path"

const ResourceSchema = z.object({
    title: z.string().min(1, "Title is required"),
    type: z.enum(["QUIZ", "VIDEO", "PRINTABLE", "INFOGRAPHICS", "SLIDES", "MINDMAP"]),
    description: z.string().optional(),
    content: z.string().optional(),
    topicId: z.string().min(1, "Topic is required"),
    subtopicId: z.string().optional(),
    layerId: z.string().min(1, "Layer is required"),
    language: z.string().default("en"),
    difficulty: z.string().default("medium"),
    status: z.enum(["DRAFT", "REVIEW", "PUBLISHED"]).default("DRAFT"),
    fileUrl: z.string().optional(),
    fileName: z.string().optional(),
    fileSize: z.number().optional(),
    mimeType: z.string().optional(),
})

export async function createResource(formData: FormData) {
    const file = formData.get('file') as File | null

    const rawData: any = {}
    formData.forEach((value, key) => {
        if (key !== 'file') rawData[key] = value
    })

    let fileData: any = {}
    if (file && file.size > 0) {
        try {
            const bytes = await file.arrayBuffer()
            const buffer = Buffer.from(bytes)
            const timestamp = Date.now()
            const originalName = file.name.replace(/\s+/g, '_')
            const fileName = `${timestamp}-${originalName}`
            const filePath = path.join(process.cwd(), 'public', 'uploads', fileName)
            await writeFile(filePath, buffer)

            fileData = {
                fileUrl: `/uploads/${fileName}`,
                fileName: file.name,
                fileSize: file.size,
                mimeType: file.type
            }
        } catch (error) {
            console.error("File upload error:", error)
            return { error: "Failed to upload file" }
        }
    }

    const finalData = { ...rawData, ...fileData }
    const result = ResourceSchema.safeParse(finalData)

    if (!result.success) {
        console.error("Validation failed:", result.error.flatten())
        return { error: result.error.flatten() }
    }

    try {
        const user = await prisma.user.findFirst()
        if (!user) {
            return { error: "No user found. Please create a user first." }
        }

        console.log("Creating resource:", result.data.title)

        const resource = await prisma.resource.create({
            data: {
                ...result.data,
                createdById: user.id,
            }
        })

        console.log("Resource created:", resource.id)
        revalidatePath('/dashboard/resources')
        return { success: true, data: resource }
    } catch (error) {
        console.error("Creation error:", error)
        return { error: "Failed to create: " + (error instanceof Error ? error.message : "Unknown error") }
    }
}

export async function getResources() {
    return await prisma.resource.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            topic: true,
            layer: true,
            subtopic: true
        }
    })
}

export async function getResourcesByTopicAndLayer(
    topicId: string,
    subtopicId: string | null,
    layerId: string
) {
    return await prisma.resource.findMany({
        where: {
            topicId,
            subtopicId: subtopicId || null,
            layerId
        },
        orderBy: { createdAt: 'desc' }
    })
}

export async function updateResource(id: string, formData: FormData) {
    const file = formData.get('file') as File | null
    const rawData: any = {}
    formData.forEach((value, key) => {
        if (key !== 'file') rawData[key] = value
    })

    let fileData: any = {}
    if (file && file.size > 0) {
        try {
            const bytes = await file.arrayBuffer()
            const buffer = Buffer.from(bytes)
            const timestamp = Date.now()
            const originalName = file.name.replace(/\s+/g, '_')
            const fileName = `${timestamp}-${originalName}`
            const filePath = path.join(process.cwd(), 'public', 'uploads', fileName)
            await writeFile(filePath, buffer)

            fileData = {
                fileUrl: `/uploads/${fileName}`,
                fileName: file.name,
                fileSize: file.size,
                mimeType: file.type
            }
        } catch (error) {
            console.error("File upload error:", error)
            return { error: "Failed to upload file" }
        }
    }

    const finalData = { ...rawData, ...fileData }
    const result = ResourceSchema.safeParse(finalData)
    if (!result.success) return { error: result.error.flatten() }

    try {
        const user = await prisma.user.findFirst()
        if (!user) return { error: "Please login first" }

        const resource = await prisma.resource.update({
            where: { id },
            data: {
                ...result.data,
                updatedById: user.id,
            }
        })

        revalidatePath('/dashboard/resources')
        return { success: true, data: resource }
    } catch (error) {
        console.error(error)
        return { error: "Failed to update resource" }
    }
}

export async function deleteResource(id: string) {
    try {
        await prisma.resource.delete({ where: { id } })
        revalidatePath('/dashboard/resources')
        return { success: true }
    } catch (error) {
        console.error(error)
        return { error: "Failed to delete resource" }
    }
}

export async function getResourceById(id: string) {
    try {
        const resource = await prisma.resource.findUnique({
            where: { id },
            include: {
                topic: {
                    include: {
                        chapter: {
                            include: {
                                subject: {
                                    include: {
                                        class: true
                                    }
                                }
                            }
                        }
                    }
                },
                subtopic: true,
                layer: true,
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                updatedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        })
        return resource
    } catch (error) {
        console.error(error)
        return null
    }
}

export async function getAllResourcesWithFilters(filters?: {
    type?: string
    status?: string
    layerId?: string
    searchQuery?: string
    classId?: string
    subjectId?: string
    topicId?: string
    subtopicId?: string
}) {
    try {
        const where: any = {}

        if (filters?.type && filters.type !== 'ALL') {
            where.type = filters.type
        }

        if (filters?.status && filters.status !== 'ALL') {
            where.status = filters.status
        }

        if (filters?.layerId && filters.layerId !== 'ALL') {
            where.layerId = filters.layerId
        }

        if (filters?.subtopicId && filters.subtopicId !== 'ALL') {
            where.subtopicId = filters.subtopicId
        }

        if (filters?.topicId && filters.topicId !== 'ALL') {
            where.topicId = filters.topicId
        }

        // Hierarchy filters (if specific topic/subtopic not selected)
        if (filters?.subjectId && filters.subjectId !== 'ALL' && !filters.topicId) {
            where.topic = {
                chapter: {
                    subjectId: filters.subjectId
                }
            }
        }

        if (filters?.classId && filters.classId !== 'ALL' && !filters.subjectId && !filters.topicId) {
            where.topic = {
                chapter: {
                    subject: {
                        classId: filters.classId
                    }
                }
            }
        }

        if (filters?.searchQuery) {
            where.OR = [
                { title: { contains: filters.searchQuery, mode: 'insensitive' } },
                { description: { contains: filters.searchQuery, mode: 'insensitive' } }
            ]
        }

        const resources = await prisma.resource.findMany({
            where,
            include: {
                topic: {
                    include: {
                        chapter: {
                            include: {
                                subject: {
                                    include: {
                                        class: true
                                    }
                                }
                            }
                        }
                    }
                },
                subtopic: true,
                layer: true,
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return resources
    } catch (error) {
        console.error(error)
        return []
    }
}

export async function updateResourceOrder(items: { id: string, orderIndex: number }[]) {
    try {
        await prisma.$transaction(
            items.map(item =>
                prisma.resource.update({
                    where: { id: item.id },
                    data: { orderIndex: item.orderIndex }
                })
            )
        )
        revalidatePath('/dashboard/learning-path')
        return { success: true }
    } catch (error) {
        console.error("Failed to update resource order:", error)
        return { error: "Failed to update order" }
    }
}

const TYPE_PRIORITY: Record<string, number> = {
    VIDEO: 1,
    PRINTABLE: 2,
    INFOGRAPHICS: 3,
    SLIDES: 4,
    QUIZ: 5,
    MINDMAP: 6
}

export async function getLearningPathResources(topicId: string, subtopicId?: string | null) {
    try {
        const resources = await prisma.resource.findMany({
            where: {
                topicId,
                subtopicId: subtopicId || null,
            },
            include: {
                layer: true,
            },
        })

        // Sort resources
        resources.sort((a, b) => {
            // 1. Order Index (if set)
            if (a.orderIndex !== b.orderIndex) {
                return a.orderIndex - b.orderIndex
            }
            // 2. Type Priority
            const priorityA = TYPE_PRIORITY[a.type] || 99
            const priorityB = TYPE_PRIORITY[b.type] || 99
            if (priorityA !== priorityB) {
                return priorityA - priorityB
            }
            // 3. Created At (newest first)
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })

        // Group by layer
        const grouped = resources.reduce((acc, resource) => {
            const layerName = resource.layer?.name || 'Uncategorized'
            if (!acc[layerName]) acc[layerName] = []
            acc[layerName].push(resource)
            return acc
        }, {} as Record<string, typeof resources>)

        return { success: true, data: grouped }
    } catch (error) {
        console.error("Failed to fetch learning path resources:", error)
        return { error: "Failed to fetch resources" }
    }
}
