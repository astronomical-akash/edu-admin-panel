import { ResourceForm } from "@/components/resources/ResourceForm"

export default function NewResourcePage() {
    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Create Resource</h1>
            <ResourceForm />
        </div>
    )
}
