import { getClasses } from "@/actions/hierarchy"
import { HierarchyManager } from "@/components/hierarchy/HierarchyManager"

export default async function HierarchyPage() {
    const classes = await getClasses()

    return (
        <div className="container mx-auto py-10">
            <HierarchyManager initialClasses={classes} />
        </div>
    )
}
