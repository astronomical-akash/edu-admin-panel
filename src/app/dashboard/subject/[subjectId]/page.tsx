import { getSubjectDetails } from "@/actions/hierarchy"
import { SubjectHierarchyManager } from "@/components/hierarchy/SubjectHierarchyManager"
import { notFound } from "next/navigation"

export default async function SubjectPage({ params }: { params: Promise<{ subjectId: string }> }) {
    try {
        const { subjectId } = await params
        const rawSubject = await getSubjectDetails(subjectId)

        if (!rawSubject) {
            notFound()
        }

        // Serialize
        const subject = JSON.parse(JSON.stringify(rawSubject))

        return (
            <div className="container mx-auto py-10">
                <h1 className="text-3xl font-bold mb-6">{subject.name} - Hierarchy</h1>
                <SubjectHierarchyManager subject={subject} />
            </div>
        )
    } catch (error) {
        console.error("Error loading subject:", error)
        return <div>Error loading subject. Please try again.</div>
    }
}
