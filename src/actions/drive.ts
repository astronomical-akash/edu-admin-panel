'use server'

import { createFolder, uploadFile } from "@/lib/drive"

export async function createDriveFolder(name: string, parentId?: string) {
    try {
        const folder = await createFolder(name, parentId)
        return { success: true, data: folder }
    } catch (error) {
        return { error: "Failed to create folder" }
    }
}

// Note: File upload usually happens via FormData in Server Actions
export async function uploadFileAction(formData: FormData, parentId?: string) {
    const file = formData.get('file') as File
    if (!file) return { error: "No file provided" }

    try {
        const buffer = Buffer.from(await file.arrayBuffer())
        const uploadedFile = await uploadFile(file.name, file.type, buffer, parentId)
        return { success: true, data: uploadedFile }
    } catch (error) {
        return { error: "Failed to upload file" }
    }
}
