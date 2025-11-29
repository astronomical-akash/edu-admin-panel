import { getResourceById } from "@/actions/resource"
import { EditResourceWrapper } from "@/components/resources/EditResourceWrapper"
import { notFound } from "next/navigation"

export default async function EditResourcePage({ params }: { params: { id: string } }) {
    const resource = await getResourceById(params.id)

    if (!resource) {
        notFound()
    }

    return (
        <div className="container mx-auto py-10">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Edit Resource</h1>
                <p className="text-muted-foreground mt-2">
                    Update resource details and content
                </p>
            </div>

            <div className="max-w-3xl">
                <EditResourceWrapper resource={resource} />
            </div>
        </div>
    )
}
