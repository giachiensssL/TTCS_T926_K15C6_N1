import React, { useState, useEffect } from 'react'
import {
  getAcademicDataApi,
  createProgramApi,
  updateProgramApi,
  toggleProgramStatusApi,
  deleteProgramApi,
  getProgramCoursesApi,
  addCourseToProgramApi,
  removeCourseFromProgramApi,
  reorderProgramCoursesApi,
  updateCoursePrerequisiteApi,
  createCourseApi,
  updateCourseApi,
  deleteCourseApi,
  getCourseSessionsApi,
  addCourseSessionApi,
  updateCourseSessionApi,
  deleteCourseSessionApi,
  cloneCourseSessionsApi,
  deleteClassApi,
  getClassesApi,
  createClassFromProgramApi,
  updateClassLifecycleApi,
  enrollStudentsToClassApi,
  removeStudentFromClassApi,
  getInstructorsApi,
  assignCourseInstructorsApi,
  getStudentsApi,
  getStudentByIdApi,
  updateStudentApi,
  getRoomsApi,
  createRoomApi,
  updateRoomApi,
  deleteRoomApi,
  ClassItem,
  ProgramItem,
  CourseItem,
  ProgramCourseItem,
  CourseSessionItem,
  StudentProfileItem,
  RoomItem,
  InstructorListResponse,
  ClassCourseInstructorItem,
} from '../api/academicApi'
import { useAuthStore } from '../store/authStore'
import {
  GraduationCap,
  BookOpen,
  Layers,
  Users,
  MapPin,
  User,
  Calendar,
  Plus,
  Trash2,
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Edit,
  ArrowUp,
  ArrowDown,
  Copy,
  FileText,
  ListOrdered,
  Check,
  ShieldAlert,
  ToggleLeft,
  ToggleRight,
  BookMarked,
  Info,
  Search,
  Filter,
  RotateCcw,
  Video,
  Building,
  CheckSquare,
  Square,
  Laptop,
  ExternalLink,
  Phone,
  Mail,
  Lock,
  UserPlus,
} from 'lucide-react'

