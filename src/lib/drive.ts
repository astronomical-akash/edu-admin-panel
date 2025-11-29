import { google } from 'googleapis'
import { Readable } from 'stream'

const SCOPES = ['https://www.googleapis.com/auth/drive']

// Initialize auth - assumes Service Account credentials in env
const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // Handle newlines in env var
    },
    scopes: SCOPES,
})

const drive = google.drive({ version: 'v3', auth })

export async function createFolder(name: string, parentId?: string) {
    try {
        const fileMetadata = {
            name,
            mimeType: 'application/vnd.google-apps.folder',
            parents: parentId ? [parentId] : undefined,
        }
        const file = await drive.files.create({
            requestBody: fileMetadata,
            fields: 'id, name, webViewLink',
        })
        return file.data
    } catch (error) {
        console.error('Error creating folder:', error)
        throw error
    }
}

export async function uploadFile(
    name: string,
    mimeType: string,
    content: Buffer | Readable,
    parentId?: string
) {
    try {
        const fileMetadata = {
            name,
            parents: parentId ? [parentId] : undefined,
        }
        const media = {
            mimeType,
            body: content instanceof Buffer ? Readable.from(content) : content,
        }
        const file = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, name, webViewLink, webContentLink',
        })

        // Make public reader (optional, based on requirements - user said "public/authorized webViewLink")
        // For now, let's keep it private to the service account, but maybe share with the user?
        // Or make it anyone with link reader?
        await drive.permissions.create({
            fileId: file.data.id!,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        })

        return file.data
    } catch (error) {
        console.error('Error uploading file:', error)
        throw error
    }
}

export async function getFile(fileId: string) {
    try {
        const file = await drive.files.get({
            fileId,
            fields: 'id, name, webViewLink, webContentLink, mimeType',
        })
        return file.data
    } catch (error) {
        console.error('Error getting file:', error)
        throw error
    }
}
