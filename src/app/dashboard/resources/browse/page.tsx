import { ResourceBrowser } from "@/components/resources/ResourceBrowser"

export default function BrowseResourcesPage() {
    return (
        <div className="container mx-auto py-10">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Browse Resources</h1>
                <p className="text-muted-foreground mt-2">
                    View and manage all your uploaded resources
                </p>
            </div>

            <ResourceBrowser />
        </div>
    )
}
