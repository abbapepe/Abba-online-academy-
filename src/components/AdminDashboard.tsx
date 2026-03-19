import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Users, 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  Search, 
  LayoutDashboard, 
  Settings,
  Shield,
  UserCheck,
  User as UserIcon,
  MoreVertical,
  ChevronRight,
  BarChart3,
  GraduationCap
} from 'lucide-react';
import { Course, UserProfile, Lesson } from '../App';
import { 
  db, 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  addDoc, 
  deleteDoc,
  query,
  where,
  handleFirestoreError,
  OperationType
} from '../firebase';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'ha';
  onManageLessons: (course: Course) => void;
}

type Tab = 'overview' | 'courses' | 'users';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  language,
  onManageLessons
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [enrollments, setEnrollments] = useState<{ courseId: string; userId: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [courseForm, setCourseForm] = useState<Omit<Course, 'id'>>({
    title: '',
    titleHa: '',
    description: '',
    descriptionHa: '',
    duration: '',
    students: 0,
    category: '',
    department: '',
    image: 'https://picsum.photos/seed/course/800/600',
    language: 'both',
    price: 0
  });

  const t = {
    en: {
      title: "Admin Dashboard",
      overview: "Overview",
      courses: "Courses",
      users: "Users",
      totalStudents: "Total Students",
      totalCourses: "Total Courses",
      activeEnrollments: "Active Enrollments",
      addCourse: "Add New Course",
      editCourse: "Edit Course",
      deleteCourse: "Delete Course",
      manageLessons: "Manage Lessons",
      searchUsers: "Search users by name or email...",
      searchCourses: "Search courses...",
      role: "Role",
      joined: "Joined",
      actions: "Actions",
      save: "Save",
      cancel: "Cancel",
      confirmDelete: "Are you sure you want to delete this course? This action cannot be undone.",
      admin: "Admin",
      student: "Student",
      makeAdmin: "Make Admin",
      makeStudent: "Make Student",
      noUsers: "No users found.",
      noCourses: "No courses found."
    },
    ha: {
      title: "Dandalin Gudanarwa",
      overview: "Bayani",
      courses: "Darussa",
      users: "Masu Amfani",
      totalStudents: "Jimlar Dalibai",
      totalCourses: "Jimlar Darussa",
      activeEnrollments: "Masu Karatu",
      addCourse: "Kara Sabon Darasi",
      editCourse: "Gyara Darasi",
      deleteCourse: "Goge Darasi",
      manageLessons: "Sarrafa Darussa",
      searchUsers: "Nemo masu amfani...",
      searchCourses: "Nemo darussa...",
      role: "Matsayi",
      joined: "Shiga",
      actions: "Ayyuka",
      save: "Ajiye",
      cancel: "Soke",
      confirmDelete: "Shin kun tabbata kuna son goge wannan darasin? Ba za a iya dawo da shi ba.",
      admin: "Gudanarwa",
      student: "Dalibi",
      makeAdmin: "Sanya Gudanarwa",
      makeStudent: "Sanya Dalibi",
      noUsers: "Ba a sami masu amfani ba.",
      noCourses: "Ba a sami darussa ba."
    }
  }[language];

  useEffect(() => {
    if (!isOpen) return;

    const coursesUnsubscribe = onSnapshot(collection(db, 'courses'), (snapshot) => {
      const coursesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
      setCourses(coursesData);
    });

    const usersUnsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
      setUsers(usersData);
      setLoading(false);
    });

    const enrollmentsUnsubscribe = onSnapshot(collection(db, 'enrollments'), (snapshot) => {
      const enrollmentsData = snapshot.docs.map(doc => doc.data() as { courseId: string; userId: string });
      setEnrollments(enrollmentsData);
    });

    return () => {
      coursesUnsubscribe();
      usersUnsubscribe();
      enrollmentsUnsubscribe();
    };
  }, [isOpen]);

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await updateDoc(doc(db, 'courses', editingCourse.id), courseForm);
      } else {
        await addDoc(collection(db, 'courses'), courseForm);
      }
      setIsAddingCourse(false);
      setEditingCourse(null);
      setCourseForm({
        title: '',
        titleHa: '',
        description: '',
        descriptionHa: '',
        duration: '',
        students: 0,
        category: '',
        department: '',
        image: 'https://picsum.photos/seed/course/800/600',
        language: 'both',
        price: 0
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'courses');
    }
  };

  const handleDeleteCourse = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'courses', id));
      setCourseToDelete(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `courses/${id}`);
    }
  };

  const handleToggleRole = async (user: UserProfile) => {
    const newRole = user.role === 'admin' ? 'student' : 'admin';
    try {
      await updateDoc(doc(db, 'users', user.uid), { role: newRole });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const openEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      titleHa: course.titleHa,
      description: course.description,
      descriptionHa: course.descriptionHa,
      duration: course.duration,
      students: course.students,
      category: course.category,
      department: course.department || '',
      image: course.image,
      language: course.language || 'both',
      price: course.price || 0
    });
    setIsAddingCourse(true);
  };

  const getEnrollmentCount = (courseId: string) => {
    return enrollments.filter(e => e.courseId === courseId).length;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white w-full max-w-7xl h-[90vh] rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Sidebar & Header */}
            <div className="flex h-full">
              {/* Sidebar */}
              <div className="w-64 bg-zinc-50 border-r border-zinc-100 p-8 flex flex-col">
                <div className="flex items-center gap-3 mb-12">
                  <div className="bg-emerald-600 p-2 rounded-xl">
                    <Shield className="text-white" size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-zinc-900 leading-tight">Admin<br/><span className="text-emerald-600">Panel</span></h2>
                </div>

                <nav className="space-y-2 flex-1">
                  {[
                    { id: 'overview', icon: LayoutDashboard, label: t.overview },
                    { id: 'courses', icon: BookOpen, label: t.courses },
                    { id: 'users', icon: Users, label: t.users }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as Tab)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${
                        activeTab === item.id 
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
                          : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
                      }`}
                    >
                      <item.icon size={20} />
                      {item.label}
                    </button>
                  ))}
                </nav>

                <button 
                  onClick={onClose}
                  className="mt-auto flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-red-600 font-bold transition-colors"
                >
                  <X size={20} />
                  {language === 'en' ? 'Close' : 'Rufe'}
                </button>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col overflow-hidden bg-white">
                <header className="h-20 border-b border-zinc-100 px-10 flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-zinc-900">{t[activeTab]}</h3>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                      <input 
                        type="text" 
                        placeholder={activeTab === 'users' ? t.searchUsers : t.searchCourses}
                        className="pl-12 pr-6 py-2.5 bg-zinc-50 border border-zinc-200 rounded-full text-sm w-80 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                  </div>
                </header>

                <div className="flex-1 overflow-y-auto p-10">
                  {activeTab === 'overview' && (
                    <div className="space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                          { label: t.totalStudents, value: users.length, icon: Users, color: 'bg-blue-50 text-blue-600' },
                          { label: t.totalCourses, value: courses.length, icon: BookOpen, color: 'bg-emerald-50 text-emerald-600' },
                          { label: t.activeEnrollments, value: enrollments.length, icon: GraduationCap, color: 'bg-purple-50 text-purple-600' }
                        ].map((stat, i) => (
                          <div key={i} className="bg-white border border-zinc-100 p-8 rounded-[2rem] shadow-sm hover:shadow-md transition-all">
                            <div className={`${stat.color} p-4 rounded-2xl inline-flex mb-6`}>
                              <stat.icon size={24} />
                            </div>
                            <p className="text-zinc-500 font-bold uppercase tracking-wider text-xs mb-2">{stat.label}</p>
                            <h4 className="text-4xl font-black text-zinc-900">{stat.value.toLocaleString()}</h4>
                          </div>
                        ))}
                      </div>

                      <div className="bg-zinc-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
                        <div className="relative z-10">
                          <h4 className="text-3xl font-bold mb-4">Welcome back, Admin</h4>
                          <p className="text-zinc-400 max-w-md">Manage your academy's growth and track student progress from this central hub.</p>
                        </div>
                        <BarChart3 className="absolute right-10 bottom-0 text-white/5 w-64 h-64 -mb-10" />
                      </div>
                    </div>
                  )}

                  {activeTab === 'courses' && (
                    <div className="space-y-8">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xl font-bold text-zinc-900">{courses.length} {t.courses}</h4>
                        <button 
                          onClick={() => {
                            setEditingCourse(null);
                            setCourseForm({
                              title: '',
                              titleHa: '',
                              description: '',
                              descriptionHa: '',
                              duration: '',
                              students: 0,
                              category: '',
                              department: '',
                              image: 'https://picsum.photos/seed/course/800/600',
                              language: 'both',
                              price: 0
                            });
                            setIsAddingCourse(true);
                          }}
                          className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20"
                        >
                          <Plus size={20} />
                          {t.addCourse}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {courses.map(course => (
                          <div key={course.id} className="bg-white border border-zinc-100 p-6 rounded-3xl flex items-center gap-6 hover:shadow-md transition-all group">
                            <img src={course.image} alt="" className="w-24 h-24 rounded-2xl object-cover" />
                            <div className="flex-1 min-w-0">
                              <h5 className="text-lg font-bold text-zinc-900 truncate">{language === 'en' ? course.title : course.titleHa}</h5>
                              <p className="text-zinc-500 text-sm mt-1">{course.category} • {course.duration}</p>
                              <div className="flex items-center gap-4 mt-3">
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                                  {getEnrollmentCount(course.id)} {language === 'en' ? 'Students' : 'Dalibai'}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => onManageLessons(course)}
                                className="p-3 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                                title={t.manageLessons}
                              >
                                <Settings size={20} />
                              </button>
                              <button 
                                onClick={() => openEditCourse(course)}
                                className="p-3 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                              >
                                <Edit size={20} />
                              </button>
                              <button 
                                onClick={() => setCourseToDelete(course.id)}
                                className="p-3 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'users' && (
                    <div className="bg-white border border-zinc-100 rounded-[2rem] overflow-hidden shadow-sm">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-zinc-50 border-b border-zinc-100">
                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-wider">{t.users}</th>
                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-wider">{t.role}</th>
                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-wider">{t.joined}</th>
                            <th className="px-8 py-5 text-xs font-bold text-zinc-400 uppercase tracking-wider text-right">{t.actions}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {users.map(user => (
                            <tr key={user.uid} className="hover:bg-zinc-50/50 transition-colors">
                              <td className="px-8 py-5">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                                    <UserIcon size={20} />
                                  </div>
                                  <div>
                                    <p className="font-bold text-zinc-900">{user.displayName || 'Anonymous'}</p>
                                    <p className="text-xs text-zinc-500">{user.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-5">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  user.role === 'admin' ? 'bg-purple-50 text-purple-600' : 'bg-zinc-100 text-zinc-600'
                                }`}>
                                  {user.role === 'admin' ? <Shield size={10} /> : <GraduationCap size={10} />}
                                  {user.role === 'admin' ? t.admin : t.student}
                                </span>
                              </td>
                              <td className="px-8 py-5 text-sm text-zinc-500">
                                {user.createdAt?.toDate ? user.createdAt.toDate().toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="px-8 py-5 text-right">
                                <button 
                                  onClick={() => handleToggleRole(user)}
                                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                                >
                                  {user.role === 'admin' ? t.makeStudent : t.makeAdmin}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Add/Edit Course Modal */}
          <AnimatePresence>
            {isAddingCourse && (
              <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsAddingCourse(false)}
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="relative bg-white w-full max-w-2xl rounded-[2.5rem] p-10 shadow-2xl overflow-hidden"
                >
                  <h3 className="text-2xl font-bold text-zinc-900 mb-8">{editingCourse ? t.editCourse : t.addCourse}</h3>
                  <form onSubmit={handleAddCourse} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider mb-2">Title (EN)</label>
                        <input 
                          type="text" 
                          required
                          value={courseForm.title}
                          onChange={(e) => setCourseForm({...courseForm, title: e.target.value})}
                          className="w-full px-5 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider mb-2">Title (HA)</label>
                        <input 
                          type="text" 
                          required
                          value={courseForm.titleHa}
                          onChange={(e) => setCourseForm({...courseForm, titleHa: e.target.value})}
                          className="w-full px-5 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider mb-2">Description (EN)</label>
                        <textarea 
                          required
                          rows={3}
                          value={courseForm.description}
                          onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                          className="w-full px-5 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider mb-2">Description (HA)</label>
                        <textarea 
                          required
                          rows={3}
                          value={courseForm.descriptionHa}
                          onChange={(e) => setCourseForm({...courseForm, descriptionHa: e.target.value})}
                          className="w-full px-5 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider mb-2">Department</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. Technology"
                          value={courseForm.department}
                          onChange={(e) => setCourseForm({...courseForm, department: e.target.value})}
                          className="w-full px-5 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider mb-2">Duration</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. 8 Weeks"
                          value={courseForm.duration}
                          onChange={(e) => setCourseForm({...courseForm, duration: e.target.value})}
                          className="w-full px-5 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider mb-2">Category</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. Web Design"
                          value={courseForm.category}
                          onChange={(e) => setCourseForm({...courseForm, category: e.target.value})}
                          className="w-full px-5 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider mb-2">Price (₦)</label>
                        <input 
                          type="number" 
                          required
                          min="0"
                          value={courseForm.price}
                          onChange={(e) => setCourseForm({...courseForm, price: parseInt(e.target.value) || 0})}
                          className="w-full px-5 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider mb-2">Language</label>
                        <select 
                          value={courseForm.language}
                          onChange={(e) => setCourseForm({...courseForm, language: e.target.value as any})}
                          className="w-full px-5 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="both">Bilingual (EN & HA)</option>
                          <option value="en">English Only</option>
                          <option value="ha">Hausa Only</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider mb-2">Initial Students</label>
                        <input 
                          type="number" 
                          required
                          min="0"
                          value={courseForm.students}
                          onChange={(e) => setCourseForm({...courseForm, students: parseInt(e.target.value) || 0})}
                          className="w-full px-5 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider mb-2">Image URL</label>
                        <input 
                          type="url" 
                          required
                          value={courseForm.image}
                          onChange={(e) => setCourseForm({...courseForm, image: e.target.value})}
                          className="w-full px-5 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button 
                        type="submit"
                        className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                      >
                        <Save size={20} />
                        {t.save}
                      </button>
                      <button 
                        type="button"
                        onClick={() => setIsAddingCourse(false)}
                        className="px-8 py-4 bg-zinc-100 text-zinc-600 rounded-2xl font-bold hover:bg-zinc-200 transition-all"
                      >
                        {t.cancel}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
          {/* Delete Confirmation Modal */}
          <AnimatePresence>
            {courseToDelete && (
              <div className="fixed inset-0 z-[170] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setCourseToDelete(null)}
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="relative bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl overflow-hidden"
                >
                  <h3 className="text-2xl font-bold text-zinc-900 mb-4">{t.deleteCourse}</h3>
                  <p className="text-zinc-600 mb-8">{t.confirmDelete}</p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setCourseToDelete(null)}
                      className="flex-1 py-4 px-6 bg-zinc-100 text-zinc-700 rounded-2xl font-bold hover:bg-zinc-200 transition-all"
                    >
                      {t.cancel}
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(courseToDelete)}
                      className="flex-1 py-4 px-6 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200"
                    >
                      {t.deleteCourse}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
};
