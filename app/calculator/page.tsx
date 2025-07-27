"use client"

import { useState } from "react"
import { Calculator, Plus, Minus, RotateCcw, Download, Info, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { motion } from "framer-motion"
import jsPDF from "jspdf"
import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

interface Subject {
  id: string
  name: string
  credits: number
  grade: string
  marks?: number
}

interface SemesterData {
  semester: number
  sgpa: number
}

const gradePoints: Record<string, number> = {
  O: 10,
  "A+": 9,
  A: 8,
  "B+": 7,
  B: 6,
  "C+": 5,
  C: 4,
  P: 4,
  F: 0,
}

const gradeRanges = [
  { grade: "O", points: 10, range: "90-100", description: "Outstanding" },
  { grade: "A+", points: 9, range: "80-89", description: "Excellent" },
  { grade: "A", points: 8, range: "70-79", description: "Very Good" },
  { grade: "B+", points: 7, range: "60-69", description: "Good" },
  { grade: "B", points: 6, range: "55-59", description: "Above Average" },
  { grade: "C+", points: 5, range: "50-54", description: "Average" },
  { grade: "C", points: 4, range: "45-49", description: "Satisfactory" },
  { grade: "P", points: 4, range: "40-44", description: "Pass" },
  { grade: "F", points: 0, range: "0-39", description: "Fail" },
]

export default function CalculatorPage() {
  // SGPA Calculator State - Updated to calculate grades from marks
  const [subjects, setSubjects] = useState<Subject[]>([{ id: "1", name: "", credits: 3, grade: "", marks: 0 }])
  const [sgpaResult, setSgpaResult] = useState<number | null>(null)
  const [studentName, setStudentName] = useState("")
  const [usn, setUsn] = useState("")
  const [gradeDistribution, setGradeDistribution] = useState<Record<string, number>>({})

  // CGPA Calculator State
  const [semesters, setSemesters] = useState<SemesterData[]>([{ semester: 1, sgpa: 0 }])
  const [cgpaResult, setCgpaResult] = useState<number | null>(null)

  // Function to calculate grade from marks
  const calculateGradeFromMarks = (marks: number): string => {
    if (marks >= 90) return "O"
    if (marks >= 80) return "A+"
    if (marks >= 70) return "A"
    if (marks >= 60) return "B+"
    if (marks >= 55) return "B"
    if (marks >= 50) return "C+"
    if (marks >= 45) return "C"
    if (marks >= 40) return "P"
    return "F"
  }

  // Function to get grade description
  const getGradeDescription = (grade: string): string => {
    const descriptions: Record<string, string> = {
      O: "Outstanding",
      "A+": "Excellent",
      A: "Very Good",
      "B+": "Good",
      B: "Above Average",
      "C+": "Average",
      C: "Satisfactory",
      P: "Pass",
      F: "Fail",
    }
    return descriptions[grade] || ""
  }

  // Update the updateSubject function to auto-calculate grades
  const updateSubject = (id: string, field: keyof Subject, value: string | number) => {
    setSubjects(
      subjects.map((subject) => {
        if (subject.id === id) {
          const updatedSubject = { ...subject, [field]: value }
          // Auto-calculate grade when marks are updated
          if (field === "marks" && typeof value === "number") {
            updatedSubject.grade = calculateGradeFromMarks(value)
          }
          return updatedSubject
        }
        return subject
      }),
    )
  }

  // Update calculateSGPA function to include grade distribution
  const calculateSGPA = () => {
    let totalCredits = 0
    let totalGradePoints = 0
    const distribution: Record<string, number> = {}

    for (const subject of subjects) {
      if (subject.marks !== undefined && subject.marks > 0 && subject.credits > 0) {
        const grade = calculateGradeFromMarks(subject.marks)
        const points = gradePoints[grade] || 0
        totalGradePoints += points * subject.credits
        totalCredits += subject.credits

        // Count grade distribution
        distribution[grade] = (distribution[grade] || 0) + 1
      }
    }

    if (totalCredits > 0) {
      const sgpa = totalGradePoints / totalCredits
      setSgpaResult(Math.round(sgpa * 100) / 100)
      setGradeDistribution(distribution)
    }
  }

  const resetSGPA = () => {
    setSubjects([{ id: "1", name: "", credits: 3, grade: "", marks: 0 }])
    setSgpaResult(null)
  }

  const addSubject = () => {
    const newSubject: Subject = {
      id: `${subjects.length + 1}`,
      name: "",
      credits: 3,
      grade: "",
      marks: 0,
    }
    setSubjects([...subjects, newSubject])
  }

  const removeSubject = (id: string) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter((subject) => subject.id !== id))
    }
  }

  const addSemester = () => {
    if (semesters.length < 8) {
      const newSemester: SemesterData = {
        semester: semesters.length + 1,
        sgpa: 0,
      }
      setSemesters([...semesters, newSemester])
    }
  }

  const removeSemester = (semester: number) => {
    if (semesters.length > 1) {
      setSemesters(semesters.filter((sem) => sem.semester !== semester))
    }
  }

  const updateSemester = (semester: number, value: number) => {
    setSemesters(semesters.map((sem) => (sem.semester === semester ? { ...sem, sgpa: value } : sem)))
  }

  const calculateCGPA = () => {
    const validSemesters = semesters.filter((sem) => sem.sgpa > 0)

    if (validSemesters.length > 0) {
      const totalSGPA = validSemesters.reduce((sum, sem) => sum + sem.sgpa, 0)
      const cgpa = totalSGPA / validSemesters.length
      setCgpaResult(Math.round(cgpa * 100) / 100)
    }
  }

  const resetCGPA = () => {
    setSemesters([{ semester: 1, sgpa: 0 }])
    setCgpaResult(null)
  }

  const getGradeColor = (cgpa: number) => {
    if (cgpa >= 9) return "text-green-600 dark:text-green-400"
    if (cgpa >= 8) return "text-blue-600 dark:text-blue-400"
    if (cgpa >= 7) return "text-yellow-600 dark:text-yellow-400"
    if (cgpa >= 6) return "text-orange-600 dark:text-orange-400"
    return "text-red-600 dark:text-red-400"
  }

  const getProgressValue = (cgpa: number) => (cgpa / 10) * 100

  // Enhanced PDF download with visualizations
  const downloadGradeReport = () => {
    const doc = new jsPDF()

    // Header with styling
    doc.setFillColor(0, 0, 0)
    doc.rect(0, 0, 210, 30, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.text("VTU GRADE REPORT", 105, 20, { align: "center" })

    // Reset colors
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(12)

    // Student Details Box
    doc.setDrawColor(0, 0, 0)
    doc.rect(20, 40, 170, 30)
    doc.setFontSize(14)
    doc.text("STUDENT INFORMATION", 25, 50)
    doc.setFontSize(11)
    doc.text(`Name: ${studentName || "Not Provided"}`, 25, 58)
    doc.text(`USN: ${usn || "Not Provided"}`, 25, 64)
    doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, 120, 58)
    doc.text(`Academic Year: ${new Date().getFullYear()}`, 120, 64)

    // SGPA Result Box
    if (sgpaResult) {
      doc.setFillColor(240, 240, 240)
      doc.rect(20, 80, 170, 25, "F")
      doc.setFontSize(18)
      doc.text(`SGPA: ${sgpaResult}`, 30, 95)
      doc.setFontSize(12)
      doc.text(
        `Grade: ${sgpaResult >= 9 ? "A+" : sgpaResult >= 8 ? "A" : sgpaResult >= 7 ? "B+" : sgpaResult >= 6 ? "B" : "C"}`,
        30,
        102,
      )
      doc.text(
        `Performance: ${sgpaResult >= 8 ? "Excellent" : sgpaResult >= 6 ? "Good" : "Needs Improvement"}`,
        120,
        95,
      )
      doc.text(
        `Total Credits: ${subjects.reduce((sum, s) => sum + (s.marks && s.marks > 0 ? s.credits : 0), 0)}`,
        120,
        102,
      )
    }

    // Subject Details Table
    doc.setFontSize(14)
    doc.text("SUBJECT PERFORMANCE", 25, 120)

    // Table headers
    doc.setFillColor(220, 220, 220)
    doc.rect(20, 125, 170, 8, "F")
    doc.setFontSize(10)
    doc.text("Subject Name", 25, 130)
    doc.text("Credits", 100, 130)
    doc.text("Marks", 125, 130)
    doc.text("Grade", 150, 130)
    doc.text("Points", 170, 130)

    let yPos = 140
    subjects.forEach((subject, index) => {
      if (subject.name && subject.marks && subject.marks > 0) {
        const grade = calculateGradeFromMarks(subject.marks)
        const points = gradePoints[grade]

        // Alternate row colors
        if (index % 2 === 0) {
          doc.setFillColor(250, 250, 250)
          doc.rect(20, yPos - 5, 170, 8, "F")
        }

        doc.text(subject.name.substring(0, 25), 25, yPos)
        doc.text(subject.credits.toString(), 105, yPos)
        doc.text(subject.marks.toString(), 130, yPos)
        doc.text(grade, 155, yPos)
        doc.text(points.toString(), 175, yPos)
        yPos += 10
      }
    })

    // Grade Distribution
    yPos += 10
    doc.setFontSize(14)
    doc.text("GRADE DISTRIBUTION", 25, yPos)
    yPos += 10
    doc.setFontSize(11)

    Object.entries(gradeDistribution).forEach(([grade, count]) => {
      doc.setFontSize(11)
      doc.text(`${grade} (${getGradeDescription(grade)}): ${count} subject${count > 1 ? "s" : ""}`, 25, yPos)
      yPos += 8
    })

    // Performance Analysis
    yPos += 10
    doc.setFontSize(14)
    doc.text("PERFORMANCE ANALYSIS", 25, yPos)
    yPos += 10
    doc.setFontSize(11)

    const totalSubjects = subjects.filter((s) => s.marks && s.marks > 0).length
    const excellentGrades = (gradeDistribution["O"] || 0) + (gradeDistribution["A+"] || 0)
    const failedSubjects = gradeDistribution["F"] || 0

    doc.text(`• Total Subjects: ${totalSubjects}`, 25, yPos)
    yPos += 6
    doc.text(`• Excellent Performance (O/A+): ${excellentGrades} subjects`, 25, yPos)
    yPos += 6
    doc.text(`• Failed Subjects: ${failedSubjects} subjects`, 25, yPos)
    yPos += 6
    doc.text(`• Pass Percentage: ${(((totalSubjects - failedSubjects) / totalSubjects) * 100).toFixed(1)}%`, 25, yPos)

    // Footer
    doc.setFontSize(8)
    doc.text("Generated by VTU Vault - Your Academic Companion", 105, 280, { align: "center" })
    doc.text("This is a computer-generated report", 105, 285, { align: "center" })

    doc.save(`${studentName || "Student"}_Grade_Report_${new Date().toISOString().split("T")[0]}.pdf`)
  }

  // Update the getChartData function for better visualization
  const getChartData = () => {
    const gradeCount = subjects.reduce(
      (acc, subject) => {
        if (subject.marks && subject.marks > 0) {
          const grade = calculateGradeFromMarks(subject.marks)
          acc[grade] = (acc[grade] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>,
    )

    const colors = {
      O: "#10B981", // Green
      "A+": "#3B82F6", // Blue
      A: "#8B5CF6", // Purple
      "B+": "#F59E0B", // Yellow
      B: "#EF4444", // Red
      "C+": "#6B7280", // Gray
      C: "#9CA3AF", // Light Gray
      P: "#F97316", // Orange
      F: "#DC2626", // Dark Red
    }

    return {
      labels: Object.keys(gradeCount).map((grade) => `${grade} (${getGradeDescription(grade)})`),
      datasets: [
        {
          label: "Number of Subjects",
          data: Object.values(gradeCount),
          backgroundColor: Object.keys(gradeCount).map((grade) => colors[grade as keyof typeof colors]),
          borderWidth: 2,
          borderColor: "#ffffff",
        },
      ],
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-black dark:text-white mb-2">VTU Grading System & Calculator</h1>
          <p className="text-zinc-600 dark:text-zinc-400">Understand VTU grading and calculate your SGPA & CGPA</p>
        </motion.div>

            <Tabs defaultValue="grading-system" className="w-full">
      <TabsList className="w-full mb-8 bg-zinc-100 dark:bg-zinc-900 grid grid-cols-2 sm:grid-cols-4 gap-2">
        <TabsTrigger value="grading-system" className="rounded-xl w-full bg-zinc-100 dark:bg-zinc-900 text-center">
          Grading System
        </TabsTrigger>
        <TabsTrigger value="sgpa" className="rounded-xl w-full bg-zinc-100 dark:bg-zinc-900 text-center">
          SGPA Calculator
        </TabsTrigger>
        <TabsTrigger value="cgpa" className="rounded-xl w-full bg-zinc-100 dark:bg-zinc-900 text-center">
          CGPA Calculator
        </TabsTrigger>
        <TabsTrigger value="visualization" className="rounded-xl w-full bg-zinc-100 dark:bg-zinc-900 text-center">
          Visualization
        </TabsTrigger>
      </TabsList>
      <br></br>
      <br></br>





          {/* Grading System Explanation */}
          <TabsContent value="grading-system">
            <div className="space-y-8">
              {/* Grade Table */}
              <Card className="border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-black dark:text-white text-base md:text-lg">
                    <BookOpen className="h-5 w-5" />
                    VTU Grading Scale (CBCS Scheme)
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    Official grading system used by Visvesvaraya Technological University
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-xs md:text-sm">
                      <thead>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <th className="text-left p-2 md:p-3 font-semibold text-black dark:text-white text-xs md:text-sm">
                            Grade
                          </th>
                          <th className="text-left p-2 md:p-3 font-semibold text-black dark:text-white text-xs md:text-sm">
                            Points
                          </th>
                          <th className="text-left p-2 md:p-3 font-semibold text-black dark:text-white text-xs md:text-sm">
                            Marks
                          </th>
                          <th className="text-left p-2 md:p-3 font-semibold text-black dark:text-white text-xs md:text-sm">
                            Description
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {gradeRanges.map((grade, index) => (
                          <motion.tr
                            key={grade.grade}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 * index }}
                            className="border-b border-zinc-100 dark:border-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-950"
                          >
                            <td className="p-2 md:p-3">
                              <Badge
                                variant={grade.grade === "F" ? "destructive" : "default"}
                                className="font-mono text-xs"
                              >
                                {grade.grade}
                              </Badge>
                            </td>
                            <td className="p-2 md:p-3 font-mono text-black dark:text-white text-xs md:text-sm">
                              {grade.points}
                            </td>
                            <td className="p-2 md:p-3 font-mono text-zinc-600 dark:text-zinc-400 text-xs md:text-sm">
                              {grade.range}
                            </td>
                            <td className="p-2 md:p-3 text-zinc-600 dark:text-zinc-400 text-xs md:text-sm">
                              {grade.description}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* SGPA Formula */}
              <Card className="border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-black dark:text-white text-base md:text-lg">
                    SGPA (Semester Grade Point Average)
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    How to calculate your semester performance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-zinc-50 dark:bg-zinc-950 p-3 md:p-6 rounded-xl">
                    <h4 className="font-semibold text-black dark:text-white mb-2 text-sm md:text-base">Formula:</h4>
                    <div className="text-sm md:text-lg font-mono bg-white dark:bg-black p-2 md:p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
                      SGPA = Σ(Credit<sub>i</sub> × GradePoint<sub>i</sub>) / ΣCredit<sub>i</sub>
                    </div>
                    <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                      Where Credit<sub>i</sub> is the credit of the i-th subject and GradePoint<sub>i</sub> is the grade
                      point earned.
                    </p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/20 p-6 rounded-xl">
                    <h4 className="font-semibold text-black dark:text-white mb-2">Example Calculation:</h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-zinc-600 dark:text-zinc-400">
                        Subject 1: 4 credits, Grade A (8 points) = 4 × 8 = 32
                      </p>
                      <p className="text-zinc-600 dark:text-zinc-400">
                        Subject 2: 3 credits, Grade B+ (7 points) = 3 × 7 = 21
                      </p>
                      <p className="text-zinc-600 dark:text-zinc-400">
                        Subject 3: 2 credits, Grade A+ (9 points) = 2 × 9 = 18
                      </p>
                      <div className="border-t border-blue-200 dark:border-blue-800 pt-2 mt-2">
                        <p className="font-semibold text-black dark:text-white">
                          SGPA = (32 + 21 + 18) / (4 + 3 + 2) = 71 / 9 = 7.89
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CGPA Formula */}
              <Card className="border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-black dark:text-white text-base md:text-lg">
                    CGPA (Cumulative Grade Point Average)
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    How to calculate your overall academic performance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-zinc-50 dark:bg-zinc-950 p-3 md:p-6 rounded-xl">
                    <h4 className="font-semibold text-black dark:text-white mb-2 text-sm md:text-base">Formula:</h4>
                    <div className="text-sm md:text-lg font-mono bg-white dark:bg-black p-2 md:p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
                      CGPA = Σ(SGPA<sub>j</sub>) / Number of Semesters
                    </div>
                    <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                      Simple average of all semester SGPAs.
                    </p>
                  </div>

                  <div className="bg-green-50 dark:bg-green-950/20 p-3 md:p-6 rounded-xl">
                    <h4 className="font-semibold text-black dark:text-white mb-2 text-sm md:text-base">
                      Example Calculation:
                    </h4>
                    <div className="space-y-2 text-xs md:text-sm">
                      <p className="text-zinc-600 dark:text-zinc-400">Semester 1: SGPA 8.5</p>
                      <p className="text-zinc-600 dark:text-zinc-400">Semester 2: SGPA 7.8</p>
                      <p className="text-zinc-600 dark:text-zinc-400">Semester 3: SGPA 8.2</p>
                      <div className="border-t border-green-200 dark:border-green-800 pt-2 mt-2">
                        <p className="font-semibold text-black dark:text-white text-xs md:text-sm">
                          CGPA = (8.5 + 7.8 + 8.2) / 3 = 24.5 / 3 = 8.17
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Important Notes */}
              <Alert className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20">
                <Info className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <AlertDescription className="text-orange-800 dark:text-orange-200">
                  <strong>Important Notes:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>VTU follows this grading scheme for its CBCS (Choice Based Credit System) curriculum</li>
                    <li>An 'F' grade means fail (grade point 0) and affects your passing criteria</li>
                    <li>You must pass all subjects individually to be promoted to the next semester</li>
                    <li>Minimum CGPA of 4.0 is required for graduation</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>

          {/* SGPA Calculator */}
          <TabsContent value="sgpa">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="border-zinc-200 dark:border-zinc-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-black dark:text-white text-base md:text-lg">
                      <Calculator className="h-5 w-5" />
                      SGPA Calculator
                    </CardTitle>
                    <CardDescription className="text-xs md:text-sm">
                      Enter your subject details and marks to calculate SGPA
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Student Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl">
                        <Input
                          placeholder="Student Name"
                          value={studentName}
                          onChange={(e) => setStudentName(e.target.value)}
                          className="rounded-xl border-zinc-200 dark:border-zinc-800"
                        />
                        <Input
                          placeholder="USN"
                          value={usn}
                          onChange={(e) => setUsn(e.target.value)}
                          className="rounded-xl border-zinc-200 dark:border-zinc-800"
                        />
                      </div>

                      {subjects.map((subject, index) => (
                        <motion.div
                          key={subject.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 * index }}
                          className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl"
                        >
                          <Input
                            placeholder="Subject Name"
                            value={subject.name}
                            onChange={(e) => updateSubject(subject.id, "name", e.target.value)}
                            className="rounded-xl md:col-span-2"
                          />
                          <Input
                            type="number"
                            placeholder="Credits"
                            value={subject.credits}
                            onChange={(e) => updateSubject(subject.id, "credits", Number.parseInt(e.target.value) || 0)}
                            min="1"
                            max="6"
                            className="rounded-xl"
                          />
                          <Input
                            type="number"
                            placeholder="Marks (0-100)"
                            value={subject.marks || ""}
                            onChange={(e) => updateSubject(subject.id, "marks", Number.parseInt(e.target.value) || 0)}
                            min="0"
                            max="100"
                            className="rounded-xl"
                          />
                          <div className="flex items-center justify-center">
                            {subject.marks && subject.marks > 0 ? (
                              <Badge
                                variant={calculateGradeFromMarks(subject.marks) === "F" ? "destructive" : "default"}
                                className="font-mono text-sm"
                              >
                                {calculateGradeFromMarks(subject.marks)} (
                                {gradePoints[calculateGradeFromMarks(subject.marks)]})
                              </Badge>
                            ) : (
                              <span className="text-zinc-400 text-sm">Enter marks</span>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeSubject(subject.id)}
                            disabled={subjects.length === 1}
                            className="rounded-xl"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      ))}

                      <div className="flex gap-2">
                        <Button onClick={addSubject} variant="outline" className="rounded-xl bg-transparent">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Subject
                        </Button>
                        <Button
                          onClick={calculateSGPA}
                          className="bg-black dark:bg-white text-white dark:text-black rounded-xl"
                        >
                          Calculate SGPA
                        </Button>
                        <Button onClick={resetSGPA} variant="outline" className="rounded-xl bg-transparent">
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Reset
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card className="border-zinc-200 dark:border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-black dark:text-white text-base md:text-lg">SGPA Result</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {sgpaResult !== null ? (
                      <div className="text-center space-y-4">
                        <div className={`text-4xl font-bold ${getGradeColor(sgpaResult)}`}>{sgpaResult}</div>
                        <Progress value={getProgressValue(sgpaResult)} className="w-full" />
                        <div className="text-sm text-zinc-600 dark:text-zinc-400">Out of 10.0</div>
                        <Badge variant={sgpaResult >= 8 ? "default" : sgpaResult >= 6 ? "secondary" : "destructive"}>
                          {sgpaResult >= 8 ? "Excellent" : sgpaResult >= 6 ? "Good" : "Needs Improvement"}
                        </Badge>

                        {/* Grade Distribution Summary */}
                        {Object.keys(gradeDistribution).length > 0 && (
                          <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-950 rounded-lg">
                            <h4 className="font-semibold text-sm mb-2 text-black dark:text-white">
                              Grade Distribution
                            </h4>
                            <div className="space-y-1">
                              {Object.entries(gradeDistribution).map(([grade, count]) => (
                                <div key={grade} className="flex justify-between text-xs">
                                  <span className="text-zinc-600 dark:text-zinc-400">
                                    {grade} ({getGradeDescription(grade)})
                                  </span>
                                  <span className="font-medium text-black dark:text-white">{count}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <Button
                          onClick={downloadGradeReport}
                          className="w-full bg-black dark:bg-white text-white dark:text-black rounded-xl"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Report
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center text-zinc-600 dark:text-zinc-400 py-8">
                        Enter subject details and marks to calculate your SGPA
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* CGPA Calculator */}
          <TabsContent value="cgpa">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="border-zinc-200 dark:border-zinc-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-black dark:text-white text-base md:text-lg">
                      <Calculator className="h-5 w-5" />
                      CGPA Calculator
                    </CardTitle>
                    <CardDescription className="text-xs md:text-sm">Enter SGPA for each semester</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {semesters.map((semester, index) => (
                        <motion.div
                          key={semester.semester}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 * index }}
                          className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl"
                        >
                          <div className="flex items-center">
                            <Badge variant="outline" className="border-zinc-200 dark:border-zinc-800">
                              Semester {semester.semester}
                            </Badge>
                          </div>
                          <Input
                            type="number"
                            placeholder="SGPA"
                            value={semester.sgpa || ""}
                            onChange={(e) => updateSemester(semester.semester, Number.parseFloat(e.target.value) || 0)}
                            min="0"
                            max="10"
                            step="0.01"
                            className="rounded-xl"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeSemester(semester.semester)}
                            disabled={semesters.length === 1}
                            className="rounded-xl"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      ))}

                      <div className="flex gap-2">
                        <Button
                          onClick={addSemester}
                          variant="outline"
                          disabled={semesters.length >= 8}
                          className="rounded-xl"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Semester
                        </Button>
                        <Button
                          onClick={calculateCGPA}
                          className="bg-black dark:bg-white text-white dark:text-black rounded-xl"
                        >
                          Calculate CGPA
                        </Button>
                        <Button onClick={resetCGPA} variant="outline" className="rounded-xl bg-transparent">
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Reset
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="border-zinc-200 dark:border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-black dark:text-white text-base md:text-lg">CGPA Result</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {cgpaResult !== null ? (
                      <div className="text-center space-y-4">
                        <div className={`text-4xl font-bold ${getGradeColor(cgpaResult)}`}>{cgpaResult}</div>
                        <Progress value={getProgressValue(cgpaResult)} className="w-full" />
                        <div className="text-sm text-zinc-600 dark:text-zinc-400">Out of 10.0</div>
                        <Badge variant={cgpaResult >= 8 ? "default" : cgpaResult >= 6 ? "secondary" : "destructive"}>
                          {cgpaResult >= 8 ? "Excellent" : cgpaResult >= 6 ? "Good" : "Needs Improvement"}
                        </Badge>
                      </div>
                    ) : (
                      <div className="text-center text-zinc-600 dark:text-zinc-400 py-8">
                        Enter semester data and click calculate to see your CGPA
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Visualization */}
          <TabsContent value="visualization">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-black dark:text-white text-base md:text-lg">Grade Distribution</CardTitle>
                  <CardDescription className="text-xs md:text-sm">Visual representation of your grades</CardDescription>
                </CardHeader>
                <CardContent>
                  {subjects.some((s) => s.grade) ? (
                    <Pie
                      data={getChartData()}
                      options={{ responsive: true, maintainAspectRatio: false }}
                      height={300}
                    />
                  ) : (
                    <div className="text-center text-zinc-600 dark:text-zinc-400 py-8">
                      Add subjects with grades to see visualization
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-black dark:text-white text-base md:text-lg">Performance Summary</CardTitle>
                  <CardDescription className="text-xs md:text-sm">Your academic performance overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sgpaResult && (
                      <div className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl">
                        <span className="text-black dark:text-white">Current SGPA</span>
                        <span className={`font-bold ${getGradeColor(sgpaResult)}`}>{sgpaResult}</span>
                      </div>
                    )}
                    {cgpaResult && (
                      <div className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl">
                        <span className="text-black dark:text-white">Overall CGPA</span>
                        <span className={`font-bold ${getGradeColor(cgpaResult)}`}>{cgpaResult}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl">
                      <span className="text-black dark:text-white">Total Subjects</span>
                      <span className="font-bold text-black dark:text-white">
                        {subjects.filter((s) => s.grade).length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl">
                      <span className="text-black dark:text-white">Total Credits</span>
                      <span className="font-bold text-black dark:text-white">
                        {subjects.reduce((sum, s) => sum + (s.grade ? s.credits : 0), 0)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Copyright Footer */}
        <footer className="py-3 md:py-6 px-2 md:px-4 border-t border-zinc-200 dark:border-zinc-800 mt-12">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              © 2024 VTU Vault. Created by <span className="font-semibold text-black dark:text-white">Afzal</span>. All
              rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
