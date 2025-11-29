'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const OptionSchema = z.object({
    optionText: z.string().min(1, "Option text is required"),
    isCorrect: z.boolean().default(false),
    rationale: z.string().optional(),
})

const QuestionSchema = z.object({
    questionText: z.string().min(1, "Question text is required"),
    questionType: z.enum(["MCQ_SINGLE", "MCQ_MULTI", "TRUE_FALSE", "SHORT_ANSWER"]),
    explanation: z.string().optional(),
    difficulty: z.string().default("medium"),
    orderIndex: z.number().default(0),
    options: z.array(OptionSchema),
})

const QuizSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    maxMarks: z.number().default(0),
    topicId: z.string().min(1, "Topic is required"),
    subtopicId: z.string().optional(),
    layerId: z.string().min(1, "Layer is required"),
    status: z.enum(["DRAFT", "REVIEW", "PUBLISHED"]).default("DRAFT"),
    questions: z.array(QuestionSchema),
})

export async function createQuiz(data: z.infer<typeof QuizSchema>) {
    const result = QuizSchema.safeParse(data)
    if (!result.success) return { error: result.error.flatten() }

    try {
        const { questions, ...quizData } = result.data

        // Create Quiz with nested Questions and Options
        const quiz = await prisma.quiz.create({
            data: {
                ...quizData,
                questions: {
                    create: questions.map(q => ({
                        questionText: q.questionText,
                        questionType: q.questionType,
                        explanation: q.explanation,
                        difficulty: q.difficulty,
                        orderIndex: q.orderIndex,
                        options: {
                            create: q.options
                        }
                    }))
                }
            }
        })

        revalidatePath('/dashboard/quizzes')
        return { success: true, data: quiz }
    } catch (error) {
        console.error(error)
        return { error: "Failed to create quiz" }
    }
}

export async function getQuizzes() {
    return await prisma.quiz.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            topic: true,
            layer: true,
            _count: {
                select: { questions: true }
            }
        }
    })
}
