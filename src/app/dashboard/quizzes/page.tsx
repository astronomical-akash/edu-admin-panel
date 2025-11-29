import Link from "next/link"
import { getQuizzes } from "@/actions/quiz"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Plus } from "lucide-react"

// Force dynamic rendering to avoid database access during build
export const dynamic = 'force-dynamic'

export default async function QuizzesPage() {
    const quizzes = await getQuizzes()

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Quizzes</h1>
                <Button asChild>
                    <Link href="/dashboard/quizzes/new">
                        <Plus className="mr-2 h-4 w-4" /> Create Quiz
                    </Link>
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Topic</TableHead>
                            <TableHead>Layer</TableHead>
                            <TableHead>Questions</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {quizzes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24">No quizzes found.</TableCell>
                            </TableRow>
                        ) : (
                            quizzes.map((quiz) => (
                                <TableRow key={quiz.id}>
                                    <TableCell className="font-medium">{quiz.title}</TableCell>
                                    <TableCell>{quiz.topic.title}</TableCell>
                                    <TableCell>{quiz.layer.name}</TableCell>
                                    <TableCell>{quiz._count.questions}</TableCell>
                                    <TableCell>{quiz.status}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm">Edit</Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
