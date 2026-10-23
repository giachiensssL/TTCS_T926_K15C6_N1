import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  getAssignmentsApi,
  createAssignmentApi,
  getSubmissionsApi,
  submitAssignmentApi,
  gradeSubmissionApi,
  aiGradeSubmissionApi,
  aiGenerateExamApi,
  parseWordExamApi,
  verifyExamAccessCodeApi,
  toggleExamLockApi,
  reportCheatAlertApi,
  getCheatAlertsApi,
  getAcademicDataApi,
  AssignmentItem,
  SubmissionItem,
  QuestionItem,
  CheatAlertItem,
  ClassItem,
} from '../api/academicApi'
import { extractApiError } from '../api/authApi'
import { useAuthStore } from '../store/authStore'
import {
  BookOpen,
  Plus,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  X,
  FileCheck,
  Star,
  ShieldAlert,
  Key,
  Lock,
  Sparkles,
  FileText,
  Maximize2,
  Eye,
  Copy,
  Timer,
  BrainCircuit,
  CheckCircle, Check,
} from 'lucide-react'

export default function AssignmentsPage() {
  const { user } = useAuthStore()
  const isTeacher = user?.roles.some((r) => ['TEACHER', 'TRAINING_MANAGER', 'ADMIN'].includes(r))
  const isStudent = user?.roles.includes('STUDENT')

  const [assignments, setAssignments] = useState<AssignmentItem[]>([])
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [loading, setLoading] = useState(false)
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'QUIZ_15M' | 'FINAL_EXAM' | 'HOMEWORK'>('ALL')
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // -------------------------------------------------------------
  // MODAL TẠO BÀI TẬP / ĐỀ THI LMS (3 Chế độ: AI, Word, Thủ công)
  // -------------------------------------------------------------
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createTab, setCreateTab] = useState<'AI' | 'WORD' | 'MANUAL'>('AI')
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newClassId, setNewClassId] = useState('')
  const [newType, setNewType] = useState<'QUIZ_15M' | 'FINAL_EXAM' | 'HOMEWORK'>('QUIZ_15M')
  const [newDuration, setNewDuration] = useState<number>(15)
  const [newAccessCode, setNewAccessCode] = useState<string>('')
  const [newIsLocked, setNewIsLocked] = useState<boolean>(true)
  const [newQuestionType, setNewQuestionType] = useState<'MULTIPLE_CHOICE' | 'ESSAY' | 'HYBRID'>('HYBRID')
  const [newDeadline, setNewDeadline] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  )
  const [newMaxScore, setNewMaxScore] = useState(10)
  const [questionsList, setQuestionsList] = useState<QuestionItem[]>([])
  const [creating, setCreating] = useState(false)

  // AI Generator state
  const [aiSubject, setAiSubject] = useState<'web' | 'database' | 'ai'>('web')
  const [aiDifficulty, setAiDifficulty] = useState<'BASIC' | 'MEDIUM' | 'ADVANCED'>('MEDIUM')
  const [aiMcCount, setAiMcCount] = useState<number>(4)
  const [aiEssayCount, setAiEssayCount] = useState<number>(1)
  const [aiGenerating, setAiGenerating] = useState(false)

  // Word Parser state
  const [wordText, setWordText] = useState('')
  const [parsingWord, setParsingWord] = useState(false)

  // -------------------------------------------------------------
  // MODAL LÀM BÀI THI & GIÁM SÁT GIAN LẬN (Safe Exam Proctoring)
  // -------------------------------------------------------------
  const [examModalOpen, setExamModalOpen] = useState(false)
  const [activeExam, setActiveExam] = useState<AssignmentItem | null>(null)
  const [accessCodeInput, setAccessCodeInput] = useState('')
  const [isExamUnlocked, setIsExamUnlocked] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [answersMap, setAnswersMap] = useState<Record<string, { selectedOption?: string; essayAnswer?: string }>>({})
  const [studentNote, setStudentNote] = useState('')
  const [repoUrl, setRepoUrl] = useState('')
  const [violationCount, setViolationCount] = useState<number>(0)
  const [cheatWarningBanner, setCheatWarningBanner] = useState<string | null>(null)
  const [submittingExam, setSubmittingExam] = useState(false)

  // Ref theo dõi vi phạm
  const violationCountRef = useRef(0)
  const timerRef = useRef<any>(null)
  const isTakingExamRef = useRef(false)

  // -------------------------------------------------------------
  // TRUNG TÂM GIÁM SÁT GIAN LẬN THỜI GIAN THỰC (Live Proctoring)
  // -------------------------------------------------------------
  const [proctoringModalOpen, setProctoringModalOpen] = useState(false)
  const [proctoringLogs, setProctoringLogs] = useState<CheatAlertItem[]>([])
  const [loadingProctoring, setLoadingProctoring] = useState(false)

  // -------------------------------------------------------------
  // MODAL XEM BÀI NỘP & CHẤM ĐIỂM (Thủ công & AI)
  // -------------------------------------------------------------
  const [gradeModalOpen, setGradeModalOpen] = useState(false)
  const [selectedAsm, setSelectedAsm] = useState<AssignmentItem | null>(null)
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([])
  const [loadingSubs, setLoadingSubs] = useState(false)
  const [selectedSub, setSelectedSub] = useState<SubmissionItem | null>(null)
  const [inputScore, setInputScore] = useState<number>(10)
  const [inputFeedback, setInputFeedback] = useState('')
  const [isResubmit, setIsResubmit] = useState(false)
  const [grading, setGrading] = useState(false)
  const [aiGradingLoading, setAiGradingLoading] = useState(false)

  // -------------------------------------------------------------
  // TẢI DỮ LIỆU
  // -------------------------------------------------------------
  const loadAssignments = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getAssignmentsApi()
      setAssignments(res.data)
    } catch (err) {
      const apiErr = extractApiError(err)
      setFeedback({ type: 'error', message: apiErr.message })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAssignments()
  }, [loadAssignments])

  useEffect(() => {
    async function loadAcademic() {
      try {
        const res = await getAcademicDataApi()
        setClasses(res.classes)
        if (res.classes.length > 0 && !newClassId) {
          setNewClassId(res.classes[0].id)
        }
      } catch (e) {
        console.error(e)
      }
    }
    loadAcademic()
  }, [newClassId])

  // Lắng nghe sự kiện chuyển tab / blur để cảnh báo gian lận khi học sinh đang làm bài
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!isTakingExamRef.current || !activeExam) return

      if (document.hidden) {
        violationCountRef.current += 1
        setViolationCount(violationCountRef.current)
        setCheatWarningBanner(
          'CẢNH BÁO GIAN LẬN: Bạn vừa chuyển sang tab khác (Lần thứ ' + violationCountRef.current + ')! Hệ thống đã tự động gửi báo cáo vi phạm tới Giám thị.'
        )

        try {
          await reportCheatAlertApi(activeExam.id, {
            violationType: 'TAB_SWITCH',
            details: 'Học sinh chuyển tab trình duyệt lần thứ ' + violationCountRef.current,
          })
        } catch (e) {
          console.error('Không thể gửi cảnh báo gian lận:', e)
        }
      }
    }

    const handleWindowBlur = async () => {
      if (!isTakingExamRef.current || !activeExam) return

      violationCountRef.current += 1
      setViolationCount(violationCountRef.current)
      setCheatWarningBanner(
        'CẢNH BÁO GIAN LẬN: Bạn vừa rời khỏi cửa sổ làm bài (Lần thứ ' + violationCountRef.current + ')! Hành vi này đã được ghi nhận.'
      )

      try {
        await reportCheatAlertApi(activeExam.id, {
          violationType: 'WINDOW_BLUR',
          details: 'Học sinh rời khỏi cửa sổ làm bài lần thứ ' + violationCountRef.current,
        })
      } catch (e) {
        console.error(e)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleWindowBlur)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleWindowBlur)
    }
  }, [activeExam])

  // Countdown timer khi làm bài
  useEffect(() => {
    if (examModalOpen && isExamUnlocked && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            handleAutoSubmitOnTimeOut()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [examModalOpen, isExamUnlocked, timeLeft])

﻿  // -------------------------------------------------------------
  // XỬ LÝ SINH ĐỀ AI & WORD PARSER
  // -------------------------------------------------------------
  const handleAiGenerate = async () => {
    setAiGenerating(true)
    try {
      const res = await aiGenerateExamApi({
        subject: aiSubject,
        type: newType,
        mcCount: aiMcCount,
        essayCount: aiEssayCount,
        difficulty: aiDifficulty,
      })
      setNewTitle(res.title)
      setNewDesc(res.description)
      setNewDuration(res.durationMinutes)
      setQuestionsList(res.questions)
      setFeedback({ type: 'success', message: res.message })
    } catch (err) {
      const apiErr = extractApiError(err)
      setFeedback({ type: 'error', message: apiErr.message })
    } finally {
      setAiGenerating(false)
    }
  }

  const handleParseWord = async () => {
    if (!wordText.trim()) {
      setFeedback({ type: 'error', message: 'Vui lòng dán nội dung câu hỏi từ Word.' })
      return
    }
    setParsingWord(true)
    try {
      const res = await parseWordExamApi(wordText)
      setQuestionsList(res.questions)
      setFeedback({ type: 'success', message: res.message })
    } catch (err) {
      const apiErr = extractApiError(err)
      setFeedback({ type: 'error', message: apiErr.message })
    } finally {
      setParsingWord(false)
    }
  }

  // Xử lý tạo bài tập / đề thi
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) {
      setFeedback({ type: 'error', message: 'Vui lòng nhập tiêu đề bài kiểm tra / bài thi.' })
      return
    }

    setCreating(true)
    try {
      const targetClassId = newClassId || (classes[0] ? classes[0].id : 'cls_k15_web01')
      const res = await createAssignmentApi({
        classId: targetClassId,
        title: newTitle,
        description: newDesc,
        deadline: newDeadline,
        maxScore: newMaxScore,
        type: newType,
        durationMinutes: newDuration,
        accessCode: newAccessCode || (newType === 'FINAL_EXAM' ? ('EXAM-' + Math.floor(1000 + Math.random() * 9000)) : ''),
        isLocked: newIsLocked,
        questionType: newQuestionType,
        questions: questionsList,
      })
      setFeedback({ type: 'success', message: res.message })
      setCreateModalOpen(false)
      setNewTitle('')
      setNewDesc('')
      setQuestionsList([])
      setWordText('')
      loadAssignments()
    } catch (err) {
      const apiErr = extractApiError(err)
      setFeedback({ type: 'error', message: apiErr.message })
    } finally {
      setCreating(false)
    }
  }

  // -------------------------------------------------------------
  // XỬ LÝ VÀO PHÒNG THI & LÀM BÀI
  // -------------------------------------------------------------
  const handleOpenExam = (asm: AssignmentItem) => {
    setActiveExam(asm)
    setAnswersMap({})
    setStudentNote('')
    setRepoUrl('')
    setViolationCount(0)
    violationCountRef.current = 0
    setCheatWarningBanner(null)
    setAccessCodeInput('')

    const isFinalLocked = asm.type === 'FINAL_EXAM' && asm.isLocked
    if (isFinalLocked) {
      setIsExamUnlocked(false)
    } else {
      setIsExamUnlocked(true)
      const duration = (asm.durationMinutes || 15) * 60
      setTimeLeft(duration)
      isTakingExamRef.current = true
    }

    setExamModalOpen(true)
  }

  const handleVerifyAccessCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeExam) return
    try {
      const res = await verifyExamAccessCodeApi(activeExam.id, accessCodeInput)
      setFeedback({ type: 'success', message: res.message })
      setIsExamUnlocked(true)
      const duration = (activeExam.durationMinutes || 15) * 60
      setTimeLeft(duration)
      isTakingExamRef.current = true
    } catch (err) {
      const apiErr = extractApiError(err)
      setFeedback({ type: 'error', message: apiErr.message })
    }
  }

  const triggerFullScreen = () => {
    const elem = document.documentElement
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(() => {})
    }
  }

  const handleSubmitExam = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!activeExam) return

    setSubmittingExam(true)
    isTakingExamRef.current = false

    const formattedAnswers = Object.entries(answersMap).map(([qId, ans]) => ({
      questionId: qId,
      selectedOption: ans.selectedOption,
      essayAnswer: ans.essayAnswer,
    }))

    try {
      const res = await submitAssignmentApi(activeExam.id, {
        answers: formattedAnswers,
        note: studentNote,
        repoUrl,
        violationCount: violationCountRef.current,
        accessCodeEntered: accessCodeInput,
      })
      setFeedback({ type: 'success', message: res.message })
      setExamModalOpen(false)
      loadAssignments()
    } catch (err) {
      const apiErr = extractApiError(err)
      setFeedback({ type: 'error', message: apiErr.message })
    } finally {
      setSubmittingExam(false)
    }
  }

  const handleAutoSubmitOnTimeOut = () => {
    alert('HẾT THỜI GIAN LÀM BÀI! Hệ thống đang tự động nộp bài làm của bạn.')
    handleSubmitExam()
  }

  const handleToggleExamLock = async (asm: AssignmentItem) => {
    try {
      const res = await toggleExamLockApi(asm.id, !asm.isLocked)
      setFeedback({ type: 'success', message: res.message })
      setAssignments((prev) =>
        prev.map((item) => (item.id === asm.id ? { ...item, isLocked: res.isLocked } : item))
      )
    } catch (err) {
      const apiErr = extractApiError(err)
      setFeedback({ type: 'error', message: apiErr.message })
    }
  }

  const openProctoringCenter = async (examId?: string) => {
    setProctoringModalOpen(true)
    setLoadingProctoring(true)
    try {
      const res = await getCheatAlertsApi(examId)
      setProctoringLogs(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingProctoring(false)
    }
  }

  const openGradeModal = async (asm: AssignmentItem) => {
    setSelectedAsm(asm)
    setGradeModalOpen(true)
    setLoadingSubs(true)
    try {
      const res = await getSubmissionsApi(asm.id)
      setSubmissions(res.data)
      if (res.data.length > 0) {
        setSelectedSub(res.data[0])
        setInputScore(res.data[0].score || 10)
        setInputFeedback(res.data[0].feedback || '')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingSubs(false)
    }
  }

  const handleGrade = async () => {
    if (!selectedSub) return
    setGrading(true)
    try {
      const res = await gradeSubmissionApi({
        submissionId: selectedSub.id,
        score: inputScore,
        feedback: inputFeedback,
        requestResubmit: isResubmit,
      })
      setFeedback({ type: 'success', message: res.message })
      setGradeModalOpen(false)
      loadAssignments()
    } catch (err) {
      const apiErr = extractApiError(err)
      setFeedback({ type: 'error', message: apiErr.message })
    } finally {
      setGrading(false)
    }
  }

  const handleAiAutoGrade = async () => {
    if (!selectedSub) return
    setAiGradingLoading(true)
    try {
      const res = await aiGradeSubmissionApi(selectedSub.id)
      setFeedback({ type: 'success', message: res.message })
      setSelectedSub(res.submission)
      setInputScore(res.submission.score || 10)
      setInputFeedback(res.submission.feedback || '')
      setSubmissions((prev) =>
        prev.map((s) => (s.id === res.submission.id ? res.submission : s))
      )
    } catch (err) {
      const apiErr = extractApiError(err)
      setFeedback({ type: 'error', message: apiErr.message })
    } finally {
      setAiGradingLoading(false)
    }
  }

  const filteredAssignments = assignments.filter((asm) => {
    if (activeFilter === 'ALL') return true
    return asm.type === activeFilter
  })

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s
  }

﻿  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header Phân hệ LMS */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-xs font-bold mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Phân hệ Khảo thí LMS & Giám Sát Chống Gian Lận (Sprint 5 & 6)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Quản Lý Đề Thi, Kiểm Tra 15P & Bài Tập LMS
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Hỗ trợ ra đề AI & file Word, trắc nghiệm/tự luận, mã bảo mật kích hoạt thi và giám sát chống chuyển tab
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isTeacher && (
            <>
              <button
                onClick={() => openProctoringCenter()}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 shadow-xs transition-all cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 text-rose-600 animate-pulse" />
                <span>Giám Sát Gian Lận</span>
              </button>

              <button
                onClick={() => {
                  setNewTitle('')
                  setNewDesc('')
                  setQuestionsList([])
                  setCreateModalOpen(true)
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tạo Đề Thi / Bài Kiểm Tra</span>
              </button>
            </>
          )}
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs Bộ lọc */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { key: 'ALL', label: 'Tất cả bài LMS', count: assignments.length },
          {
            key: 'QUIZ_15M',
            label: '⚡ Kiểm tra 15 Phút',
            count: assignments.filter((a) => a.type === 'QUIZ_15M').length,
          },
          {
            key: 'FINAL_EXAM',
            label: '🎓 Thi Kết Thúc Học Phần',
            count: assignments.filter((a) => a.type === 'FINAL_EXAM').length,
          },
          {
            key: 'HOMEWORK',
            label: '📚 Bài tập tự luyện',
            count: assignments.filter((a) => a.type === 'HOMEWORK' || !a.type).length,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeFilter === tab.key
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/80'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeFilter === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Danh sách đề thi & bài tập */}
      {loading ? (
        <div className="p-12 text-center text-xs text-gray-500 bg-white rounded-3xl border border-gray-100">
          Đang tải danh sách bài tập & đề thi LMS...
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-gray-200/80 space-y-3">
          <BookOpen className="w-8 h-8 text-gray-300 mx-auto" />
          <p className="text-xs font-bold text-gray-500">Chưa có bài kiểm tra hoặc đề thi nào thuộc danh mục này.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAssignments.map((asm) => {
            const isQuiz = asm.type === 'QUIZ_15M'
            const isFinal = asm.type === 'FINAL_EXAM'
            const hasQuestions = asm.questions && asm.questions.length > 0

            return (
              <div
                key={asm.id}
                className="bg-white rounded-3xl border border-gray-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative overflow-hidden"
              >
                {/* Header Card */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    {isFinal ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-[11px] font-bold">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Thi Kết Thúc Học Phần</span>
                      </span>
                    ) : isQuiz ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-full text-[11px] font-bold">
                        <Timer className="w-3.5 h-3.5" />
                        <span>Kiểm tra 15 Phút</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[11px] font-bold">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Bài tập tự luyện</span>
                      </span>
                    )}

                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg">
                      {asm.className || 'Toàn trường'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900 text-sm line-clamp-2">{asm.title}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{asm.description || 'Không có mô tả chi tiết.'}</p>
                  </div>

                  {/* Thông số đề thi */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-gray-50 rounded-2xl text-[11px] font-medium text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>{asm.durationMinutes || 15} phút</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-gray-400" />
                      <span>{hasQuestions ? `${asm.questions?.length} câu hỏi` : 'Đề tự do'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-500" />
                      <span>Thang điểm: {asm.maxScore || 10}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        {asm.questionType === 'MULTIPLE_CHOICE'
                          ? 'Trắc nghiệm'
                          : asm.questionType === 'ESSAY'
                          ? 'Tự luận'
                          : 'Trắc nghiệm & Tự luận'}
                      </span>
                    </div>
                  </div>

                  {/* Thông tin dành cho Giảng viên / Quản lý / Admin */}
                  {isTeacher && isFinal && (
                    <div className="p-3 bg-rose-50/70 border border-rose-200/80 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 font-bold text-rose-900">
                          <Key className="w-3.5 h-3.5 text-rose-600" />
                          <span>Mã kích hoạt phòng thi:</span>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(asm.accessCode || '')
                            alert('Đã sao chép mã thi: ' + (asm.accessCode || ''))
                          }}
                          className="flex items-center gap-1 text-[11px] font-mono font-bold bg-white px-2 py-0.5 rounded-lg border border-rose-300 text-rose-800 hover:bg-rose-100 cursor-pointer"
                          title="Bấm để sao chép mã"
                        >
                          <span>{asm.accessCode || 'EXAM-2026'}</span>
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-rose-200/60 text-[11px]">
                        <span className="font-semibold text-rose-800">
                          Trạng thái: {asm.isLocked ? '🔒 Đang khóa (Cần mã thi)' : '🔓 Đang mở tự do'}
                        </span>
                        <button
                          onClick={() => handleToggleExamLock(asm)}
                          className="font-bold text-indigo-600 hover:underline cursor-pointer"
                        >
                          {asm.isLocked ? 'Mở phòng' : 'Khóa phòng'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  {/* Học viên làm bài */}
                  {isStudent && (
                    <div className="w-full">
                      {asm.mySubmission ? (
                        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-emerald-800">Đã nộp bài</span>
                            {asm.mySubmission.score !== null && (
                              <span className="ml-2 font-black text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-300">
                                {asm.mySubmission.score} / {asm.maxScore || 10}đ
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleOpenExam(asm)}
                            className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                          >
                            Làm lại
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenExam(asm)}
                          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {isFinal ? <Key className="w-4 h-4" /> : <Timer className="w-4 h-4" />}
                          <span>{isFinal ? 'Nhập Mã & Vào Thi' : 'Bắt Đầu Làm Bài'}</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Giảng viên chấm điểm & xem giám sát */}
                  {isTeacher && (
                    <div className="w-full flex items-center gap-2">
                      <button
                        onClick={() => openProctoringCenter(asm.id)}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl border border-rose-200 transition-all cursor-pointer"
                        title="Xem cảnh báo gian lận"
                      >
                        <ShieldAlert className="w-4 h-4 text-rose-600" />
                      </button>

                      <button
                        onClick={() => openGradeModal(asm)}
                        className="flex-1 py-2 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-700 text-gray-700 font-bold text-xs rounded-xl border border-gray-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <FileCheck className="w-4 h-4" />
                        <span>Bài Nộp ({asm.submissionsCount || 0})</span>
                      </button>

                      <button
                        onClick={() => handleOpenExam(asm)}
                        className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl border border-indigo-200 transition-all cursor-pointer"
                        title="Xem trước đề thi"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

﻿      {/* =========================================================
          MODAL 1: TẠO BÀI TẬP / ĐỀ THI LMS (AI, WORD, THỦ CÔNG)
      ========================================================= */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-3xl rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-indigo-600" />
                  <span>Tạo Đề Thi / Bài Kiểm Tra Trực Tuyến LMS</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tích hợp AI sinh đề, bóc tách đề file Word và thiết lập mã bảo mật phòng thi
                </p>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chuyển đổi phương thức ra đề */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setCreateTab('AI')}
                className={`py-2 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  createTab === 'AI' ? 'bg-white text-indigo-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>1. AI Tự Động Ra Đề</span>
              </button>
              <button
                type="button"
                onClick={() => setCreateTab('WORD')}
                className={`py-2 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  createTab === 'WORD' ? 'bg-white text-indigo-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FileText className="w-4 h-4 text-amber-600" />
                <span>2. Dán / File Word</span>
              </button>
              <button
                type="button"
                onClick={() => setCreateTab('MANUAL')}
                className={`py-2 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  createTab === 'MANUAL' ? 'bg-white text-indigo-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>3. Nhập Thủ Công</span>
              </button>
            </div>

            {/* TAB 1: AI GENERATOR */}
            {createTab === 'AI' && (
              <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    Cấu hình Trợ lý AI Sinh Đề Thi Chuẩn Kiến Thức:
                  </span>
                  <span className="text-[11px] text-indigo-600 font-semibold">Tự động tạo câu hỏi trắc nghiệm & tự luận</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Môn học đào tạo *</label>
                    <select
                      value={aiSubject}
                      onChange={(e) => setAiSubject(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="web">Lập trình Web Fullstack</option>
                      <option value="database">Cơ sở Dữ liệu & SQL/NoSQL</option>
                      <option value="ai">Trí tuệ Nhân tạo & Machine Learning</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Độ khó đề thi *</label>
                    <select
                      value={aiDifficulty}
                      onChange={(e) => setAiDifficulty(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="BASIC">Cơ bản (Nhận biết)</option>
                      <option value="MEDIUM">Trung bình (Thông hiểu & Vận dụng)</option>
                      <option value="ADVANCED">Nâng cao (Phân tích & Tối ưu)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Số câu Trắc nghiệm & Tự luận</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={aiMcCount}
                        onChange={(e) => setAiMcCount(Number(e.target.value))}
                        className="w-1/2 px-2.5 py-2 bg-white border border-gray-200 rounded-xl text-center font-bold"
                        title="Số câu trắc nghiệm"
                      />
                      <input
                        type="number"
                        min={0}
                        max={5}
                        value={aiEssayCount}
                        onChange={(e) => setAiEssayCount(Number(e.target.value))}
                        className="w-1/2 px-2.5 py-2 bg-white border border-gray-200 rounded-xl text-center font-bold"
                        title="Số câu tự luận"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={aiGenerating}
                  onClick={handleAiGenerate}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{aiGenerating ? 'AI đang phân tích kiến thức và sinh đề...' : 'Kích Hoạt AI Sinh Đề Tự Động'}</span>
                </button>
              </div>
            )}

            {/* TAB 2: WORD PARSER */}
            {createTab === 'WORD' && (
              <div className="p-4 bg-amber-50/60 border border-amber-100 rounded-2xl space-y-3 text-xs">
                <span className="font-bold text-amber-900 block">
                  Dán nội dung từ file Word / Văn bản câu hỏi (Hỗ trợ định dạng: Câu 1: ... A. ... B. ... Đáp án: A):
                </span>
                <textarea
                  rows={4}
                  value={wordText}
                  onChange={(e) => setWordText(e.target.value)}
                  placeholder="Câu 1: Giao thức nào hoạt động ở tầng Transport?&#10;A. TCP&#10;B. HTTP&#10;C. IP&#10;D. ARP&#10;Đáp án: A"
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl font-mono focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  disabled={parsingWord}
                  onClick={handleParseWord}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>{parsingWord ? 'Đang phân tích cú pháp...' : 'Trích Xuất Câu Hỏi Tự Động Từ Văn Bản'}</span>
                </button>
              </div>
            )}

            {/* Form Thiết Lập Chi Tiết Đề Thi */}
            <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Dạng bài thi / kiểm tra *</label>
                  <select
                    value={newType}
                    onChange={(e) => {
                      const t = e.target.value as any
                      setNewType(t)
                      if (t === 'QUIZ_15M') {
                        setNewDuration(15)
                        setNewAccessCode('QUIZ-15M')
                      } else if (t === 'FINAL_EXAM') {
                        setNewDuration(60)
                        setNewAccessCode('EXAM-' + Math.floor(1000 + Math.random() * 9000))
                        setNewIsLocked(true)
                      } else {
                        setNewDuration(30)
                        setNewAccessCode('')
                        setNewIsLocked(false)
                      }
                    }}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="QUIZ_15M">⚡ Bài Kiểm Tra 15 Phút</option>
                    <option value="FINAL_EXAM">🎓 Thi Kết Thúc Học Phần (Có Mã Bảo Mật)</option>
                    <option value="HOMEWORK">📚 Bài Tập Tự Luyện</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Hình thức câu hỏi *</label>
                  <select
                    value={newQuestionType}
                    onChange={(e) => setNewQuestionType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="HYBRID">Kết hợp Trắc nghiệm & Tự luận</option>
                    <option value="MULTIPLE_CHOICE">Chỉ Trắc nghiệm (A, B, C, D)</option>
                    <option value="ESSAY">Chỉ Tự luận</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Tiêu đề bài kiểm tra / bài thi *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Kiểm tra 15 phút: Lập trình JavaScript & DOM"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Lớp học chỉ định *</label>
                  <select
                    value={newClassId}
                    onChange={(e) => setNewClassId(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} - {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Thời gian làm bài (Phút) *</label>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Hạn chót nộp bài</label>
                  <input
                    type="datetime-local"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Thiết lập bảo mật cho bài thi kết thúc môn */}
              {newType === 'FINAL_EXAM' && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="block font-bold text-rose-900 mb-1 flex items-center gap-1.5">
                      <Key className="w-4 h-4 text-rose-600" />
                      <span>Mã kích hoạt phòng thi (Bảo mật cho Giám thị) *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newAccessCode}
                      onChange={(e) => setNewAccessCode(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 bg-white border border-rose-300 rounded-xl font-mono font-bold uppercase focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-4 sm:pt-0">
                    <input
                      type="checkbox"
                      id="examLockCheck"
                      checked={newIsLocked}
                      onChange={(e) => setNewIsLocked(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded-md cursor-pointer"
                    />
                    <label htmlFor="examLockCheck" className="text-xs font-bold text-rose-900 cursor-pointer">
                      Khóa phòng thi (Yêu cầu Giám thị cấp mã để mở đề)
                    </label>
                  </div>
                </div>
              )}

              {/* Danh sách câu hỏi đã tạo / sinh ra */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    Danh sách câu hỏi trong đề ({questionsList.length} câu):
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setQuestionsList([
                        ...questionsList,
                        {
                          id: 'custom_q_' + Date.now(),
                          type: 'MULTIPLE_CHOICE',
                          prompt: 'Nhập nội dung câu hỏi...',
                          options: ['A. Lựa chọn 1', 'B. Lựa chọn 2', 'C. Lựa chọn 3', 'D. Lựa chọn 4'],
                          correctAnswer: 'A',
                          points: 2,
                        },
                      ])
                    }}
                    className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    + Thêm câu hỏi thủ công
                  </button>
                </div>

                {questionsList.length === 0 ? (
                  <p className="text-gray-400 italic text-[11px]">Chưa có câu hỏi nào. Hãy dùng nút Sinh đề AI hoặc thêm câu hỏi.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {questionsList.map((q, idx) => (
                      <div key={q.id || idx} className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-gray-800">
                          <span>
                            Câu {idx + 1} ({q.type === 'MULTIPLE_CHOICE' ? 'Trắc nghiệm' : 'Tự luận'}) - {q.points || 2} điểm
                          </span>
                          <button
                            type="button"
                            onClick={() => setQuestionsList(questionsList.filter((_, i) => i !== idx))}
                            className="text-rose-600 hover:text-rose-800 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-gray-700 font-medium">{q.prompt}</p>
                        {q.type === 'MULTIPLE_CHOICE' && q.options && (
                          <div className="grid grid-cols-2 gap-1 text-[11px] text-gray-500 pt-1">
                            {q.options.map((opt, oIdx) => (
                              <span key={oIdx} className={opt.startsWith(q.correctAnswer || 'A') ? 'font-bold text-emerald-700' : ''}>
                                {opt}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{creating ? 'Đang khởi tạo...' : 'Công Bố Đề Thi / Bài Kiểm Tra'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

﻿      {/* =========================================================
          MODAL 2: GIAO DIỆN LÀM BÀI THI & CHỐNG GIAN LẬN
      ========================================================= */}
      {examModalOpen && activeExam && (
        <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
            {/* Header phòng thi */}
            <div className="p-4 sm:p-5 bg-gray-900 text-white flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-rose-600 text-white rounded-full text-[10px] font-black uppercase tracking-wider">
                    Phòng Thi Trực Tuyến SafeExam
                  </span>
                  <span className="text-xs text-gray-300 font-bold">{activeExam.className}</span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-white">{activeExam.title}</h2>
              </div>

              <div className="flex items-center gap-3">
                {isExamUnlocked && (
                  <div className="flex items-center gap-2 px-3.5 py-1.5 bg-amber-500/20 border border-amber-400/40 text-amber-300 rounded-xl font-mono text-sm font-black">
                    <Timer className="w-4 h-4 animate-spin text-amber-400" />
                    <span>{formatTime(timeLeft)}</span>
                  </div>
                )}

                <button
                  onClick={triggerFullScreen}
                  className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl cursor-pointer"
                  title="Toàn màn hình"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    if (window.confirm('Bạn có chắc chắn muốn thoát khỏi phòng thi? Bài làm có thể bị hủy.')) {
                      isTakingExamRef.current = false
                      setExamModalOpen(false)
                    }
                  }}
                  className="text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Banner Cảnh Báo Gian Lận Nhấp Nháy Khi Vi Phạm */}
            {cheatWarningBanner && (
              <div className="p-3 bg-rose-600 text-white text-xs font-black flex items-center justify-between animate-bounce">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <span>{cheatWarningBanner}</span>
                </div>
                <span className="bg-black/30 px-2 py-0.5 rounded-md text-[11px]">
                  Tổng vi phạm: {violationCount} lần
                </span>
              </div>
            )}

            {/* Nội dung phòng thi */}
            <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 text-xs">
              {!isExamUnlocked ? (
                <div className="max-w-md mx-auto my-12 p-6 bg-rose-50/50 border border-rose-200 rounded-3xl text-center space-y-4">
                  <div className="w-12 h-12 bg-rose-100 text-rose-700 rounded-2xl flex items-center justify-center mx-auto">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Phòng Thi Được Bảo Mật</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Đây là bài thi kết thúc học phần. Vui lòng nhập <b>Mã Kích Hoạt</b> do Giám thị coi thi cung cấp để bắt đầu.
                    </p>
                  </div>

                  <form onSubmit={handleVerifyAccessCode} className="space-y-3">
                    <input
                      type="text"
                      required
                      placeholder="Nhập mã kích hoạt (Ví dụ: EXAM-XXXX)"
                      value={accessCodeInput}
                      onChange={(e) => setAccessCodeInput(e.target.value.toUpperCase())}
                      className="w-full px-4 py-2.5 bg-white border border-rose-300 rounded-xl text-center font-mono font-black text-sm uppercase focus:ring-2 focus:ring-rose-500"
                    />
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Key className="w-4 h-4" />
                      <span>Xác Thực Mã & Bắt Đầu Làm Bài</span>
                    </button>
                  </form>
                </div>
              ) : (
                <form onSubmit={handleSubmitExam} className="space-y-6">
                  <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-between text-indigo-900">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-indigo-600" />
                      <span className="font-bold">
                        Hệ thống đang kích hoạt giám sát chống gian lận. Nghiêm cấm chuyển tab, mở ứng dụng khác hoặc thoát màn hình!
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-rose-600 bg-white px-2 py-0.5 rounded-lg border border-rose-200">
                      Số lần vi phạm: {violationCount}
                    </span>
                  </div>

                  {activeExam.questions && activeExam.questions.length > 0 ? (
                    <div className="space-y-5">
                      {activeExam.questions.map((q, idx) => {
                        const currentAns = answersMap[q.id] || {}
                        return (
                          <div key={q.id || idx} className="p-4 bg-gray-50 border border-gray-200/80 rounded-2xl space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-indigo-950 text-xs">
                                Câu {idx + 1}: ({q.type === 'MULTIPLE_CHOICE' ? 'Trắc nghiệm' : 'Tự luận'})
                              </span>
                              <span className="text-[11px] font-bold text-gray-500">{q.points || 2} điểm</span>
                            </div>

                            <p className="text-gray-800 text-xs font-semibold leading-relaxed">{q.prompt}</p>

                            {/* Trắc nghiệm */}
                            {q.type === 'MULTIPLE_CHOICE' && q.options && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                {q.options.map((opt, oIdx) => {
                                  const optKey = opt.slice(0, 1).toUpperCase()
                                  const isSelected = currentAns.selectedOption === optKey
                                  return (
                                    <label
                                      key={oIdx}
                                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                                        isSelected
                                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                                      }`}
                                    >
                                      <input
                                        type="radio"
                                        name={'question_' + q.id}
                                        value={optKey}
                                        checked={isSelected}
                                        onChange={() =>
                                          setAnswersMap({
                                            ...answersMap,
                                            [q.id]: { ...currentAns, selectedOption: optKey },
                                          })
                                        }
                                        className="sr-only"
                                      />
                                      <span>{opt}</span>
                                    </label>
                                  )
                                })}
                              </div>
                            )}

                            {/* Tự luận */}
                            {q.type === 'ESSAY' && (
                              <div className="pt-1">
                                <textarea
                                  rows={4}
                                  placeholder="Nhập câu trả lời tự luận, giải thuật hoặc mã nguồn của bạn tại đây..."
                                  value={currentAns.essayAnswer || ''}
                                  onChange={(e) =>
                                    setAnswersMap({
                                      ...answersMap,
                                      [q.id]: { ...currentAns, essayAnswer: e.target.value },
                                    })
                                  }
                                  className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                                />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Liên kết bài làm (Github, GitLab, Docs) *</label>
                        <input
                          type="url"
                          placeholder="https://github.com/student/my-project"
                          value={repoUrl}
                          onChange={(e) => setRepoUrl(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Ghi chú hoặc bài làm trực tiếp</label>
                        <textarea
                          rows={6}
                          placeholder="Nhập nội dung bài làm hoặc mô tả tính năng đã hoàn thiện..."
                          value={studentNote}
                          onChange={(e) => setStudentNote(e.target.value)}
                          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] text-gray-500">
                      Hãy rà soát kỹ các câu trả lời trước khi bấm Nộp bài thi.
                    </span>
                    <button
                      type="submit"
                      disabled={submittingExam}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>{submittingExam ? 'Đang nộp bài...' : 'Hoàn Thành & Nộp Bài Thi'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 3: TRUNG TÂM GIÁM SÁT GIAN LẬN THỜI GIAN THỰC
      ========================================================= */}
      {proctoringModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-4xl rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-600 animate-pulse" />
                  <span>Trung Tâm Giám Sát Chống Gian Lận Trực Tiếp (Live Proctoring)</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tự động phát hiện và ghi hình các hành vi chuyển tab, thoát toàn màn hình của học sinh
                </p>
              </div>
              <button
                onClick={() => setProctoringModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {loadingProctoring ? (
                <div className="p-8 text-center text-xs text-gray-500">Đang quét nhật ký vi phạm...</div>
              ) : proctoringLogs.length === 0 ? (
                <div className="p-12 text-center bg-gray-50 rounded-2xl space-y-2">
                  <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="text-xs font-bold text-gray-600">Tuyệt vời! Chưa có bất kỳ vi phạm gian lận nào được ghi nhận.</p>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                      <tr>
                        <th className="p-3">Thời gian</th>
                        <th className="p-3">Học sinh vi phạm</th>
                        <th className="p-3">Bài thi / Kiểm tra</th>
                        <th className="p-3">Loại vi phạm</th>
                        <th className="p-3">Mức độ rủi ro</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {proctoringLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-rose-50/40 transition-colors">
                          <td className="p-3 font-mono text-[11px] text-gray-500">
                            {new Date(log.timestamp).toLocaleTimeString('vi-VN')}
                          </td>
                          <td className="p-3 font-bold text-gray-900">{log.studentName}</td>
                          <td className="p-3 text-gray-700">{log.assignmentTitle}</td>
                          <td className="p-3 text-rose-700 font-semibold">{log.details}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full text-[10px] font-bold">
                              RỦI RO CAO
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>Hệ thống tự động lưu trữ bằng chứng để trừ điểm hoặc đình chỉ thi nếu cần.</span>
              <button
                onClick={() => setProctoringModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 font-bold rounded-xl cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 4: XEM BÀI NỘP & CHẤM ĐIỂM (THỦ CÔNG & AI)
      ========================================================= */}
      {gradeModalOpen && selectedAsm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-4xl rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-indigo-600" />
                  <span>Chấm Điểm Bài Thi: {selectedAsm.title}</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Hỗ trợ trợ lý AI tự động chấm bài tự luận và sinh lời nhận xét sư phạm chi tiết
                </p>
              </div>
              <button onClick={() => setGradeModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingSubs ? (
              <div className="p-12 text-center text-xs text-gray-500">Đang tải danh sách bài nộp...</div>
            ) : submissions.length === 0 ? (
              <div className="p-12 text-center bg-gray-50 rounded-2xl text-xs text-gray-500">
                Chưa có học viên nào nộp bài cho đề thi này.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 overflow-hidden">
                <div className="border border-gray-200 rounded-2xl p-2 space-y-1 overflow-y-auto max-h-[55vh]">
                  {submissions.map((sub) => {
                    const isSelected = selectedSub?.id === sub.id
                    return (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setSelectedSub(sub)
                          setInputScore(sub.score || 10)
                          setInputFeedback(sub.feedback || '')
                        }}
                        className={`w-full p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-xs">
                          <span>{sub.studentName}</span>
                          {sub.score !== null && (
                            <span className={isSelected ? 'text-white' : 'text-emerald-600'}>
                              {sub.score}/{selectedAsm.maxScore || 10}đ
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[10px] mt-1 opacity-80">
                          <span>v{sub.version}</span>
                          {sub.violationCount && sub.violationCount > 0 ? (
                            <span className="text-rose-300 font-bold">Vi phạm: {sub.violationCount} lần</span>
                          ) : (
                            <span>Không vi phạm</span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>

                {selectedSub && (
                  <div className="md:col-span-2 border border-gray-200 rounded-2xl p-4 space-y-4 overflow-y-auto max-h-[55vh] text-xs">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <div>
                        <span className="font-bold text-sm text-gray-900">{selectedSub.studentName}</span>
                        <span className="text-[11px] text-gray-500 block">{selectedSub.studentEmail}</span>
                      </div>

                      <button
                        onClick={handleAiAutoGrade}
                        disabled={aiGradingLoading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        <span>{aiGradingLoading ? 'AI đang chấm bài...' : 'AI Chấm Bài Tự Động'}</span>
                      </button>
                    </div>

                    {selectedSub.violationCount && selectedSub.violationCount > 0 ? (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-bold flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>Học viên có {selectedSub.violationCount} lần rời khỏi màn hình hoặc chuyển tab khi làm bài!</span>
                      </div>
                    ) : null}

                    <div className="space-y-3">
                      <span className="font-bold text-gray-800 block">Nội dung bài làm:</span>
                      {selectedSub.answers && selectedSub.answers.length > 0 ? (
                        <div className="space-y-2">
                          {selectedSub.answers.map((ans, idx) => (
                            <div key={idx} className="p-3 bg-gray-50 rounded-xl space-y-1">
                              <span className="font-bold text-indigo-900 block">Câu {idx + 1}:</span>
                              {ans.selectedOption && (
                                <p className="text-gray-800 font-semibold">
                                  Đáp án trắc nghiệm đã chọn: <span className="text-indigo-600">{ans.selectedOption}</span>
                                </p>
                              )}
                              {ans.essayAnswer && (
                                <p className="text-gray-700 whitespace-pre-line bg-white p-2.5 rounded-lg border border-gray-200">
                                  {ans.essayAnswer}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-xl space-y-1.5">
                          {selectedSub.repoUrl && (
                            <p>
                              <b>Liên kết bài làm:</b>{' '}
                              <a href={selectedSub.repoUrl} target="_blank" rel="noreferrer" className="text-indigo-600 underline">
                                {selectedSub.repoUrl}
                              </a>
                            </p>
                          )}
                          {selectedSub.note && <p className="whitespace-pre-line">{selectedSub.note}</p>}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-gray-100 space-y-3">
                      <div className="grid grid-cols-2 gap-3 items-center">
                        <div>
                          <label className="block font-bold text-gray-700 mb-1">
                            Điểm số (Thang {selectedAsm.maxScore || 10}) *
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            min={0}
                            max={selectedAsm.maxScore || 10}
                            value={inputScore}
                            onChange={(e) => setInputScore(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-black text-sm text-indigo-700"
                          />
                        </div>

                        <div className="pt-4 flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="resubmitCheck"
                            checked={isResubmit}
                            onChange={(e) => setIsResubmit(e.target.checked)}
                            className="w-4 h-4 text-indigo-600 rounded-md cursor-pointer"
                          />
                          <label htmlFor="resubmitCheck" className="text-xs font-bold text-amber-800 cursor-pointer">
                            Yêu cầu học viên làm lại
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Nhận xét & Lời phê của Giảng viên / AI</label>
                        <textarea
                          rows={4}
                          value={inputFeedback}
                          onChange={(e) => setInputFeedback(e.target.value)}
                          placeholder="Nhập nhận xét đánh giá điểm mạnh và góp ý cải thiện..."
                          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
                        />
                      </div>

                      <button
                        onClick={handleGrade}
                        disabled={grading}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>{grading ? 'Đang lưu điểm...' : 'Xác Nhận & Công Bố Điểm'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