export default function ClassesPage() {
  const { user } = useAuthStore()
  const canManage = user?.roles.some((r) => ['TRAINING_MANAGER', 'ADMIN'].includes(r))

  // Main data states
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [programs, setPrograms] = useState<ProgramItem[]>([])
  const [courses, setCourses] = useState<CourseItem[]>([])
  const [students, setStudents] = useState<StudentProfileItem[]>([])
  const [rooms, setRooms] = useState<RoomItem[]>([])
  const [instructors, setInstructors] = useState<InstructorListResponse>({ teachers: [], assistants: [] })
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'CLASSES' | 'STUDENTS' | 'ROOMS' | 'PROGRAMS' | 'COURSES'>('CLASSES')
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null)

  // S3-07: Class Filters
  const [classFilterStatus, setClassFilterStatus] = useState('ALL')
  const [classFilterProgram, setClassFilterProgram] = useState('ALL')
  const [classFilterTeacher, setClassFilterTeacher] = useState('ALL')
  const [classFilterFromDate, setClassFilterFromDate] = useState('')
  const [classFilterToDate, setClassFilterToDate] = useState('')

  // S3-05: Open Class from Program Modal
  const [isOpenClassModalOpen, setIsOpenClassModalOpen] = useState(false)
  const [openClassForm, setOpenClassForm] = useState({
    code: '',
    name: '',
    programId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    maxCapacity: 35,
    mode: 'OFFLINE' as 'OFFLINE' | 'ONLINE' | 'HYBRID',
    roomId: '',
  })
  const [submittingOpenClass, setSubmittingOpenClass] = useState(false)
  const [roomCapacityWarning, setRoomCapacityWarning] = useState<string | null>(null)

  // S3-06: Student Enrollment Modal
  const [enrollModalClass, setEnrollModalClass] = useState<ClassItem | null>(null)
  const [selectedStudentIdsToEnroll, setSelectedStudentIdsToEnroll] = useState<string[]>([])
  const [submittingEnroll, setSubmittingEnroll] = useState(false)

  // S3-08: Assign Course Instructors Modal
  const [assignModalClass, setAssignModalClass] = useState<ClassItem | null>(null)
  const [assignModalCourse, setAssignModalCourse] = useState<ClassCourseInstructorItem | null>(null)
  const [selectedTeacherId, setSelectedTeacherId] = useState('')
  const [selectedAssistantIds, setSelectedAssistantIds] = useState<string[]>([])
  const [submittingAssign, setSubmittingAssign] = useState(false)

  // S3-04: Student Profiles Tab State
  const [studentSearchQuery, setStudentSearchQuery] = useState('')
  const [studentEntryLevelFilter, setStudentEntryLevelFilter] = useState('ALL')
  const [studentDetailModal, setStudentDetailModal] = useState<StudentProfileItem | null>(null)
  const [isEditStudentModalOpen, setIsEditStudentModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<StudentProfileItem | null>(null)
  const [studentEditForm, setStudentEditForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    dob: '',
    address: '',
    entryLevel: 'THPT',
    note: '',
  })
  const [submittingStudentEdit, setSubmittingStudentEdit] = useState(false)

  // S3-09: Room Management Tab State
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<RoomItem | null>(null)
  const [roomForm, setRoomForm] = useState({
    code: '',
    name: '',
    type: 'PHYSICAL' as 'PHYSICAL' | 'ONLINE',
    capacity: 30,
    building: '',
    equipment: '',
    onlineMeetingUrl: '',
    passcode: '',
    status: 'AVAILABLE',
  })
  const [submittingRoom, setSubmittingRoom] = useState(false)

  // S2-04: Program Modal State
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false)
  const [editingProgram, setEditingProgram] = useState<ProgramItem | null>(null)
  const [progForm, setProgForm] = useState({
    code: '',
    name: '',
    description: '',
    durationMonths: 12,
    totalHours: 450,
    standardTuition: 15000000,
    status: 'ACTIVE',
  })

  // S2-05: Course Modal State
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<CourseItem | null>(null)
  const [courseForm, setCourseForm] = useState({
    code: '',
    name: '',
    credits: 3,
    sessionCount: 12,
    learningOutcomes: '',
    tuitionPerCredit: 500000,
  })

  // S2-06: Program Curriculum Modal State
  const [curriculumProgram, setCurriculumProgram] = useState<ProgramItem | null>(null)
  const [curriculumCourses, setCurriculumCourses] = useState<ProgramCourseItem[]>([])
  const [curriculumLoading, setCurriculumLoading] = useState(false)
  const [selectedCourseToAdd, setSelectedCourseToAdd] = useState('')
  const [selectedPrereqToAdd, setSelectedPrereqToAdd] = useState('')

  // S2-07: Course Syllabus Sessions Modal State
  const [syllabusCourse, setSyllabusCourse] = useState<CourseItem | null>(null)
  const [courseSessions, setCourseSessions] = useState<CourseSessionItem[]>([])
  const [syllabusLoading, setSyllabusLoading] = useState(false)
  const [newSessionTopic, setNewSessionTopic] = useState('')
  const [newSessionObjective, setNewSessionObjective] = useState('')
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [editSessionTopic, setEditSessionTopic] = useState('')
  const [editSessionObjective, setEditSessionObjective] = useState('')
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false)
  const [cloneSourceCourseId, setCloneSourceCourseId] = useState('')

  const notify = (type: 'success' | 'error' | 'warning', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  const loadAllData = async () => {
    setLoading(true)
    try {
      const [academicRes, classesRes, studentsRes, roomsRes, instructorsRes] = await Promise.all([
        getAcademicDataApi(),
        getClassesApi({
          status: classFilterStatus !== 'ALL' ? classFilterStatus : undefined,
          programId: classFilterProgram !== 'ALL' ? classFilterProgram : undefined,
          teacherId: classFilterTeacher !== 'ALL' ? classFilterTeacher : undefined,
          fromDate: classFilterFromDate || undefined,
          toDate: classFilterToDate || undefined,
        }),
        getStudentsApi({
          search: studentSearchQuery || undefined,
          entryLevel: studentEntryLevelFilter !== 'ALL' ? studentEntryLevelFilter : undefined,
        }),
        getRoomsApi(),
        getInstructorsApi().catch(() => ({ data: { teachers: [], assistants: [] } })),
      ])

      setPrograms(academicRes.programs || [])
      setCourses(academicRes.courses || [])
      setClasses(classesRes.data || [])
      setStudents(studentsRes.data || [])
      setRooms(roomsRes.data || [])
      setInstructors(instructorsRes.data || { teachers: [], assistants: [] })

      if (academicRes.programs.length > 0 && !openClassForm.programId) {
        setOpenClassForm((prev) => ({ ...prev, programId: academicRes.programs[0].id }))
      }
    } catch (err: any) {
      console.error(err)
      notify('error', err.response?.data?.message || 'Lỗi khi tải dữ liệu đào tạo.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAllData()
  }, [
    classFilterStatus,
    classFilterProgram,
    classFilterTeacher,
    classFilterFromDate,
    classFilterToDate,
    studentSearchQuery,
    studentEntryLevelFilter,
  ])

  // Realtime check sức chứa phòng khi mở lớp (S3-09)
  useEffect(() => {
    if (openClassForm.roomId) {
      const targetRoom = rooms.find((r) => r.id === openClassForm.roomId)
      if (targetRoom && targetRoom.capacity < Number(openClassForm.maxCapacity)) {
        setRoomCapacityWarning(
          `Cảnh báo S3-09: Sĩ số lớp (${openClassForm.maxCapacity} học viên) vượt quá sức chứa phòng "${targetRoom.name}" (${targetRoom.capacity} chỗ)!`
        )
      } else {
        setRoomCapacityWarning(null)
      }
    } else {
      setRoomCapacityWarning(null)
    }
  }, [openClassForm.roomId, openClassForm.maxCapacity, rooms])

  // ==========================================
  // S3-05: MỞ LỚP TỪ CHƯƠNG TRÌNH & VÒNG ĐỜI
  // ==========================================
  const handleOpenClassFromProgram = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!openClassForm.code || !openClassForm.name || !openClassForm.programId) {
      notify('error', 'Vui lòng điền mã lớp, tên lớp và chọn chương trình đào tạo.')
      return
    }

    setSubmittingOpenClass(true)
    try {
      const res = await createClassFromProgramApi({
        code: openClassForm.code.trim().toUpperCase(),
        name: openClassForm.name.trim(),
        programId: openClassForm.programId,
        startDate: openClassForm.startDate,
        endDate: openClassForm.endDate,
        maxCapacity: Number(openClassForm.maxCapacity) || 35,
        mode: openClassForm.mode,
        roomId: openClassForm.roomId || undefined,
      })

      notify('success', res.message || 'Mở lớp học thành công!')
      if (res.capacityWarning) {
        notify('warning', res.capacityWarning)
      }
      setIsOpenClassModalOpen(false)
      setOpenClassForm({
        code: '',
        name: '',
        programId: programs[0]?.id || '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        maxCapacity: 35,
        mode: 'OFFLINE',
        roomId: '',
      })
      await loadAllData()
    } catch (err: any) {
      notify('error', err.response?.data?.message || 'Lỗi khi mở lớp học.')
    } finally {
      setSubmittingOpenClass(false)
    }
  }

  const handleUpdateLifecycle = async (classId: string, newStatus: string) => {
    try {
      const res = await updateClassLifecycleApi(classId, newStatus)
      notify('success', res.message || `Đã chuyển vòng đời lớp sang "${newStatus}"!`)
      await loadAllData()
    } catch (err: any) {
      notify('error', err.response?.data?.message || 'Lỗi khi cập nhật vòng đời lớp.')
    }
  }

  const handleDeleteClass = async (id: string, name: string) => {
    if (!canManage) {
      notify('error', 'Chỉ Quản lý đào tạo hoặc Quản trị viên mới được xoá lớp học.')
      return
    }
    if (!window.confirm(`Bạn có chắc chắn muốn xóa lớp học "${name}"?`)) return
    try {
      await deleteClassApi(id)
      notify('success', 'Đã xóa lớp học thành công.')
      await loadAllData()
    } catch (err: any) {
      notify('error', err.response?.data?.message || 'Lỗi khi xóa lớp học.')
    }
  }

  // ==========================================
  // S3-06: GHI DANH HỌC VIÊN VÀO LỚP
  // ==========================================
  const handleOpenEnrollModal = (cls: ClassItem) => {
    setEnrollModalClass(cls)
    setSelectedStudentIdsToEnroll([])
  }

  const toggleSelectStudentForEnroll = (studentId: string) => {
    setSelectedStudentIdsToEnroll((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    )
  }

  const handleSubmitEnroll = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!enrollModalClass) return
    if (selectedStudentIdsToEnroll.length === 0) {
      notify('error', 'Vui lòng chọn ít nhất một học viên để ghi danh.')
      return
    }

    setSubmittingEnroll(true)
    try {
      const res = await enrollStudentsToClassApi(enrollModalClass.id, selectedStudentIdsToEnroll)
      notify('success', res.message || `Đã ghi danh ${res.enrolledCount} học viên vào lớp!`)
      setEnrollModalClass(null)
      setSelectedStudentIdsToEnroll([])
      await loadAllData()
    } catch (err: any) {
      notify('error', err.response?.data?.message || 'Lỗi khi ghi danh học viên.')
    } finally {
      setSubmittingEnroll(false)
    }
  }

  const handleRemoveStudentFromClass = async (classId: string, studentId: string, studentName: string) => {
    if (!window.confirm(`Xác nhận rút học viên "${studentName}" ra khỏi lớp này?`)) return
    try {
      const res = await removeStudentFromClassApi(classId, studentId)
      notify('success', res.message || 'Đã rút học viên khỏi lớp thành công.')
      await loadAllData()
    } catch (err: any) {
      notify('error', err.response?.data?.message || 'Lỗi khi rút học viên khỏi lớp.')
    }
  }

  // ==========================================
  // S3-08: PHÂN CÔNG GIẢNG VIÊN & TRỢ GIẢNG
  // ==========================================
  const handleOpenAssignModal = (cls: ClassItem, course: ClassCourseInstructorItem) => {
    setAssignModalClass(cls)
    setAssignModalCourse(course)
    setSelectedTeacherId(course.teacherId || '')
    setSelectedAssistantIds(course.assistantIds || [])
  }

  const toggleSelectAssistant = (assistantId: string) => {
    setSelectedAssistantIds((prev) =>
      prev.includes(assistantId) ? prev.filter((id) => id !== assistantId) : [...prev, assistantId]
    )
  }

  const handleSubmitAssign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assignModalClass || !assignModalCourse) return

    setSubmittingAssign(true)
    try {
      const res = await assignCourseInstructorsApi(assignModalClass.id, assignModalCourse.courseId, {
        teacherId: selectedTeacherId || null,
        assistantIds: selectedAssistantIds,
      })
      notify('success', res.message || 'Phân công giảng viên và trợ giảng thành công!')
      setAssignModalClass(null)
      setAssignModalCourse(null)
      await loadAllData()
    } catch (err: any) {
      notify('error', err.response?.data?.message || 'Lỗi khi phân công giảng viên.')
    } finally {
      setSubmittingAssign(false)
    }
  }

  // ==========================================
  // S3-04: HỒ SƠ HỌC VIÊN
  // ==========================================
  const handleViewStudentDetail = async (studentId: string) => {
    try {
      const res = await getStudentByIdApi(studentId)
      setStudentDetailModal(res.data)
    } catch (err: any) {
      notify('error', err.response?.data?.message || 'Lỗi tải chi tiết hồ sơ học viên.')
    }
  }

  const handleOpenEditStudent = (stu: StudentProfileItem) => {
    setEditingStudent(stu)
    setStudentEditForm({
      fullName: stu.fullName,
      phone: stu.phone,
      email: stu.email,
      dob: stu.dob || '',
      address: stu.address || '',
      entryLevel: stu.entryLevel || 'THPT',
      note: stu.note || '',
    })
    setIsEditStudentModalOpen(true)
  }

  const handleSaveStudentEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingStudent) return

    setSubmittingStudentEdit(true)
    try {
      const res = await updateStudentApi(editingStudent.id, studentEditForm)
      notify('success', res.message || 'Cập nhật hồ sơ học viên thành công!')
      setIsEditStudentModalOpen(false)
      if (studentDetailModal && studentDetailModal.id === editingStudent.id) {
        setStudentDetailModal(res.data)
      }
      await loadAllData()
    } catch (err: any) {
      notify('error', err.response?.data?.message || 'Lỗi cập nhật học viên.')
    } finally {
      setSubmittingStudentEdit(false)
    }
  }

  // ==========================================
  // S3-09: PHÒNG HỌC & TRỰC TUYẾN
  // ==========================================
  const handleOpenCreateRoom = () => {
    setEditingRoom(null)
    setRoomForm({
      code: '',
      name: '',
      type: 'PHYSICAL',
      capacity: 30,
      building: 'Toà Nhà A',
      equipment: 'Máy chiếu, Hệ thống âm thanh, Wifi',
      onlineMeetingUrl: '',
      passcode: '',
      status: 'AVAILABLE',
    })
    setIsRoomModalOpen(true)
  }

  const handleOpenEditRoom = (room: RoomItem) => {
    setEditingRoom(room)
    setRoomForm({
      code: room.code,
      name: room.name,
      type: room.type,
      capacity: room.capacity,
      building: room.building || '',
      equipment: room.equipment || '',
      onlineMeetingUrl: room.onlineMeetingUrl || '',
      passcode: room.passcode || '',
      status: room.status,
    })
    setIsRoomModalOpen(true)
  }

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!roomForm.code || !roomForm.name) {
      notify('error', 'Vui lòng nhập mã phòng và tên phòng học.')
      return
    }

    setSubmittingRoom(true)
    try {
      if (editingRoom) {
        const res = await updateRoomApi(editingRoom.id, roomForm)
        notify('success', res.message || 'Cập nhật phòng học thành công!')
      } else {
        const res = await createRoomApi(roomForm)
        notify('success', res.message || 'Tạo phòng học mới thành công!')
      }
      setIsRoomModalOpen(false)
      await loadAllData()
    } catch (err: any) {
      notify('error', err.response?.data?.message || 'Lỗi khi lưu phòng học.')
    } finally {
      setSubmittingRoom(false)
    }
  }

  const handleDeleteRoom = async (room: RoomItem) => {
    if (!window.confirm(`Xác nhận xoá phòng "${room.name}" (${room.code})?`)) return
    try {
      const res = await deleteRoomApi(room.id)
      notify('success', res.message || 'Đã xoá phòng học.')
      await loadAllData()
    } catch (err: any) {
      notify('error', err.response?.data?.message || 'Lỗi khi xoá phòng học.')
    }
  }

  // ==========================================
  // S2-04 & S2-05 & S2-06 & S2-07 LOGIC PRESERVED
  // ==========================================
  const handleOpenCreateProgram = () => {
    setEditingProgram(null)
    setProgForm({
      code: '',
      name: '',
      description: '',
      durationMonths: 12,
      totalHours: 450,
      standardTuition: 15000000,
      status: 'ACTIVE',
    })
    setIsProgramModalOpen(true)
  }

  const handleOpenEditProgram = (prog: ProgramItem) => {
    setEditingProgram(prog)
    setProgForm({
      code: prog.code,
      name: prog.name,
      description: prog.description || '',
      durationMonths: prog.durationMonths || 12,
      totalHours: prog.totalHours || 450,
      standardTuition: prog.standardTuition || 15000000,
      status: prog.status || 'ACTIVE',
    })
    setIsProgramModalOpen(true)
  }

  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingProgram) {
        await updateProgramApi(editingProgram.id, progForm)
        notify('success', 'Cập nhật chương trình thành công!')
      } else {
        await createProgramApi(progForm)
        notify('success', 'Tạo chương trình mới thành công!')
      }
      setIsProgramModalOpen(false)
      await loadAllData()
    } catch (err: any) {
      notify('error', err.response?.data?.message || 'Lỗi khi lưu chương trình.')
    }
  }

  const handleToggleProgramStatus = async (prog: ProgramItem) => {
    const newStatus = prog.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    try {
      await toggleProgramStatusApi(prog.id, newStatus)
      notify('success', 'Đã cập nhật trạng thái chương trình.')
      await loadAllData()
    } catch (err: any) {
      notify('error', err.response?.data?.message || 'Lỗi khi thay đổi trạng thái.')
    }
  }

  const handleDeleteProgram = async (prog: ProgramItem) => {
    if (prog.classCount && prog.classCount > 0) {
      alert(`Không thể xoá chương trình "${prog.name}" vì đang có lớp học sử dụng. Theo S2-04, chỉ được ngừng áp dụng.`)
      return
    }
    if (!window.confirm(`Xoá chương trình "${prog.name}"?`)) return
    try {
      await deleteProgramApi(prog.id)
      notify('success', 'Đã xoá chương trình.')
      await loadAllData()
    } catch (err: any) {
      notify('error', err.response?.data?.message || 'Lỗi khi xoá chương trình.')
    }
  }

  const handleOpenCurriculum = async (prog: ProgramItem) => {
    setCurriculumProgram(prog)
    setCurriculumLoading(true)
    try {
      const res = await getProgramCoursesApi(prog.id)
      setCurriculumCourses(res.data || [])
    } catch (err: any) {
      notify('error', err.response?.data?.message || 'Lỗi tải lộ trình môn học.')
    } finally {
      setCurriculumLoading(false)
    }
  }

  const handleAddCourseToProgram = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!curriculumProgram || !selectedCourseToAdd) return
    try {
      const res = await addCourseToProgramApi(curriculumProgram.id, {
        courseId: selectedCourseToAdd,
        prerequisiteCourseId: selectedPrereqToAdd || null,
      })
      notify('success', 'Đã gắn môn học vào chương trình thành công!')
      setCurriculumCourses(res.data || [])
      setSelectedCourseToAdd('')
      setSelectedPrereqToAdd('')
      await loadAllData()
    } catch (err: any) {
      notify('error', err.response?.data?.message || 'Lỗi khi gắn môn học.')
    }
  }

  const handleRemoveCourseFromProgram = async (courseId: string) => {
    if (!curriculumProgram) return
    try {
      const res = await removeCourseFromProgramApi(curriculumProgram.id, courseId)
      notify('success', 'Đã gỡ môn học khỏi chương trình.')
      setCurriculumCourses(res.data || [])
      await loadAllData()
    } catch (err: any) {
      notify('error', err.response?.data?.message || 'Lỗi khi gỡ môn học.')
    }
  }

  const handleMoveCourseOrder = async (index: number, direction: 'UP' | 'DOWN') => {
    if (!curriculumProgram) return
    const newCourses = [...curriculumCourses]
    const targetIdx = direction === 'UP' ? index - 1 : index + 1
    if (targetIdx < 0 || targetIdx >= newCourses.length) return
    const temp = newCourses[index]
    newCourses[index] = newCourses[targetIdx]
    newCourses[targetIdx] = temp

    try {
      const res = await reorderProgramCoursesApi(
        curriculumProgram.id,
        newCourses.map((c) => c.courseId)
      )
      notify('success', 'Đã lưu thứ tự môn học mới!')
      setCurriculumCourses(res.data || [])
      await loadAllData()
    } catch (err: any) {
      notify('error', err.response?.data?.message || 'Lỗi đổi thứ tự môn học.')
    }
  }

  const handleOpenCreateCourse = () => {
    setEditingCourse(null)
    setCourseForm({
      code: '',
      name: '',
      credits: 3,
      sessionCount: 15,
      learningOutcomes: '',
      tuitionPerCredit: 500000,
    })
    setIsCourseModalOpen(true)
  }

  const handleOpenEditCourse = (crs: CourseItem) => {
    setEditingCourse(crs)
    setCourseForm({
      code: crs.code,
      name: crs.name,
      credits: crs.credits,
      sessionCount: crs.sessionCount || 15,
      learningOutcomes: crs.learningOutcomes || '',
      tuitionPerCredit: crs.tuitionPerCredit || 500000,
    })
    setIsCourseModalOpen(true)
  }

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingCourse) {
        await updateCourseApi(editingCourse.id, courseForm)
        notify('success', 'Cập nhật môn học thành công!')
      } else {
        await createCourseApi(courseForm)
        notify('success', 'Tạo môn học mới thành công!')
      }
      setIsCourseModalOpen(false)
      await loadAllData()
    } catch (err: any) {
      notify('error', err.response?.data?.message || 'Lỗi khi lưu môn học.')
    }
  }

  const handleDeleteCourse = async (crs: CourseItem) => {
    if (crs.classCount && crs.classCount > 0) {
      alert(`Môn học "${crs.name}" đã có lớp học sử dụng. Theo S2-05, không thể xoá môn học đã có lớp.`)
      return
    }
    if (!window.confirm(`Xoá môn học "${crs.name}"?`)) return
    try {
      await deleteCourseApi(crs.id)
      notify('success', 'Đã xoá môn học.')
      await loadAllData()
    } catch (err: any) {
      notify('error', err.response?.data?.message || 'Lỗi khi xoá môn học.')
    }
  }

  const handleOpenSyllabus = async (crs: CourseItem) => {
    setSyllabusCourse(crs)
    setSyllabusLoading(true)
    setNewSessionTopic('')
    setNewSessionObjective('')
    setEditingSessionId(null)
    try {
      const res = await getCourseSessionsApi(crs.id)
      setCourseSessions(res.data || [])
    } catch (err: any) {
      notify('error', err.response?.data?.message || 'Lỗi tải đề cương buổi học.')
    } finally {
      setSyllabusLoading(false)
    }
  }

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!syllabusCourse) return
    try {
      const res = await addCourseSessionApi(syllabusCourse.id, {
        topic: newSessionTopic.trim(),
        objective: newSessionObjective.trim(),
      })
      notify('success', 'Đã thêm buổi học mới thành công!')
      setCourseSessions((prev) => [...prev, res.data])
      setNewSessionTopic('')
      setNewSessionObjective('')
      await loadAllData()
    } catch (err: any) {
      notify('error', err.response?.data?.message || 'Lỗi khi thêm buổi học.')
    }
  }

  const handleDeleteSession = async (sessionId: string) => {
    if (!syllabusCourse) return
    try {
      await deleteCourseSessionApi(syllabusCourse.id, sessionId)
      notify('success', 'Đã xoá buổi học.')
      setCourseSessions((prev) => prev.filter((s) => s.id !== sessionId))
      await loadAllData()
    } catch (err: any) {
      notify('error', err.response?.data?.message || 'Lỗi khi xoá buổi học.')
    }
  }

  const handleCloneSessions = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!syllabusCourse || !cloneSourceCourseId) return
    try {
      const res = await cloneCourseSessionsApi(syllabusCourse.id, cloneSourceCourseId)
      notify('success', res.message || 'Đã nhân bản đề cương buổi học thành công!')
      setIsCloneModalOpen(false)
      const updatedRes = await getCourseSessionsApi(syllabusCourse.id)
      setCourseSessions(updatedRes.data || [])
      await loadAllData()
    } catch (err: any) {
      notify('error', err.response?.data?.message || 'Lỗi khi nhân bản buổi học.')
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Banner Tiêu Chuẩn Sprint 3 */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold mb-3 border border-white/20 text-indigo-200">
            <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
            <span>QUẢN LÝ ĐÀO TẠO & VẬN HÀNH LỚP HỌC (Sprint 3: S3-04 → S3-09)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Quản Lý Lớp Học, Hồ Sơ Học Viên & Phòng Học
          </h1>
          <p className="mt-2 text-indigo-100 text-xs sm:text-sm leading-relaxed">
            Mở lớp học từ chương trình đào tạo, theo dõi vòng đời lớp, ghi danh học viên đơn lẻ/hàng loạt, phân công giảng viên - trợ giảng theo môn học, tra cứu hồ sơ học viên và quản lý sức chứa phòng học.
          </p>

          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            {canManage && (
              <>
                <button
                  onClick={() => setIsOpenClassModalOpen(true)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Mở Lớp Học Từ Chương Trình (S3-05)</span>
                </button>
                <button
                  onClick={handleOpenCreateRoom}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Building className="w-4 h-4" />
                  <span>Khai Báo Phòng Học (S3-09)</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Thông Báo Toast */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3 shadow-md animate-in slide-in-from-top-2 ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : notification.type === 'warning'
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
            {notification.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
            {notification.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs Chuyển Đổi Danh Mục */}
      <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('CLASSES')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'CLASSES' ? 'bg-white text-indigo-900 shadow-2xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Lớp Học ({classes.length})
          </button>
          <button
            onClick={() => setActiveTab('STUDENTS')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'STUDENTS' ? 'bg-white text-indigo-900 shadow-2xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Hồ Sơ Học Viên ({students.length})
          </button>
          <button
            onClick={() => setActiveTab('ROOMS')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'ROOMS' ? 'bg-white text-indigo-900 shadow-2xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Phòng Học ({rooms.length})
          </button>
          <button
            onClick={() => setActiveTab('PROGRAMS')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'PROGRAMS' ? 'bg-white text-indigo-900 shadow-2xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Chương Trình ({programs.length})
          </button>
          <button
            onClick={() => setActiveTab('COURSES')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'COURSES' ? 'bg-white text-indigo-900 shadow-2xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Môn Học ({courses.length})
          </button>
        </div>

        {/* Nút hành động tuỳ tab */}
        {canManage && (
          <div className="flex items-center gap-2">
            {activeTab === 'CLASSES' && (
              <button
                onClick={() => setIsOpenClassModalOpen(true)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Mở Lớp Mới</span>
              </button>
            )}
            {activeTab === 'ROOMS' && (
              <button
                onClick={handleOpenCreateRoom}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Phòng</span>
              </button>
            )}
            {activeTab === 'PROGRAMS' && (
              <button
                onClick={handleOpenCreateProgram}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Chương Trình</span>
              </button>
            )}
            {activeTab === 'COURSES' && (
              <button
                onClick={handleOpenCreateCourse}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Môn Học</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* ========================================================
          TAB 1: DANH SÁCH LỚP HỌC (S3-05, S3-06, S3-07, S3-08)
      ======================================================== */}
      {activeTab === 'CLASSES' && (
        <div className="space-y-4">
          {/* S3-07: Bộ lọc lớp học */}
          <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">Vòng đời / Trạng thái</label>
              <select
                value={classFilterStatus}
                onChange={(e) => setClassFilterStatus(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-gray-50 rounded-xl border border-gray-200 focus:outline-hidden font-medium"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="PLANNING">Chuẩn bị (PLANNING)</option>
                <option value="ACTIVE">Đang học (ACTIVE)</option>
                <option value="FINISHED">Kết thúc (FINISHED)</option>
                <option value="CANCELLED">Huỷ (CANCELLED)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">Chương trình đào tạo</label>
              <select
                value={classFilterProgram}
                onChange={(e) => setClassFilterProgram(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-gray-50 rounded-xl border border-gray-200 focus:outline-hidden font-medium"
              >
                <option value="ALL">Tất cả chương trình</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">Giảng viên chính</label>
              <select
                value={classFilterTeacher}
                onChange={(e) => setClassFilterTeacher(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-gray-50 rounded-xl border border-gray-200 focus:outline-hidden font-medium"
              >
                <option value="ALL">Tất cả giảng viên</option>
                {instructors.teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">Khai giảng từ ngày</label>
              <input
                type="date"
                value={classFilterFromDate}
                onChange={(e) => setClassFilterFromDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-gray-50 rounded-xl border border-gray-200 focus:outline-hidden"
              />
            </div>

            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">Đến ngày</label>
                <input
                  type="date"
                  value={classFilterToDate}
                  onChange={(e) => setClassFilterToDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-gray-50 rounded-xl border border-gray-200 focus:outline-hidden"
                />
              </div>
              <button
                onClick={() => {
                  setClassFilterStatus('ALL')
                  setClassFilterProgram('ALL')
                  setClassFilterTeacher('ALL')
                  setClassFilterFromDate('')
                  setClassFilterToDate('')
                }}
                className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl cursor-pointer"
                title="Đặt lại bộ lọc"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Danh sách lớp kèm chỉ số nhanh S3-07 */}
          {classes.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl text-center text-gray-400 text-xs italic border border-dashed border-gray-200">
              Không tìm thấy lớp học nào phù hợp với bộ lọc.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {classes.map((cls) => {
                const capacityPercent = Math.min(100, Math.round(((cls.currentCount || 0) / (cls.maxCapacity || 40)) * 100))
                return (
                  <div
                    key={cls.id}
                    className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs hover:shadow-md transition-all space-y-3.5 relative group"
                  >
                    {/* Header lớp & Vòng đời */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-900 font-mono font-bold text-xs rounded-lg">
                            {cls.code}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              cls.mode === 'ONLINE'
                                ? 'bg-cyan-50 text-cyan-800'
                                : cls.mode === 'HYBRID'
                                ? 'bg-purple-50 text-purple-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {cls.mode === 'ONLINE' ? 'Trực tuyến' : cls.mode === 'HYBRID' ? 'Kết hợp (Hybrid)' : 'Trực tiếp'}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-gray-900 mt-1 leading-snug">{cls.name}</h3>
                        <p className="text-xs text-indigo-700 font-medium truncate">{cls.programName}</p>
                      </div>

                      {/* Vòng đời badge & Switcher */}
                      <div className="text-right shrink-0">
                        <select
                          value={cls.status}
                          disabled={!canManage}
                          onChange={(e) => handleUpdateLifecycle(cls.id, e.target.value)}
                          className={`text-[10px] font-bold px-2 py-1 rounded-lg border focus:outline-hidden cursor-pointer ${
                            cls.status === 'PLANNING'
                              ? 'bg-amber-50 text-amber-900 border-amber-300'
                              : cls.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                              : cls.status === 'FINISHED'
                              ? 'bg-blue-50 text-blue-900 border-blue-300'
                              : 'bg-gray-100 text-gray-700 border-gray-300'
                          }`}
                        >
                          <option value="PLANNING">Chuẩn bị</option>
                          <option value="ACTIVE">Đang học</option>
                          <option value="FINISHED">Kết thúc</option>
                          <option value="CANCELLED">Huỷ</option>
                        </select>
                      </div>
                    </div>

                    {/* Cảnh báo sức chứa phòng S3-09 nếu có */}
                    {cls.capacityWarning && (
                      <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-[11px] font-semibold text-amber-900 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">{cls.capacityWarning}</span>
                      </div>
                    )}

                    {/* S3-07: CHỈ SỐ NHANH */}
                    <div className="p-3 bg-gray-50 rounded-2xl space-y-2.5 text-xs">
                      {/* Sĩ số hiện tại / tối đa */}
                      <div>
                        <div className="flex items-center justify-between text-gray-700 mb-1">
                          <span className="flex items-center gap-1 text-[11px] text-gray-500">
                            <Users className="w-3.5 h-3.5" /> Sĩ số học viên:
                          </span>
                          <span className="font-bold text-gray-900">
                            {cls.currentCount || 0} / {cls.maxCapacity || 40} ({capacityPercent}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              capacityPercent >= 100
                                ? 'bg-rose-500'
                                : capacityPercent >= 80
                                ? 'bg-amber-500'
                                : 'bg-indigo-600'
                            }`}
                            style={{ width: `${capacityPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Tiến độ buổi học */}
                      <div>
                        <div className="flex items-center justify-between text-gray-700 mb-1">
                          <span className="flex items-center gap-1 text-[11px] text-gray-500">
                            <Clock className="w-3.5 h-3.5" /> Tiến độ giảng dạy:
                          </span>
                          <span className="font-bold text-emerald-800">
                            {cls.completedSessions || 0} / {cls.totalSessions || 45} buổi ({cls.sessionProgressPercent || 0}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all"
                            style={{ width: `${cls.sessionProgressPercent || 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Phòng học & Khai giảng */}
                      <div className="flex items-center justify-between pt-1 border-t border-gray-200/60 text-[11px] text-gray-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span>{cls.roomName || cls.room || 'Chưa phân phòng'}</span>
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span>{cls.startDate}</span>
                        </span>
                      </div>
                    </div>

                    {/* S3-08: Danh sách môn học trong lớp & Giảng viên phụ trách */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                        <span>Môn học trong lớp ({cls.courses?.length || 0}):</span>
                      </div>

                      <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                        {cls.courses && cls.courses.length > 0 ? (
                          cls.courses.map((crs) => (
                            <div
                              key={crs.courseId}
                              className="p-2 bg-slate-50 border border-gray-200/80 rounded-xl text-xs space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-gray-900 truncate">{crs.courseName}</span>
                                {canManage && (
                                  <button
                                    onClick={() => handleOpenAssignModal(cls, crs)}
                                    className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer"
                                  >
                                    Phân công →
                                  </button>
                                )}
                              </div>
                              <div className="text-[11px] text-gray-600 flex items-center justify-between">
                                <span>GV: <strong className="text-gray-900">{crs.teacherName || 'Chưa phân'}</strong></span>
                                {crs.assistantNames && crs.assistantNames.length > 0 && (
                                  <span className="text-[10px] text-purple-700">TG: {crs.assistantNames.join(', ')}</span>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-2 text-center text-gray-400 text-xs italic bg-gray-50 rounded-xl">
                            Chưa có môn học trong lớp.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Hành động dưới cùng */}
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleOpenEnrollModal(cls)}
                        className="flex-1 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Ghi Danh ({cls.currentCount || 0})</span>
                      </button>

                      {canManage && (
                        <button
                          onClick={() => handleDeleteClass(cls.id, cls.name)}
                          className="p-2 text-gray-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Xoá lớp học"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 2: QUẢN LÝ HỒ SƠ HỌC VIÊN (S3-04)
      ======================================================== */}
      {activeTab === 'STUDENTS' && (
        <div className="space-y-4">
          {/* Bộ lọc học viên */}
          <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo Mã học viên, Họ tên, Số điện thoại..."
                value={studentSearchQuery}
                onChange={(e) => setStudentSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-gray-500 font-semibold whitespace-nowrap">Trình độ đầu vào:</label>
              <select
                value={studentEntryLevelFilter}
                onChange={(e) => setStudentEntryLevelFilter(e.target.value)}
                className="px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 font-medium focus:outline-hidden"
              >
                <option value="ALL">Tất cả</option>
                <option value="THPT">Tốt nghiệp THPT</option>
                <option value="Cao đẳng">Cao đẳng</option>
                <option value="Đại học">Đại học</option>
                <option value="Người đi làm chuyển ngành">Người đi làm chuyển ngành</option>
              </select>
            </div>
          </div>

          {/* Bảng danh sách học viên S3-04 */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-4">Mã HV</th>
                    <th className="p-4">Họ và tên</th>
                    <th className="p-4">Liên hệ</th>
                    <th className="p-4">Trình độ đầu vào</th>
                    <th className="p-4">Lớp đang học</th>
                    <th className="p-4">Ghi chú</th>
                    <th className="p-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-400 italic">
                        Chưa có hồ sơ học viên nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    students.map((stu) => (
                      <tr key={stu.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="p-4 font-mono font-bold text-indigo-700">{stu.studentCode}</td>
                        <td className="p-4 font-bold text-gray-900">{stu.fullName}</td>
                        <td className="p-4 text-gray-600 font-mono">
                          <div>{stu.phone}</div>
                          <div className="text-gray-400 font-sans text-[11px]">{stu.email}</div>
                        </td>
                        <td className="p-4 font-semibold text-gray-700">{stu.entryLevel || 'THPT'}</td>
                        <td className="p-4">
                          {stu.enrolledClasses && stu.enrolledClasses.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {stu.enrolledClasses.map((c) => (
                                <span
                                  key={c.classId}
                                  className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-800 font-bold rounded-md text-[10px]"
                                >
                                  {c.classCode}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">Chưa xếp lớp</span>
                          )}
                        </td>
                        <td className="p-4 text-gray-500 max-w-[180px] truncate">{stu.note || '-'}</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleViewStudentDetail(stu.id)}
                              className="px-2.5 py-1 bg-gray-100 hover:bg-indigo-50 hover:text-indigo-700 font-bold rounded-lg text-[11px] cursor-pointer"
                            >
                              Chi tiết
                            </button>
                            {canManage && (
                              <button
                                onClick={() => handleOpenEditStudent(stu)}
                                className="p-1.5 text-gray-400 hover:text-amber-600 rounded-lg hover:bg-gray-100 cursor-pointer"
                                title="Sửa hồ sơ"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: QUẢN LÝ PHÒNG HỌC & TRỰC TUYẾN (S3-09)
      ======================================================== */}
      {activeTab === 'ROOMS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs hover:shadow-md transition-all space-y-3 relative group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-900 font-mono font-bold text-xs rounded-lg">
                      {room.code}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        room.type === 'ONLINE' ? 'bg-cyan-50 text-cyan-800' : 'bg-emerald-50 text-emerald-800'
                      }`}
                    >
                      {room.type === 'ONLINE' ? 'Trực tuyến' : 'Vật lý'}
                    </span>
                  </div>

                  {canManage && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditRoom(room)}
                        className="p-1 text-gray-400 hover:text-amber-600 rounded-lg hover:bg-gray-100 cursor-pointer"
                        title="Sửa phòng"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room)}
                        className="p-1 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-gray-100 cursor-pointer"
                        title="Xoá phòng"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-sm text-gray-900">{room.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{room.building || 'Toà Nhà A'}</p>
                </div>

                <div className="p-3 bg-gray-50 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Sức chứa tối đa:</span>
                    <span className="font-bold text-indigo-700">{room.capacity} chỗ</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Lớp đang sử dụng:</span>
                    <span className="font-bold text-gray-900">{room.activeClassCount || 0} lớp</span>
                  </div>
                  {room.type === 'ONLINE' && room.onlineMeetingUrl && (
                    <div className="pt-1 border-t border-gray-200">
                      <a
                        href={room.onlineMeetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-cyan-700 hover:underline flex items-center gap-1 font-mono truncate"
                      >
                        <Video className="w-3 h-3 shrink-0" />
                        <span className="truncate">{room.onlineMeetingUrl}</span>
                      </a>
                    </div>
                  )}
                  {room.equipment && (
                    <div className="text-[11px] text-gray-500 italic">Thiết bị: {room.equipment}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: CHƯƠNG TRÌNH ĐÀO TẠO (S2-04 & S2-06)
      ======================================================== */}
      {activeTab === 'PROGRAMS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {programs.map((prog) => (
              <div
                key={prog.id}
                className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs hover:shadow-md transition-all space-y-3 relative group"
              >
                <div className="flex items-start justify-between">
                  <span className="px-2 py-0.5 bg-purple-50 border border-purple-200 text-purple-900 font-mono font-bold text-xs rounded-lg">
                    {prog.code}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      prog.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-800' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {prog.status === 'ACTIVE' ? 'Đang áp dụng' : 'Ngừng áp dụng'}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-gray-900">{prog.name}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{prog.description}</p>
                </div>

                <div className="p-3 bg-gray-50 rounded-2xl space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Thời lượng:</span>
                    <span className="font-semibold">{prog.durationMonths || 12} tháng ({prog.totalHours || 450} giờ)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Học phí chuẩn:</span>
                    <span className="font-bold text-indigo-700">
                      {new Intl.NumberFormat('vi-VN').format(prog.standardTuition || 0)} VNĐ
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Môn học / Lớp học:</span>
                    <span className="font-semibold">{prog.courseCount || 0} môn / {prog.classCount || 0} lớp</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenCurriculum(prog)}
                    className="flex-1 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <BookMarked className="w-3.5 h-3.5" />
                    <span>Khung Môn Học (S2-06)</span>
                  </button>

                  {canManage && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleProgramStatus(prog)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-gray-100 cursor-pointer"
                        title={prog.status === 'ACTIVE' ? 'Ngừng áp dụng' : 'Kích hoạt lại'}
                      >
                        {prog.status === 'ACTIVE' ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4 text-gray-400" />}
                      </button>
                      <button
                        onClick={() => handleOpenEditProgram(prog)}
                        className="p-1.5 text-gray-400 hover:text-amber-600 rounded-lg hover:bg-gray-100 cursor-pointer"
                        title="Sửa"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProgram(prog)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-gray-100 cursor-pointer"
                        title="Xoá"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 5: MÔN HỌC & ĐỀ CƯƠNG BUỔI HỌC (S2-05 & S2-07)
      ======================================================== */}
      {activeTab === 'COURSES' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((crs) => (
              <div
                key={crs.id}
                className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs hover:shadow-md transition-all space-y-3 relative group"
              >
                <div className="flex items-start justify-between">
                  <span className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-900 font-mono font-bold text-xs rounded-lg">
                    {crs.code}
                  </span>
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-800 font-bold rounded-md text-[10px]">
                    {crs.credits} tín chỉ
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-gray-900">{crs.name}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {crs.learningOutcomes || 'Chuẩn đầu ra môn học theo khung đào tạo'}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded-2xl space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Số buổi khai báo:</span>
                    <span className="font-bold text-indigo-700">
                      {crs.sessionCountDeclared || 0} / {crs.sessionCount || 15} buổi
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Học phí mỗi tín chỉ:</span>
                    <span className="font-semibold text-gray-900">
                      {new Intl.NumberFormat('vi-VN').format(crs.tuitionPerCredit || 500000)} VNĐ
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Chương trình dùng lại:</span>
                    <span className="font-semibold text-purple-700">{crs.usedInPrograms?.length || 0} chương trình</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenSyllabus(crs)}
                    className="flex-1 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ListOrdered className="w-3.5 h-3.5" />
                    <span>Đề Cương Buổi Học (S2-07)</span>
                  </button>

                  {canManage && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditCourse(crs)}
                        className="p-1.5 text-gray-400 hover:text-amber-600 rounded-lg hover:bg-gray-100 cursor-pointer"
                        title="Sửa môn học"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(crs)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-gray-100 cursor-pointer"
                        title="Xoá môn học"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL S3-05: MỞ LỚP HỌC MỚI TỪ CHƯƠNG TRÌNH ĐÀO TẠO
      ======================================================== */}
      {isOpenClassModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                <span>Mở Lớp Học Từ Chương Trình (S3-05)</span>
              </h3>
              <button onClick={() => setIsOpenClassModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {roomCapacityWarning && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>{roomCapacityWarning}</div>
              </div>
            )}

            <form onSubmit={handleOpenClassFromProgram} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Mã lớp học (Duy nhất) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: K15-FULLSTACK-01"
                    value={openClassForm.code}
                    onChange={(e) => setOpenClassForm({ ...openClassForm, code: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Tên lớp học *</label>
                  <input
                    type="text"
                    required
                    placeholder="Lớp Lập trình Web Fullstack K15"
                    value={openClassForm.name}
                    onChange={(e) => setOpenClassForm({ ...openClassForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Chương trình đào tạo (Sao chép môn học) *</label>
                <select
                  value={openClassForm.programId}
                  onChange={(e) => setOpenClassForm({ ...openClassForm, programId: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                >
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code}) - {p.courseCount || 0} môn học
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Sĩ số tối đa *</label>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={openClassForm.maxCapacity}
                    onChange={(e) => setOpenClassForm({ ...openClassForm, maxCapacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Hình thức học *</label>
                  <select
                    value={openClassForm.mode}
                    onChange={(e: any) => setOpenClassForm({ ...openClassForm, mode: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="OFFLINE">Trực tiếp (Offline)</option>
                    <option value="ONLINE">Trực tuyến (Online)</option>
                    <option value="HYBRID">Kết hợp (Hybrid)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Khai giảng dự kiến *</label>
                  <input
                    type="date"
                    required
                    value={openClassForm.startDate}
                    onChange={(e) => setOpenClassForm({ ...openClassForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Phòng học / Phòng trực tuyến</label>
                  <select
                    value={openClassForm.roomId}
                    onChange={(e) => setOpenClassForm({ ...openClassForm, roomId: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Chưa phân phòng --</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.code}) - Sức chứa: {r.capacity} chỗ ({r.type === 'ONLINE' ? 'Trực tuyến' : 'Vật lý'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsOpenClassModalOpen(false)}
                  className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={submittingOpenClass}
                  className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  {submittingOpenClass ? 'Đang tạo lớp...' : 'Mở Lớp Ngay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL S3-06: GHI DANH HỌC VIÊN VÀO LỚP HỌC
      ======================================================== */}
      {enrollModalClass && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <span>Ghi Danh Học Viên: {enrollModalClass.name}</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Mã lớp: <strong className="font-mono">{enrollModalClass.code}</strong> • Sĩ số hiện tại:{' '}
                  <strong className="text-indigo-700">
                    {enrollModalClass.currentCount || 0} / {enrollModalClass.maxCapacity || 40}
                  </strong>{' '}
                  (Còn trống: {(enrollModalClass.maxCapacity || 40) - (enrollModalClass.currentCount || 0)} chỗ)
                </p>
              </div>
              <button onClick={() => setEnrollModalClass(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Danh sách học viên chưa ghi danh vào lớp */}
            <form onSubmit={handleSubmitEnroll} className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              <h4 className="font-bold text-gray-700">
                Chọn học viên để ghi danh (Đã chọn: {selectedStudentIdsToEnroll.length} học viên):
              </h4>

              {students.filter((s) => !enrollModalClass.studentIds?.includes(s.id)).length === 0 ? (
                <div className="p-6 bg-gray-50 rounded-2xl text-center text-gray-400 italic">
                  Tất cả học viên trong hệ thống đã được ghi danh vào lớp này.
                </div>
              ) : (
                <div className="space-y-2">
                  {students
                    .filter((s) => !enrollModalClass.studentIds?.includes(s.id))
                    .map((s) => (
                      <label
                        key={s.id}
                        className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                          selectedStudentIdsToEnroll.includes(s.id)
                            ? 'bg-indigo-50/60 border-indigo-300 ring-2 ring-indigo-100'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedStudentIdsToEnroll.includes(s.id)}
                            onChange={() => toggleSelectStudentForEnroll(s.id)}
                            className="rounded-sm border-gray-300 text-indigo-600 cursor-pointer"
                          />
                          <div>
                            <div className="font-bold text-gray-900">{s.fullName}</div>
                            <div className="text-[11px] text-gray-500 font-mono">
                              {s.studentCode} • {s.phone} • {s.entryLevel}
                            </div>
                          </div>
                        </div>
                      </label>
                    ))}
                </div>
              )}

              {/* Danh sách học viên hiện đang trong lớp */}
              {enrollModalClass.studentIds && enrollModalClass.studentIds.length > 0 && (
                <div className="pt-3 border-t border-gray-100 space-y-2">
                  <h4 className="font-bold text-gray-700">
                    Học viên hiện đang học trong lớp ({enrollModalClass.studentIds.length}):
                  </h4>
                  <div className="space-y-1.5">
                    {students
                      .filter((s) => enrollModalClass.studentIds?.includes(s.id))
                      .map((s) => (
                        <div
                          key={s.id}
                          className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-gray-900">{s.fullName}</span>{' '}
                            <span className="font-mono text-gray-500">({s.studentCode})</span>
                          </div>
                          {canManage && (
                            <button
                              type="button"
                              onClick={() => handleRemoveStudentFromClass(enrollModalClass.id, s.id, s.fullName)}
                              className="text-[11px] text-rose-600 hover:underline font-bold cursor-pointer"
                            >
                              Rút học viên
                            </button>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEnrollModalClass(null)}
                  className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={submittingEnroll || selectedStudentIdsToEnroll.length === 0}
                  className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  {submittingEnroll ? 'Đang ghi danh...' : 'Xác Nhận Ghi Danh'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL S3-08: PHÂN CÔNG GIẢNG VIÊN & TRỢ GIẢNG THEO MÔN
      ======================================================== */}
      {assignModalClass && assignModalCourse && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">Phân Công Giảng Viên (S3-08)</h3>
                <p className="text-xs text-gray-500">
                  Môn: <strong className="text-indigo-700">{assignModalCourse.courseName}</strong> • Lớp: {assignModalClass.code}
                </p>
              </div>
              <button onClick={() => setAssignModalClass(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAssign} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Giảng viên chính (Vai trò TEACHER bắt buộc) *
                </label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Chưa phân công giảng viên chính --</option>
                  {instructors.teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName} ({t.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Trợ giảng (Vai trò ASSISTANT hoặc TEACHER):
                </label>
                <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 bg-gray-50 rounded-xl border border-gray-200">
                  {instructors.assistants.map((ast) => (
                    <label
                      key={ast.id}
                      className="flex items-center gap-2 p-1.5 hover:bg-white rounded-lg cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAssistantIds.includes(ast.id)}
                        onChange={() => toggleSelectAssistant(ast.id)}
                        className="rounded-sm border-gray-300 text-indigo-600 cursor-pointer"
                      />
                      <span className="font-medium text-gray-800">
                        {ast.fullName} <span className="text-gray-400 text-[10px]">({ast.email})</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setAssignModalClass(null)}
                  className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={submittingAssign}
                  className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  {submittingAssign ? 'Đang lưu...' : 'Lưu Phân Công'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL S3-04: CHI TIẾT HỒ SƠ HỌC VIÊN
      ======================================================== */}
      {studentDetailModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">{studentDetailModal.fullName}</h3>
                <p className="text-xs text-indigo-700 font-mono font-bold">Mã HV: {studentDetailModal.studentCode}</p>
              </div>
              <button onClick={() => setStudentDetailModal(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs">
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-400">Số điện thoại:</span>
                  <div className="font-mono font-bold text-gray-900">{studentDetailModal.phone}</div>
                </div>
                <div>
                  <span className="text-gray-400">Email:</span>
                  <div className="font-mono text-gray-900 truncate">{studentDetailModal.email}</div>
                </div>
                <div>
                  <span className="text-gray-400">Trình độ đầu vào:</span>
                  <div className="font-semibold text-gray-900">{studentDetailModal.entryLevel}</div>
                </div>
                <div>
                  <span className="text-gray-400">Địa chỉ:</span>
                  <div className="text-gray-900">{studentDetailModal.address || 'Chưa cập nhật'}</div>
                </div>
              </div>

              {/* Lớp đang học */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Lớp Học Đang Tham Gia:</span>
                </h4>
                {studentDetailModal.currentClasses && studentDetailModal.currentClasses.length > 0 ? (
                  <div className="space-y-1">
                    {studentDetailModal.currentClasses.map((c) => (
                      <div key={c.classId} className="p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl flex justify-between items-center">
                        <div>
                          <span className="font-bold text-emerald-950">{c.className}</span>{' '}
                          <span className="font-mono text-xs text-emerald-700">({c.classCode})</span>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-md text-[10px]">
                          {c.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-xl text-gray-400 italic">Không có lớp đang học.</div>
                )}
              </div>

              {/* Lịch sử lớp đã học */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>Lịch Sử Các Lớp Đã Học:</span>
                </h4>
                {studentDetailModal.pastClasses && studentDetailModal.pastClasses.length > 0 ? (
                  <div className="space-y-1">
                    {studentDetailModal.pastClasses.map((c) => (
                      <div key={c.classId} className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl flex justify-between items-center">
                        <div>
                          <span className="font-bold text-gray-700">{c.className}</span>{' '}
                          <span className="font-mono text-xs text-gray-500">({c.classCode})</span>
                        </div>
                        <span className="px-2 py-0.5 bg-gray-200 text-gray-700 font-bold rounded-md text-[10px]">
                          {c.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-xl text-gray-400 italic">Chưa có lịch sử lớp học cũ.</div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                onClick={() => setStudentDetailModal(null)}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 font-bold text-gray-700 rounded-xl text-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL S3-04: SỬA HỒ SƠ HỌC VIÊN
      ======================================================== */}
      {isEditStudentModalOpen && editingStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">Chỉnh Sửa Hồ Sơ Học Viên (S3-04)</h3>
              <button onClick={() => setIsEditStudentModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudentEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Họ và tên *</label>
                <input
                  type="text"
                  required
                  value={studentEditForm.fullName}
                  onChange={(e) => setStudentEditForm({ ...studentEditForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Số điện thoại *</label>
                  <input
                    type="tel"
                    required
                    value={studentEditForm.phone}
                    onChange={(e) => setStudentEditForm({ ...studentEditForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Trình độ đầu vào</label>
                  <select
                    value={studentEditForm.entryLevel}
                    onChange={(e) => setStudentEditForm({ ...studentEditForm, entryLevel: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="THPT">Tốt nghiệp THPT</option>
                    <option value="Cao đẳng">Cao đẳng</option>
                    <option value="Đại học">Đại học</option>
                    <option value="Người đi làm chuyển ngành">Người đi làm chuyển ngành</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Địa chỉ liên hệ</label>
                <input
                  type="text"
                  value={studentEditForm.address}
                  onChange={(e) => setStudentEditForm({ ...studentEditForm, address: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Ghi chú</label>
                <textarea
                  rows={2}
                  value={studentEditForm.note}
                  onChange={(e) => setStudentEditForm({ ...studentEditForm, note: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditStudentModalOpen(false)}
                  className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={submittingStudentEdit}
                  className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  {submittingStudentEdit ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL S3-09: THÊM / SỬA PHÒNG HỌC
      ======================================================== */}
      {isRoomModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">
                {editingRoom ? 'Chỉnh Sửa Phòng Học' : 'Thêm Phòng Học Mới (S3-09)'}
              </h3>
              <button onClick={() => setIsRoomModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoom} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Mã phòng *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingRoom}
                    placeholder="LAB-101"
                    value={roomForm.code}
                    onChange={(e) => setRoomForm({ ...roomForm, code: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Loại phòng *</label>
                  <select
                    value={roomForm.type}
                    onChange={(e: any) => setRoomForm({ ...roomForm, type: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="PHYSICAL">Phòng vật lý</option>
                    <option value="ONLINE">Phòng trực tuyến</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Tên phòng học *</label>
                <input
                  type="text"
                  required
                  placeholder="Phòng Thực Hành Máy Tính 1"
                  value={roomForm.name}
                  onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Sức chứa (chỗ) *</label>
                  <input
                    type="number"
                    min={5}
                    max={200}
                    required
                    value={roomForm.capacity}
                    onChange={(e) => setRoomForm({ ...roomForm, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Toà nhà / Vị trí</label>
                  <input
                    type="text"
                    placeholder="Toà Nhà A"
                    value={roomForm.building}
                    onChange={(e) => setRoomForm({ ...roomForm, building: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {roomForm.type === 'ONLINE' ? (
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Đường dẫn cuộc họp trực tuyến (Meeting URL)</label>
                  <input
                    type="url"
                    placeholder="https://meet.google.com/xyz hoặc Zoom link"
                    value={roomForm.onlineMeetingUrl}
                    onChange={(e) => setRoomForm({ ...roomForm, onlineMeetingUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Trang thiết bị phòng học</label>
                  <input
                    type="text"
                    placeholder="Máy chiếu, 30 PC, điều hoà nhiệt độ"
                    value={roomForm.equipment}
                    onChange={(e) => setRoomForm({ ...roomForm, equipment: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsRoomModalOpen(false)}
                  className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={submittingRoom}
                  className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  {submittingRoom ? 'Đang lưu...' : 'Lưu Phòng Học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL S2-04: THÊM / SỬA CHƯƠNG TRÌNH ĐÀO TẠO
      ======================================================== */}
      {isProgramModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <span>{editingProgram ? 'Chỉnh Sửa Chương Trình Đào Tạo' : 'Thêm Chương Trình Đào Tạo Mới'}</span>
              </h3>
              <button onClick={() => setIsProgramModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProgram} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Mã chương trình (Duy nhất) *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingProgram}
                    placeholder="Ví dụ: CNTT, ATTT"
                    value={progForm.code}
                    onChange={(e) => setProgForm({ ...progForm, code: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono uppercase focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Tên chương trình *</label>
                  <input
                    type="text"
                    required
                    placeholder="Kỹ nghệ Phần mềm"
                    value={progForm.name}
                    onChange={(e) => setProgForm({ ...progForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Mô tả chương trình</label>
                <textarea
                  rows={2}
                  value={progForm.description}
                  onChange={(e) => setProgForm({ ...progForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Thời lượng (tháng)</label>
                  <input
                    type="number"
                    value={progForm.durationMonths}
                    onChange={(e) => setProgForm({ ...progForm, durationMonths: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Tổng số giờ</label>
                  <input
                    type="number"
                    value={progForm.totalHours}
                    onChange={(e) => setProgForm({ ...progForm, totalHours: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Học phí chuẩn (VNĐ)</label>
                  <input
                    type="number"
                    value={progForm.standardTuition}
                    onChange={(e) => setProgForm({ ...progForm, standardTuition: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsProgramModalOpen(false)}
                  className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs cursor-pointer"
                >
                  Lưu Chương Trình
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL S2-06: KHUNG MÔN HỌC & MÔN TIÊN QUYẾT (CURRICULUM)
      ======================================================== */}
      {curriculumProgram && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Khung Chương Trình: {curriculumProgram.name} ({curriculumProgram.code})
                </h3>
                <p className="text-xs text-gray-500">Gắn môn học, sắp xếp thứ tự và khai báo môn tiên quyết (S2-06)</p>
              </div>
              <button onClick={() => setCurriculumProgram(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {canManage && (
              <form onSubmit={handleAddCourseToProgram} className="p-3.5 bg-purple-50/50 border border-purple-100 rounded-2xl space-y-3 text-xs">
                <h4 className="font-bold text-purple-900">Gắn Thêm Môn Học Vào Chương Trình:</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Chọn môn học cần thêm *</label>
                    <select
                      value={selectedCourseToAdd}
                      onChange={(e) => setSelectedCourseToAdd(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">-- Chọn môn học --</option>
                      {courses.map((crs) => (
                        <option key={crs.id} value={crs.id}>
                          {crs.name} ({crs.code}) - {crs.credits} tín chỉ
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Môn tiên quyết (Nếu có)</label>
                    <select
                      value={selectedPrereqToAdd}
                      onChange={(e) => setSelectedPrereqToAdd(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">-- Không yêu cầu môn tiên quyết --</option>
                      {curriculumCourses.map((c) => (
                        <option key={c.courseId} value={c.courseId}>
                          {c.courseName} ({c.courseCode})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                  >
                    Gắn Môn Học
                  </button>
                </div>
              </form>
            )}

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {curriculumLoading ? (
                <div className="p-8 text-center text-xs text-gray-400">Đang tải khung môn học...</div>
              ) : curriculumCourses.length === 0 ? (
                <div className="p-8 bg-gray-50 rounded-2xl text-center text-xs text-gray-400 italic">
                  Chưa có môn học nào được gắn vào chương trình này.
                </div>
              ) : (
                curriculumCourses.map((c, index) => (
                  <div
                    key={c.courseId}
                    className="p-3 bg-white rounded-2xl border border-gray-200 flex items-center justify-between gap-3 text-xs hover:border-purple-300 transition-all shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-900 font-bold flex items-center justify-center text-xs">
                        {index + 1}
                      </span>
                      <div>
                        <div className="font-bold text-gray-900">
                          {c.courseName} <span className="font-mono text-gray-500 text-[11px]">({c.courseCode})</span>
                        </div>
                        <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                          <span>{c.credits} tín chỉ</span>
                          <span>•</span>
                          <span>{c.sessionCount} buổi học</span>
                          {c.prerequisiteCourseName && (
                            <>
                              <span>•</span>
                              <span className="text-amber-700 font-semibold">
                                Tiên quyết: {c.prerequisiteCourseName}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {canManage && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveCourseOrder(index, 'UP')}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-30 rounded-lg hover:bg-gray-100 cursor-pointer"
                          title="Chuyển lên trước"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMoveCourseOrder(index, 'DOWN')}
                          disabled={index === curriculumCourses.length - 1}
                          className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-30 rounded-lg hover:bg-gray-100 cursor-pointer"
                          title="Chuyển xuống sau"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRemoveCourseFromProgram(c.courseId)}
                          className="p-1 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                          title="Gỡ khỏi chương trình"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                onClick={() => setCurriculumProgram(null)}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 font-bold text-gray-700 rounded-xl text-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL S2-05: THÊM / SỬA MÔN HỌC
      ======================================================== */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <span>{editingCourse ? 'Chỉnh Sửa Môn Học' : 'Thêm Môn Học Mới (S2-05)'}</span>
              </h3>
              <button onClick={() => setIsCourseModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Mã môn học (Duy nhất) *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingCourse}
                    placeholder="CS101, PROG201"
                    value={courseForm.code}
                    onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono uppercase focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Tên môn học *</label>
                  <input
                    type="text"
                    required
                    placeholder="Lập Trình Web Cơ Bản"
                    value={courseForm.name}
                    onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Số tín chỉ</label>
                  <input
                    type="number"
                    value={courseForm.credits}
                    onChange={(e) => setCourseForm({ ...courseForm, credits: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Số buổi chuẩn</label>
                  <input
                    type="number"
                    value={courseForm.sessionCount}
                    onChange={(e) => setCourseForm({ ...courseForm, sessionCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Học phí/Tín chỉ</label>
                  <input
                    type="number"
                    value={courseForm.tuitionPerCredit}
                    onChange={(e) => setCourseForm({ ...courseForm, tuitionPerCredit: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Mô tả chuẩn đầu ra</label>
                <textarea
                  rows={2}
                  value={courseForm.learningOutcomes}
                  onChange={(e) => setCourseForm({ ...courseForm, learningOutcomes: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCourseModalOpen(false)}
                  className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs cursor-pointer"
                >
                  Lưu Môn Học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL S2-07: ĐỀ CƯƠNG BUỔI HỌC (SYLLABUS SESSIONS)
      ======================================================== */}
      {syllabusCourse && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Đề Cương Chi Tiết: {syllabusCourse.name} ({syllabusCourse.code})
                </h3>
                <p className="text-xs text-gray-500">
                  Số buổi khai báo: {courseSessions.length} / {syllabusCourse.sessionCount || 15} buổi
                </p>
              </div>
              <div className="flex items-center gap-2">
                {canManage && (
                  <button
                    onClick={() => {
                      setCloneSourceCourseId('')
                      setIsCloneModalOpen(true)
                    }}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Nhân Bản Từ Môn Khác</span>
                  </button>
                )}
                <button onClick={() => setSyllabusCourse(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {canManage && (
              <form onSubmit={handleAddSession} className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-3 text-xs">
                <h4 className="font-bold text-blue-900">Thêm Buổi Học Mới:</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Chủ đề bài giảng *</label>
                    <input
                      type="text"
                      required
                      placeholder="Tổng quan kiến thức..."
                      value={newSessionTopic}
                      onChange={(e) => setNewSessionTopic(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Mục tiêu buổi học *</label>
                    <input
                      type="text"
                      required
                      placeholder="Hiểu và áp dụng được..."
                      value={newSessionObjective}
                      onChange={(e) => setNewSessionObjective(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                  >
                    Thêm Buổi Học
                  </button>
                </div>
              </form>
            )}

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {syllabusLoading ? (
                <div className="p-8 text-center text-xs text-gray-400">Đang tải đề cương...</div>
              ) : courseSessions.length === 0 ? (
                <div className="p-8 bg-gray-50 rounded-2xl text-center text-xs text-gray-400 italic">
                  Chưa khai báo buổi học nào cho môn học này.
                </div>
              ) : (
                courseSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-3 bg-white rounded-2xl border border-gray-200 flex items-start justify-between gap-3 text-xs hover:border-blue-300 transition-all shadow-2xs"
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-900 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                        {session.sessionNumber}
                      </span>
                      <div>
                        <div className="font-bold text-gray-900">{session.topic}</div>
                        <div className="text-gray-500 text-[11px] mt-0.5">Mục tiêu: {session.objective}</div>
                      </div>
                    </div>

                    {canManage && (
                      <button
                        onClick={() => handleDeleteSession(session.id)}
                        className="p-1 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                        title="Xoá buổi học"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                onClick={() => setSyllabusCourse(null)}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 font-bold text-gray-700 rounded-xl text-xs cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL S2-07: NHÂN BẢN ĐỀ CƯƠNG BUỔI HỌC */}
      {isCloneModalOpen && syllabusCourse && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Copy className="w-5 h-5 text-indigo-600" />
                <span>Nhân Bản Đề Cương Buổi Học</span>
              </h3>
              <button onClick={() => setIsCloneModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCloneSessions} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Chọn môn học nguồn để sao chép *</label>
                <select
                  value={cloneSourceCourseId}
                  onChange={(e) => setCloneSourceCourseId(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Chọn môn học mẫu --</option>
                  {courses
                    .filter((c) => c.id !== syllabusCourse.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code}) - {c.sessionCountDeclared || 0} buổi
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCloneModalOpen(false)}
                  className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs cursor-pointer"
                >
                  Xác Nhận Nhân Bản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
