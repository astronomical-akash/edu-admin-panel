import { getLayers, createLayer } from "@/actions/hierarchy"
import { LayersManager } from "@/components/hierarchy/LayersManager"

// Force dynamic rendering to avoid database access during build
export const dynamic = 'force-dynamic'

export default async function LayersPage() {
    const layers = await getLayers()

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Manage Layers</h1>
            <LayersManager initialLayers={layers} />
        </div>
    )
}
