import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResourceTableView } from "@/components/resources/ResourceTableView"
import { ResourceBrowser } from "@/components/resources/ResourceBrowser"

export default async function ResourcesPage() {
    return (
        <div className="container mx-auto py-10">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Resources</h1>
                <p className="text-muted-foreground mt-2">
                    Create and manage educational resources
                </p>
            </div>

            <Tabs defaultValue="browse" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="create">Create Resources</TabsTrigger>
                    <TabsTrigger value="browse">Browse Resources</TabsTrigger>
                </TabsList>

                <TabsContent value="create" className="mt-6">
                    <div className="mb-4">
                        <p className="text-sm text-muted-foreground">
                            Select a class and subject to manage resources by topic and layer
                        </p>
                    </div>
                    <ResourceTableView />
                </TabsContent>

                <TabsContent value="browse" className="mt-6">
                    <ResourceBrowser />
                </TabsContent>
            </Tabs>
        </div>
    )
}

