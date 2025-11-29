'use client'

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createQuiz } from "@/actions/quiz"
import { getClasses, getSubjectsByClass, getChaptersBySubject, getTopicsByChapter, getSubtopicsByTopic, getLayers } from "@/actions/hierarchy"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

// Schema (Client side mirror)
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
    maxMarks: z.coerce.number().default(0), // Coerce because input type="number" returns string
    classId: z.string().min(1, "Class is required"), // For cascading
    subjectId: z.string().min(1, "Subject is required"),
    chapterId: z.string().min(1, "Chapter is required"),
    topicId: z.string().min(1, "Topic is required"),
    subtopicId: z.string().optional(),
    layerId: z.string().min(1, "Layer is required"),
    questions: z.array(QuestionSchema),
})

export function QuizEditor() {
    const router = useRouter()

    // Hierarchy State
    const [classes, setClasses] = useState<any[]>([])
    const [subjects, setSubjects] = useState<any[]>([])
    const [chapters, setChapters] = useState<any[]>([])
    const [topics, setTopics] = useState<any[]>([])
    const [subtopics, setSubtopics] = useState<any[]>([])
    const [layers, setLayers] = useState<any[]>([])

    const form = useForm<z.infer<typeof QuizSchema>>({
        resolver: zodResolver(QuizSchema) as any, // Fix: Type cast to avoid mismatch
        defaultValues: {
            questions: [{
                questionText: "",
                questionType: "MCQ_SINGLE",
                options: [{ optionText: "", isCorrect: false }]
            }],
            maxMarks: 0
        }
    })

    const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
        control: form.control,
        name: "questions"
    })

    // Load initial data
    useEffect(() => {
        getClasses().then(setClasses)
        getLayers().then(setLayers)
    }, [])

    // Cascading loads
    const watchClass = form.watch("classId")
    useEffect(() => {
        if (watchClass) {
            getSubjectsByClass(watchClass).then(setSubjects)
            form.setValue("subjectId", "")
        }
    }, [watchClass, form])

    const watchSubject = form.watch("subjectId")
    useEffect(() => {
        if (watchSubject) {
            getChaptersBySubject(watchSubject).then(setChapters)
            form.setValue("chapterId", "")
        }
    }, [watchSubject, form])

    const watchChapter = form.watch("chapterId")
    useEffect(() => {
        if (watchChapter) {
            getTopicsByChapter(watchChapter).then(setTopics)
            form.setValue("topicId", "")
        }
    }, [watchChapter, form])

    const watchTopic = form.watch("topicId")
    useEffect(() => {
        if (watchTopic) {
            getSubtopicsByTopic(watchTopic).then(setSubtopics)
            form.setValue("subtopicId", "")
        }
    }, [watchTopic, form])


    async function onSubmit(data: z.infer<typeof QuizSchema>) {
        const res = await createQuiz({ ...data, status: "DRAFT" })
        if (res.success) {
            router.push('/dashboard/quizzes')
            router.refresh()
        } else {
            alert("Failed to create quiz")
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-4xl mx-auto pb-20">
                <Card>
                    <CardHeader><CardTitle>Quiz Details</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl><Textarea {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Hierarchy Selects (Simplified layout) */}
                        <div className="grid grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="classId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Class</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger></FormControl>
                                            <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="subjectId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Subject</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={!subjects.length}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select Subject" /></SelectTrigger></FormControl>
                                            <SelectContent>{subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="chapterId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Chapter</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={!chapters.length}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select Chapter" /></SelectTrigger></FormControl>
                                            <SelectContent>{chapters.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="topicId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Topic</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={!topics.length}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select Topic" /></SelectTrigger></FormControl>
                                            <SelectContent>{topics.map(t => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="subtopicId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Subtopic</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={!subtopics.length}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select Subtopic" /></SelectTrigger></FormControl>
                                            <SelectContent>{subtopics.map(s => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="layerId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Layer</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select Layer" /></SelectTrigger></FormControl>
                                            <SelectContent>{layers.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Questions</h2>
                        <Button type="button" onClick={() => appendQuestion({
                            questionText: "",
                            questionType: "MCQ_SINGLE",
                            difficulty: "medium",
                            orderIndex: questionFields.length,
                            options: [{ optionText: "", isCorrect: false }]
                        })}>
                            <Plus className="w-4 h-4 mr-2" /> Add Question
                        </Button>
                    </div>

                    {questionFields.map((field, index) => (
                        <QuestionItem key={field.id} index={index} form={form} remove={() => removeQuestion(index)} />
                    ))}
                </div>

                <Button type="submit" size="lg" className="w-full">Save Quiz</Button>
            </form>
        </Form>
    )
}

function QuestionItem({ index, form, remove }: { index: number, form: any, remove: () => void }) {
    const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({
        control: form.control,
        name: `questions.${index}.options`
    })

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between py-3 bg-gray-50">
                <CardTitle className="text-base">Question {index + 1}</CardTitle>
                <Button type="button" variant="ghost" size="sm" onClick={remove}><Trash2 className="w-4 h-4 text-red-500" /></Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
                <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-3">
                        <FormField
                            control={form.control}
                            name={`questions.${index}.questionText`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Question Text</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name={`questions.${index}.questionType`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="MCQ_SINGLE">MCQ (Single)</SelectItem>
                                        <SelectItem value="MCQ_MULTI">MCQ (Multi)</SelectItem>
                                        <SelectItem value="TRUE_FALSE">True/False</SelectItem>
                                        <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-2">
                    <FormLabel>Options</FormLabel>
                    {optionFields.map((opt, optIndex) => (
                        <div key={opt.id} className="flex items-center gap-2">
                            <FormField
                                control={form.control}
                                name={`questions.${index}.options.${optIndex}.isCorrect`}
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`questions.${index}.options.${optIndex}.optionText`}
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormControl><Input placeholder={`Option ${optIndex + 1}`} {...field} /></FormControl>
                                    </FormItem>
                                )}
                            />
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(optIndex)}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => appendOption({ optionText: "", isCorrect: false })}>
                        Add Option
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
