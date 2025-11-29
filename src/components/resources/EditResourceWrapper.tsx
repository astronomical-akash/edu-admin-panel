'use client'

import { useRouter } from "next/navigation"
import { ResourceForm } from "./ResourceForm"

export function EditResourceWrapper({ resource }: { resource: any }) {
    const router = useRouter()

    return (
        <ResourceForm
            initialData={resource}
            onSuccess={() => {
                router.push('/dashboard/resources')
                router.refresh()
            }}
        />
    )
}
