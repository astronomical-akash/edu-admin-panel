'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CheckCircle2, XCircle, HelpCircle, ChevronRight, ChevronLeft, RefreshCcw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

type Question = {
    question: string
    answerOptions: {
        text: string
        isCorrect: boolean
        rationale?: string
    }[]
    hint?: string
}

type QuizPlayerProps = {
    content: {
        quiz: Question[]
    }
    title?: string
}

export function QuizPlayer({ content, title }: QuizPlayerProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
    const [isChecked, setIsChecked] = useState(false)
    const [showHint, setShowHint] = useState(false)
    const [score, setScore] = useState(0)
    const [completed, setCompleted] = useState(false)
    const [answers, setAnswers] = useState<Record<number, boolean>>({}) // Track correctness per question

    const questions = content.quiz || []
    const currentQuestion = questions[currentQuestionIndex]
    const totalQuestions = questions.length

    if (!questions.length) {
        return (
            <Alert>
                <AlertTitle>No questions found</AlertTitle>
                <AlertDescription>This quiz has no questions.</AlertDescription>
            </Alert>
        )
    }

    const handleCheckAnswer = () => {
        if (!selectedAnswer) return

        const isCorrect = currentQuestion.answerOptions.find(opt => opt.text === selectedAnswer)?.isCorrect || false
        setIsChecked(true)

        // Only update score if this is the first time checking this question
        if (answers[currentQuestionIndex] === undefined) {
            setAnswers(prev => ({ ...prev, [currentQuestionIndex]: isCorrect }))
            if (isCorrect) setScore(prev => prev + 1)
        }
    }

    const handleNext = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(prev => prev + 1)
            resetQuestionState()
        } else {
            setCompleted(true)
        }
    }

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1)
            // Restore state if we want to allow reviewing? 
            // For now, let's reset to allow re-attempting or just viewing.
            // Actually, better to keep the state if already answered.
            // But for simplicity in this version, let's reset to let them try again or just navigate.
            // If we want to persist "answered" state, we'd need more complex state management.
            // Let's stick to simple flow: Next -> Next -> Finish.
            // But user asked for Previous/Next. 
            // If I go back, I should probably see my previous result.
            // Let's just reset for now to keep it simple, or maybe disable Previous if we want strict flow.
            // User asked for "Previous and next button to change topic", not necessarily inside quiz.
            // But "One question at a time" implies navigation.
            resetQuestionState()
        }
    }

    const resetQuestionState = () => {
        setSelectedAnswer(null)
        setIsChecked(false)
        setShowHint(false)
    }

    const handleRestart = () => {
        setCurrentQuestionIndex(0)
        setScore(0)
        setCompleted(false)
        setAnswers({})
        resetQuestionState()
    }

    if (completed) {
        const percentage = Math.round((score / totalQuestions) * 100)
        return (
            <Card className="w-full max-w-2xl mx-auto text-center">
                <CardHeader>
                    <CardTitle className="text-2xl">Quiz Completed! 🎉</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="text-4xl font-bold text-primary mb-2">
                        {percentage}%
                    </div>
                    <Progress value={percentage} className="w-full h-3" />
                    <p className="text-muted-foreground">
                        You scored {score} out of {totalQuestions} questions correctly.
                    </p>
                </CardContent>
                <CardFooter className="justify-center">
                    <Button onClick={handleRestart} size="lg">
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Restart Quiz
                    </Button>
                </CardFooter>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-3xl mx-auto">
            <CardHeader className="pb-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">
                        Question {currentQuestionIndex + 1} of {totalQuestions}
                    </span>
                    <span className="text-sm font-medium">
                        Score: {score}
                    </span>
                </div>
                <Progress value={((currentQuestionIndex) / totalQuestions) * 100} className="h-2" />
                <CardTitle className="text-xl mt-4 leading-relaxed">
                    {currentQuestion.question}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <RadioGroup
                    value={selectedAnswer || ""}
                    onValueChange={(val) => !isChecked && setSelectedAnswer(val)}
                    className="space-y-3"
                >
                    {currentQuestion.answerOptions.map((option, idx) => {
                        const isSelected = selectedAnswer === option.text
                        const showCorrect = isChecked && option.isCorrect
                        const showWrong = isChecked && isSelected && !option.isCorrect

                        let borderClass = "border-border"
                        if (showCorrect) borderClass = "border-green-500 bg-green-50"
                        if (showWrong) borderClass = "border-red-500 bg-red-50"
                        if (isSelected && !isChecked) borderClass = "border-primary bg-primary/5"

                        return (
                            <div key={idx} className={`relative rounded-lg border-2 p-4 transition-all ${borderClass}`}>
                                <div className="flex items-start space-x-3">
                                    <RadioGroupItem
                                        value={option.text}
                                        id={`opt-${idx}`}
                                        disabled={isChecked}
                                        className="mt-1"
                                    />
                                    <div className="flex-1">
                                        <Label
                                            htmlFor={`opt-${idx}`}
                                            className="text-base font-normal cursor-pointer leading-relaxed block"
                                        >
                                            {option.text}
                                        </Label>

                                        {isChecked && (option.isCorrect || (isSelected && !option.isCorrect)) && option.rationale && (
                                            <div className={`mt-2 text-sm p-2 rounded ${option.isCorrect ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                                                <strong>Rationale:</strong> {option.rationale}
                                            </div>
                                        )}
                                    </div>
                                    {showCorrect && <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />}
                                    {showWrong && <XCircle className="h-5 w-5 text-red-600 shrink-0" />}
                                </div>
                            </div>
                        )
                    })}
                </RadioGroup>

                {currentQuestion.hint && !isChecked && (
                    <div className="mt-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowHint(!showHint)}
                            className="text-muted-foreground hover:text-primary"
                        >
                            <HelpCircle className="h-4 w-4 mr-2" />
                            {showHint ? "Hide Hint" : "Show Hint"}
                        </Button>
                        {showHint && (
                            <Alert className="mt-2 bg-muted/50 border-dashed">
                                <AlertDescription className="text-sm italic">
                                    💡 {currentQuestion.hint}
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
                <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                </Button>

                {!isChecked ? (
                    <Button
                        onClick={handleCheckAnswer}
                        disabled={!selectedAnswer}
                        className="min-w-[120px]"
                    >
                        Check Answer
                    </Button>
                ) : (
                    <Button
                        onClick={handleNext}
                        className="min-w-[120px]"
                    >
                        {currentQuestionIndex < totalQuestions - 1 ? (
                            <>
                                Next Question
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </>
                        ) : (
                            "Finish Quiz"
                        )}
                    </Button>
                )}
            </CardFooter>
        </Card>
    )
}
