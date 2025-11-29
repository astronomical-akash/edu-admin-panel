import { QuizEditor } from "@/components/quiz/QuizEditor"

export default function NewQuizPage() {
    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Create Quiz</h1>
            <QuizEditor />
        </div>
    )
}
