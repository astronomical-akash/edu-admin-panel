'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, MoveUp, MoveDown } from "lucide-react"

export type QuizQuestion = {
    question: string
    answerOptions: {
        text: string
        isCorrect: boolean
        rationale: string
    }[]
    hint: string
}

export type QuizData = {
    quiz: QuizQuestion[]
}

interface QuizBuilderProps {
    value: QuizData
    onChange: (data: QuizData) => void
}

export function QuizBuilder({ value, onChange }: QuizBuilderProps) {
    const [questions, setQuestions] = useState<QuizQuestion[]>(value.quiz || [])
    const [mode, setMode] = useState<'builder' | 'json'>('builder')
    const [jsonInput, setJsonInput] = useState('')
    const [jsonError, setJsonError] = useState('')

    function updateQuestions(newQuestions: QuizQuestion[]) {
        setQuestions(newQuestions)
        onChange({ quiz: newQuestions })
    }

    function importFromJSON() {
        setJsonError('')
        try {
            const parsed = JSON.parse(jsonInput)

            // Validate structure
            if (!parsed.quiz || !Array.isArray(parsed.quiz)) {
                throw new Error('JSON must have a "quiz" array')
            }

            // Validate each question
            for (let i = 0; i < parsed.quiz.length; i++) {
                const q = parsed.quiz[i]
                if (!q.question || typeof q.question !== 'string') {
                    throw new Error(`Question ${i + 1}: Missing or invalid "question" field`)
                }
                if (!q.answerOptions || !Array.isArray(q.answerOptions) || q.answerOptions.length < 2) {
                    throw new Error(`Question ${i + 1}: Must have at least 2 answerOptions`)
                }
                for (let j = 0; j < q.answerOptions.length; j++) {
                    const opt = q.answerOptions[j]
                    if (!opt.text || typeof opt.text !== 'string') {
                        throw new Error(`Question ${i + 1}, Option ${j + 1}: Missing or invalid "text" field`)
                    }
                    if (typeof opt.isCorrect !== 'boolean') {
                        throw new Error(`Question ${i + 1}, Option ${j + 1}: Missing or invalid "isCorrect" field`)
                    }
                    if (!opt.rationale) {
                        opt.rationale = '' // Optional, set default
                    }
                }
                if (!q.hint) {
                    q.hint = '' // Optional, set default
                }
            }

            // Validation passed - import the data
            updateQuestions(parsed.quiz)
            setMode('builder')
            setJsonInput('')
        } catch (error) {
            setJsonError(error instanceof Error ? error.message : 'Invalid JSON format')
        }
    }

    function exportToJSON() {
        const json = JSON.stringify({ quiz: questions }, null, 2)
        setJsonInput(json)
        setMode('json')
    }

    function addQuestion() {
        const newQuestion: QuizQuestion = {
            question: "",
            answerOptions: [
                { text: "", isCorrect: false, rationale: "" },
                { text: "", isCorrect: false, rationale: "" }
            ],
            hint: ""
        }
        updateQuestions([...questions, newQuestion])
    }

    function removeQuestion(index: number) {
        updateQuestions(questions.filter((_, i) => i !== index))
    }

    function moveQuestion(index: number, direction: 'up' | 'down') {
        const newQuestions = [...questions]
        const targetIndex = direction === 'up' ? index - 1 : index + 1
        if (targetIndex < 0 || targetIndex >= newQuestions.length) return

        [newQuestions[index], newQuestions[targetIndex]] = [newQuestions[targetIndex], newQuestions[index]]
        updateQuestions(newQuestions)
    }

    function updateQuestion(index: number, field: keyof QuizQuestion, value: any) {
        const newQuestions = [...questions]
        newQuestions[index] = { ...newQuestions[index], [field]: value }
        updateQuestions(newQuestions)
    }

    function addOption(questionIndex: number) {
        const newQuestions = [...questions]
        newQuestions[questionIndex].answerOptions.push({
            text: "",
            isCorrect: false,
            rationale: ""
        })
        updateQuestions(newQuestions)
    }

    function removeOption(questionIndex: number, optionIndex: number) {
        const newQuestions = [...questions]
        newQuestions[questionIndex].answerOptions = newQuestions[questionIndex].answerOptions.filter((_, i) => i !== optionIndex)
        updateQuestions(newQuestions)
    }

    function updateOption(questionIndex: number, optionIndex: number, field: string, value: any) {
        const newQuestions = [...questions]
        newQuestions[questionIndex].answerOptions[optionIndex] = {
            ...newQuestions[questionIndex].answerOptions[optionIndex],
            [field]: value
        }
        updateQuestions(newQuestions)
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Quiz Questions</h3>
                <div className="flex gap-2">
                    <Button
                        onClick={() => mode === 'builder' ? exportToJSON() : setMode('builder')}
                        variant="outline"
                        type="button"
                    >
                        {mode === 'builder' ? '📋 Export JSON' : '🔨 Builder Mode'}
                    </Button>
                    <Button onClick={addQuestion} type="button">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Question
                    </Button>
                </div>
            </div>

            {mode === 'json' ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Import Quiz from JSON</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Textarea
                                value={jsonInput}
                                onChange={(e) => {
                                    setJsonInput(e.target.value)
                                    setJsonError('')
                                }}
                                placeholder={'Paste your JSON here:\n{\n  "quiz": [\n    {\n      "question": "What is 2+2?",\n      "answerOptions": [\n        {\n          "text": "3",\n          "rationale": "Incorrect",\n          "isCorrect": false\n        },\n        {\n          "text": "4",\n          "rationale": "Correct!",\n          "isCorrect": true\n        }\n      ],\n      "hint": "Think about basic addition"\n    }\n  ]\n}'}
                                rows={15}
                                className="font-mono text-sm"
                            />
                        </div>
                        {jsonError && (
                            <div className="bg-red-50 border border-red-200 rounded p-3">
                                <p className="text-sm text-red-800">
                                    <strong>Error:</strong> {jsonError}
                                </p>
                            </div>
                        )}
                        <div className="flex gap-2">
                            <Button onClick={importFromJSON} type="button">
                                Import Quiz
                            </Button>
                            <Button
                                onClick={() => {
                                    setMode('builder')
                                    setJsonInput('')
                                    setJsonError('')
                                }}
                                variant="outline"
                                type="button"
                            >
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                questions.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <p className="text-muted-foreground mb-4">No questions yet</p>
                            <Button onClick={addQuestion} variant="outline" type="button">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Your First Question
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    questions.map((question, qIndex) => (
                        <Card key={qIndex}>
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-base">Question {qIndex + 1}</CardTitle>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => moveQuestion(qIndex, 'up')}
                                            disabled={qIndex === 0}
                                            type="button"
                                        >
                                            <MoveUp className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => moveQuestion(qIndex, 'down')}
                                            disabled={qIndex === questions.length - 1}
                                            type="button"
                                        >
                                            <MoveDown className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeQuestion(qIndex)}
                                            className="text-red-600 hover:text-red-700"
                                            type="button"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Question Text</label>
                                    <Textarea
                                        value={question.question}
                                        onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                                        placeholder="Enter your question..."
                                        rows={2}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium">Answer Options</label>
                                        <Button
                                            onClick={() => addOption(qIndex)}
                                            size="sm"
                                            variant="outline"
                                            type="button"
                                        >
                                            <Plus className="h-3 w-3 mr-1" />
                                            Add Option
                                        </Button>
                                    </div>

                                    {question.answerOptions.map((option, oIndex) => (
                                        <Card key={oIndex} className="bg-muted/30">
                                            <CardContent className="pt-4 space-y-2">
                                                <div className="flex items-start gap-2">
                                                    <Checkbox
                                                        checked={option.isCorrect}
                                                        onCheckedChange={(checked) =>
                                                            updateOption(qIndex, oIndex, 'isCorrect', checked)
                                                        }
                                                        className="mt-1"
                                                    />
                                                    <div className="flex-1 space-y-2">
                                                        <Input
                                                            value={option.text}
                                                            onChange={(e) =>
                                                                updateOption(qIndex, oIndex, 'text', e.target.value)
                                                            }
                                                            placeholder="Option text..."
                                                        />
                                                        <Input
                                                            value={option.rationale}
                                                            onChange={(e) =>
                                                                updateOption(qIndex, oIndex, 'rationale', e.target.value)
                                                            }
                                                            placeholder="Rationale/Explanation..."
                                                        />
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeOption(qIndex, oIndex)}
                                                        disabled={question.answerOptions.length <= 2}
                                                        className="text-red-600"
                                                        type="button"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-1 block">Hint (Optional)</label>
                                    <Input
                                        value={question.hint}
                                        onChange={(e) => updateQuestion(qIndex, 'hint', e.target.value)}
                                        placeholder="Provide a hint for students..."
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )
            )}
        </div>
    )
}
