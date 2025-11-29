'use client'

import { useState, useEffect } from 'react'
import { Download, FileText, ExternalLink, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

type DocumentViewerProps = {
    fileUrl: string
    fileName: string
    mimeType: string
}

export function DocumentViewer({ fileUrl, fileName, mimeType }: DocumentViewerProps) {
    const [textContent, setTextContent] = useState<string>('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string>('')
    const [downloading, setDownloading] = useState(false)

    const fileExtension = fileName.split('.').pop()?.toLowerCase()

    useEffect(() => {
        // Load text content for text files
        if (mimeType.includes('text/plain') || fileExtension === 'txt') {
            loadTextFile()
        }
    }, [fileUrl, mimeType])

    const loadTextFile = async () => {
        setLoading(true)
        setError('')
        try {
            const response = await fetch(fileUrl)
            if (!response.ok) throw new Error('Failed to load file')
            const text = await response.text()
            setTextContent(text)
        } catch (err) {
            setError('Failed to load text file')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleDownload = async () => {
        setDownloading(true)
        try {
            const response = await fetch(fileUrl)
            if (!response.ok) throw new Error('Download failed')

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = fileName
            document.body.appendChild(link)
            link.click()

            // Cleanup
            window.URL.revokeObjectURL(url)
            document.body.removeChild(link)
        } catch (error) {
            console.error("Download error:", error)
            alert("Failed to download file. Please try opening in a new tab.")
        } finally {
            setDownloading(false)
        }
    }

    const openInNewTab = () => {
        window.open(fileUrl, '_blank')
    }

    // Render PDF viewer
    if (mimeType.includes('pdf') || fileExtension === 'pdf') {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-medium text-muted-foreground">PDF Document</h3>
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={openInNewTab}>
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Open in New Tab
                        </Button>
                        <Button size="sm" onClick={handleDownload} disabled={downloading}>
                            <Download className="h-4 w-4 mr-1" />
                            {downloading ? 'Downloading...' : 'Download'}
                        </Button>
                    </div>
                </div>
                <div className="border rounded-lg overflow-hidden bg-gray-50 resize-y min-h-[400px] max-h-[800px]">
                    <iframe
                        src={fileUrl}
                        className="w-full h-full min-h-[600px]"
                        title={fileName}
                    />
                </div>
            </div>
        )
    }

    // Render Image viewer
    if (mimeType.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension || '')) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Image</h3>
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={openInNewTab}>
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Open in New Tab
                        </Button>
                        <Button size="sm" onClick={handleDownload} disabled={downloading}>
                            <Download className="h-4 w-4 mr-1" />
                            {downloading ? 'Downloading...' : 'Download'}
                        </Button>
                    </div>
                </div>
                <div className="border rounded-lg overflow-hidden bg-gray-50 flex justify-center items-center p-4">
                    <img
                        src={fileUrl}
                        alt={fileName}
                        className="max-w-full max-h-[600px] object-contain"
                    />
                </div>
            </div>
        )
    }

    // Render DOCX viewer - Local files can't use Google Docs Viewer
    if (mimeType.includes('wordprocessingml') || fileExtension === 'docx' || fileExtension === 'doc') {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Word Document</h3>
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={openInNewTab}>
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Open in New Tab
                        </Button>
                        <Button size="sm" onClick={handleDownload} disabled={downloading}>
                            <Download className="h-4 w-4 mr-1" />
                            {downloading ? 'Downloading...' : 'Download'}
                        </Button>
                    </div>
                </div>
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        <strong>DOCX/Word documents cannot be previewed inline for local files.</strong>
                        <br />
                        Click "Download" to save and open with Microsoft Word or your system's default application.
                    </AlertDescription>
                </Alert>
                <div className="border-2 border-dashed rounded-lg p-12 text-center bg-muted/50">
                    <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h4 className="font-semibold mb-2">Word Document</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                        {fileName} • {fileExtension?.toUpperCase()}
                    </p>
                    <div className="flex gap-2 justify-center">
                        <Button variant="outline" onClick={openInNewTab}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open
                        </Button>
                        <Button onClick={handleDownload} disabled={downloading}>
                            <Download className="h-4 w-4 mr-2" />
                            {downloading ? 'Downloading...' : 'Download'}
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    // Render text file viewer
    if (mimeType.includes('text') || fileExtension === 'txt') {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Text File</h3>
                    <Button size="sm" onClick={handleDownload} disabled={downloading}>
                        <Download className="h-4 w-4 mr-1" />
                        {downloading ? 'Downloading...' : 'Download'}
                    </Button>
                </div>
                {loading ? (
                    <div className="border rounded-lg p-8 text-center text-muted-foreground">
                        Loading...
                    </div>
                ) : error ? (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : (
                    <div className="border rounded-lg overflow-hidden resize-y min-h-[300px] max-h-[800px]">
                        <pre className="p-4 bg-gray-50 overflow-auto h-full text-sm font-mono whitespace-pre-wrap">
                            {textContent}
                        </pre>
                    </div>
                )}
            </div>
        )
    }

    // Fallback for unsupported file types
    return (
        <div className="space-y-4">
            <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                    Preview not available for this file type. Please download to view.
                </AlertDescription>
            </Alert>
            <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={openInNewTab}>
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Open in New Tab
                </Button>
                <Button size="sm" onClick={handleDownload} disabled={downloading}>
                    <Download className="h-4 w-4 mr-1" />
                    {downloading ? 'Downloading...' : 'Download'}
                </Button>
            </div>
        </div>
    )
}
