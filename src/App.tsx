import React, { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import { 
  BookOpen, 
  Clock, 
  Globe, 
  GraduationCap, 
  Home, 
  Info, 
  LogIn, 
  Menu, 
  X, 
  ChevronRight,
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  LogOut,
  User as UserIcon,
  AlertCircle,
  Users,
  Plus,
  Edit,
  Trash2,
  Save,
  CheckCircle2,
  Play,
  Award,
  UserPlus,
  Target,
  Heart,
  CreditCard,
  ShieldCheck,
  Search,
  Check,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LessonViewer } from './components/LessonViewer';
import { LessonManager } from './components/LessonManager';
import { Certificate } from './components/Certificate';
import { ProfileModal } from './components/ProfileModal';
import { AdminDashboard } from './components/AdminDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { PaymentModal } from './components/PaymentModal';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  addDoc, 
  deleteDoc,
  doc, 
  getDocFromServer,
  handleFirestoreError, 
  OperationType,
  FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from './firebase';

// --- Types ---
export interface Course {
  id: string;
  title: string;
  titleHa: string;
  description: string;
  descriptionHa: string;
  duration: string;
  students: number;
  category: string;
  department: string;
  image: string;
  language: 'en' | 'ha' | 'both';
  price: number;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  titleHa: string;
  order: number;
  content?: string;
  contentHa?: string;
  videoUrl?: string;
}

export interface Progress {
  courseId: string;
  completedLessons: string[];
  lastUpdated: any;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  phoneNumber?: string;
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  photoURL?: string;
  role: 'student' | 'admin';
  createdAt: any;
}

// --- Error Boundary ---
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let message = "Something went wrong.";
      try {
        const parsed = JSON.parse(this.state.error.message);
        message = `Firestore Error: ${parsed.operationType} at ${parsed.path} failed.`;
      } catch (e) {
        message = this.state.error.message || message;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
            <div className="bg-red-100 text-red-600 p-4 rounded-2xl inline-flex mb-6">
              <AlertCircle size={48} />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Application Error</h2>
            <p className="text-zinc-600 mb-8">{message}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// --- Context ---
const AuthContext = createContext<{
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, name: string, phoneNumber: string, gender: string, dob: string) => Promise<void>;
  logout: () => Promise<void>;
}>({
  user: null,
  profile: null,
  loading: true,
  login: async () => {},
  loginWithEmail: async () => {},
  signupWithEmail: async () => {},
  logout: async () => {},
});

const useAuth = () => useContext(AuthContext);

// --- Components ---

const Navbar = ({ 
  onLoginClick, 
  onProfileClick,
  language, 
  setLanguage 
}: { 
  onLoginClick: () => void, 
  onProfileClick: () => void,
  language: 'en' | 'ha', 
  setLanguage: (l: 'en' | 'ha') => void 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, logout } = useAuth();

  const navLinks = [
    { name: language === 'en' ? 'Home' : 'Gida', icon: <Home size={18} />, href: '#' },
    { name: language === 'en' ? 'About' : 'Game da Mu', icon: <Info size={18} />, href: '#about' },
    { name: language === 'en' ? 'Programs' : 'Shirye-shirye', icon: <BookOpen size={18} />, href: '#programs' },
    { name: language === 'en' ? 'Certificates' : 'Takardu', icon: <Award size={18} />, href: '#certificates' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 p-2 rounded-lg">
              <GraduationCap className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold text-zinc-900 tracking-tight">
              Abba <span className="text-emerald-600">Academy</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="flex items-center gap-1.5 text-zinc-600 hover:text-emerald-600 font-medium transition-colors"
              >
                {link.icon}
                {link.name}
              </a>
            ))}
            
            <div className="flex items-center bg-zinc-100 rounded-full p-1">
              <button 
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${language === 'en' ? 'bg-white text-emerald-600 shadow-sm' : 'text-zinc-400'}`}
              >
                EN
              </button>
              <button 
                onClick={() => setLanguage('ha')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${language === 'ha' ? 'bg-white text-emerald-600 shadow-sm' : 'text-zinc-400'}`}
              >
                HA
              </button>
            </div>

            {user ? (
              <div className="flex items-center gap-4">
                <button 
                  onClick={onProfileClick}
                  className="flex items-center gap-2 bg-zinc-100 text-zinc-900 pl-2 pr-4 py-1.5 rounded-full hover:bg-zinc-200 transition-all font-medium"
                >
                  {profile?.photoURL ? (
                    <img src={profile.photoURL} alt="Profile" className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <UserIcon size={18} />
                    </div>
                  )}
                  <span className="text-sm">
                    {profile?.displayName || user.displayName || 'User'}
                  </span>
                </button>
                <button 
                  onClick={logout}
                  className="flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-600 transition-colors"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button 
                onClick={onLoginClick}
                className="flex items-center gap-2 bg-zinc-900 text-white px-5 py-2 rounded-full hover:bg-zinc-800 transition-all font-medium"
              >
                <LogIn size={18} />
                {language === 'en' ? 'Student Login' : 'Shiga Dalibai'}
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-4">
            <button 
              onClick={() => setLanguage(language === 'en' ? 'ha' : 'en')}
              className="text-xs font-bold bg-zinc-100 px-3 py-1 rounded-full text-emerald-600"
            >
              {language === 'en' ? 'HA' : 'EN'}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-zinc-200 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 text-zinc-600 hover:bg-zinc-50 rounded-xl font-medium transition-colors"
                >
                  {link.icon}
                  {link.name}
                </a>
              ))}
              {user ? (
                <div className="space-y-2 pt-4">
                  <button 
                    onClick={() => {
                      setIsMenuOpen(false);
                      onProfileClick();
                    }}
                    className="w-full flex items-center justify-center gap-3 bg-zinc-100 text-zinc-900 px-5 py-3 rounded-xl hover:bg-zinc-200 transition-all font-medium"
                  >
                    {profile?.photoURL ? (
                      <img src={profile.photoURL} alt="Profile" className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <UserIcon size={18} />
                    )}
                    {language === 'en' ? 'Profile' : 'Bayanan Suna'}
                  </button>
                  <button 
                    onClick={() => {
                      setIsMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 px-5 py-3 rounded-xl hover:bg-red-100 transition-all font-medium"
                  >
                    <LogOut size={18} />
                    {language === 'en' ? 'Logout' : 'Fita'}
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    setIsMenuOpen(false);
                    onLoginClick();
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl hover:bg-emerald-700 transition-all font-medium mt-4"
                >
                  <LogIn size={18} />
                  {language === 'en' ? 'Student Login' : 'Shiga Dalibai'}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = ({ language, onLoginClick }: { language: 'en' | 'ha', onLoginClick: () => void }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { user } = useAuth();
  const slides = [
    {
      title: language === 'en' ? "Empowering Minds Through Knowledge" : "Ba da Iko ga Hankali Ta Hanyar Ilimi",
      subtitle: language === 'en' 
        ? "Join Abba Online Academy and master new skills in Hausa and English."
        : "Kasance tare da Abba Online Academy don kwarewa a sabbin fasahohi da Hausa da Turanci.",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1920",
      cta: language === 'en' ? "Explore Programs" : "Bincika Shirye-shirye"
    },
    {
      title: language === 'en' ? "Learn at Your Own Pace" : "Koyi a Kan Lokacinka",
      subtitle: language === 'en'
        ? "Flexible schedules designed for students and working professionals."
        : "Tsare-tsare masu sauki da aka tsara don dalibai da ma'aikata.",
      image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=1920",
      cta: language === 'en' ? "Get Started" : "Fara Yanzu"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-[600px] md:h-[700px] overflow-hidden bg-zinc-900">
      {slides.map((slide, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: currentSlide === index ? 1 : 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-black/50 z-10" />
          <img 
            src={slide.image} 
            alt={slide.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 z-20 flex items-center justify-center px-4">
            <div className="max-w-4xl text-center">
              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: currentSlide === index ? 0 : 20, opacity: currentSlide === index ? 1 : 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-7xl font-bold text-white mb-6 tracking-tight"
              >
                {slide.title}
              </motion.h1>
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: currentSlide === index ? 0 : 20, opacity: currentSlide === index ? 1 : 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg md:text-2xl text-zinc-200 mb-10 max-w-2xl mx-auto font-light"
              >
                {slide.subtitle}
              </motion.p>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: currentSlide === index ? 0 : 20, opacity: currentSlide === index ? 1 : 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <a 
                  href="#programs"
                  className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-emerald-700 transition-all hover:scale-105"
                >
                  {slide.cta}
                  <ChevronRight size={20} />
                </a>
                {!user && (
                  <button 
                    onClick={onLoginClick}
                    className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/20 transition-all hover:scale-105"
                  >
                    <LogIn size={20} />
                    {language === 'en' ? 'Student Login' : 'Shiga Dalibai'}
                  </button>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      ))}
      
      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              currentSlide === index ? 'bg-emerald-600 w-8' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

const LectureClock = ({ language }: { language: 'en' | 'ha' }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="bg-emerald-600 p-3 rounded-xl text-white">
          <Clock size={24} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-emerald-900 uppercase tracking-wider">
            {language === 'en' ? 'Current Lecture Time' : 'Lokacin Karatun Yanzu'}
          </h3>
          <p className="text-3xl font-mono font-bold text-emerald-700">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>
      </div>
      <div className="hidden sm:block text-right">
        <p className="text-sm text-emerald-600 font-medium">
          {language === 'en' ? 'Live Session Active' : 'Ana Cikin Karatu'}
        </p>
        <div className="flex items-center justify-end gap-1.5 mt-1">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs text-emerald-500 font-bold uppercase">
            {language === 'en' ? 'Recording' : 'Ana Nadawa'}
          </span>
        </div>
      </div>
    </div>
  );
};

const CourseCard: React.FC<{ 
  course: Course, 
  language: 'en' | 'ha',
  isEnrolled: boolean,
  onEnroll: (id: string) => void,
  onUnenroll: (id: string) => void,
  isAdmin: boolean,
  onEdit: (course: Course) => void,
  onDelete: (id: string) => void,
  onManageLessons: (course: Course) => void,
  progress?: Progress,
  lessonCount: number,
  onViewLessons: () => void,
  onDownloadCertificate: (course: Course) => void
}> = ({ 
  course, 
  language, 
  isEnrolled, 
  onEnroll, 
  onUnenroll,
  isAdmin,
  onEdit,
  onDelete,
  onManageLessons,
  progress,
  lessonCount,
  onViewLessons,
  onDownloadCertificate
}) => {
  const completedCount = progress?.completedLessons.length || 0;
  const progressPercentage = lessonCount > 0 ? Math.round((completedCount / lessonCount) * 100) : 0;
  const isCompleted = progressPercentage === 100 && lessonCount > 0;

  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm hover:shadow-xl transition-all relative group flex flex-col h-full"
    >
      {isAdmin && (
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-30">
          <button 
            onClick={() => onManageLessons(course)}
            className="p-2 bg-white/90 backdrop-blur shadow-sm rounded-full text-zinc-600 hover:text-blue-600 transition-colors"
            title={language === 'en' ? 'Manage Lessons' : 'Sarrafa Darussa'}
          >
            <BookOpen size={16} />
          </button>
          <button 
            onClick={() => onEdit(course)}
            className="p-2 bg-white/90 backdrop-blur shadow-sm rounded-full text-zinc-600 hover:text-emerald-600 transition-colors"
          >
            <Edit size={16} />
          </button>
          <button 
            onClick={() => onDelete(course.id)}
            className="p-2 bg-white/90 backdrop-blur shadow-sm rounded-full text-zinc-600 hover:text-red-600 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
      
      <div className="mb-6">
        <img 
          src={course.image} 
          alt={course.title} 
          className="w-full h-48 object-cover rounded-2xl mb-4"
          referrerPolicy="no-referrer"
        />
        <div className="flex items-center gap-2 text-emerald-600 mb-2">
          <BookOpen size={18} />
          <span className="text-xs font-bold uppercase tracking-wider">{course.department || 'General'} • {course.category}</span>
        </div>
      </div>
      <h4 className="text-2xl font-bold text-zinc-900 mb-4">
        {language === 'en' ? course.title : course.titleHa}
      </h4>
      <p className="text-zinc-600 mb-6 leading-relaxed line-clamp-3 flex-1">
        {language === 'en' ? course.description : course.descriptionHa}
      </p>

      {isEnrolled && lessonCount > 0 && (
        <div className="mb-6 space-y-2">
          <div className="flex justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider">
            <span>{language === 'en' ? 'Progress' : 'Ci gaba'}</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              className="bg-emerald-500 h-full rounded-full"
            />
          </div>
          {isCompleted && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => onDownloadCertificate(course)}
              className="w-full mt-2 bg-yellow-50 text-yellow-700 border border-yellow-200 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-yellow-100 transition-colors"
            >
              <Award size={14} />
              {language === 'en' ? 'Get Certificate' : 'Karbi Takardar Shaida'}
            </motion.button>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-6 border-t border-zinc-100 mt-auto">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-zinc-400 uppercase tracking-wider">{course.duration}</span>
          <div className="flex flex-col gap-1 mt-1">
            <span className="text-xs text-zinc-400 flex items-center gap-1">
              <Users size={12} /> {course.students} {language === 'en' ? 'Students' : 'Dalibai'}
            </span>
            <span className="text-sm font-black text-emerald-600">
              ₦{course.price.toLocaleString()}
            </span>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          {isEnrolled ? (
            <>
              <button 
                onClick={onViewLessons}
                className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all flex items-center gap-2"
              >
                <Play size={14} />
                {language === 'en' ? 'Learn' : 'Koya'}
              </button>
              <button 
                onClick={() => onUnenroll(course.id)}
                className="text-zinc-400 text-xs hover:text-red-500 transition-colors"
              >
                {language === 'en' ? 'Unenroll' : 'Cire Rajista'}
              </button>
            </>
          ) : (
            <button 
              onClick={() => onEnroll(course.id)}
              className="text-emerald-600 font-bold hover:underline inline-flex items-center gap-1"
            >
              {language === 'en' ? 'Enroll Now' : 'Yi Rajista'} <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const Programs = ({ 
  language, 
  courses, 
  enrollments, 
  onEnroll, 
  onUnenroll,
  onAddCourse,
  onUpdateCourse,
  onDeleteCourse,
  onManageLessons,
  isAdmin,
  lessons,
  courseProgress,
  onViewLessons,
  onDownloadCertificate
}: { 
  language: 'en' | 'ha', 
  courses: Course[],
  enrollments: string[],
  onEnroll: (id: string) => void,
  onUnenroll: (id: string) => void,
  onAddCourse: (data: Omit<Course, 'id'>) => void,
  onUpdateCourse: (id: string, data: Partial<Course>) => void,
  onDeleteCourse: (id: string) => void,
  onManageLessons: (course: Course) => void,
  isAdmin: boolean,
  lessons: Record<string, Lesson[]>,
  courseProgress: Record<string, Progress>,
  onViewLessons: (courseId: string) => void,
  onDownloadCertificate: (course: Course) => void
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedCourseLanguage, setSelectedCourseLanguage] = useState<string>('all');
  const [formData, setFormData] = useState<Omit<Course, 'id'>>({
    title: '',
    titleHa: '',
    description: '',
    descriptionHa: '',
    duration: '',
    students: 0,
    category: '',
    department: '',
    image: '',
    language: 'both',
    price: 0
  });

  const categories = ['all', ...Array.from(new Set(courses.map(c => c.category)))];
  const departments = ['all', ...Array.from(new Set(courses.map(c => c.department || 'General')))];

  const filteredCourses = courses.filter(course => {
    const categoryMatch = selectedCategory === 'all' || course.category === selectedCategory;
    const departmentMatch = selectedDepartment === 'all' || (course.department || 'General') === selectedDepartment;
    const languageMatch = selectedCourseLanguage === 'all' || 
                         course.language === 'both' || 
                         course.language === selectedCourseLanguage;
    return categoryMatch && departmentMatch && languageMatch;
  });

  const handleOpenModal = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
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
    } else {
      setEditingCourse(null);
      setFormData({
        title: '',
        titleHa: '',
        description: '',
        descriptionHa: '',
        duration: '',
        students: 0,
        category: '',
        department: '',
        image: 'https://picsum.photos/seed/' + Math.random() + '/800/600',
        language: 'both',
        price: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCourse) {
      onUpdateCourse(editingCourse.id, formData);
    } else {
      onAddCourse(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <section id="programs" className="py-24 bg-zinc-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="text-left max-w-2xl">
            <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-[0.2em] mb-4">
              {language === 'en' ? 'Our Programs' : 'Shirye-shiryenmu'}
            </h2>
            <h3 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-6">
              {language === 'en' ? 'Choose Your Path to Success' : 'Zabi Hanyar Nasararka'}
            </h3>
            <p className="text-zinc-600 text-lg">
              {language === 'en' 
                ? 'We offer specialized courses in both English and Hausa to ensure everyone has access to quality education.'
                : 'Muna ba da kwasa-kwasai na musamman da Turanci da Hausa don tabbatar da kowa ya sami ingantaccen ilimi.'}
            </p>
          </div>
        </div>
          
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-zinc-500 uppercase tracking-wider">
                {language === 'en' ? 'Department:' : 'Sashen:'}
              </span>
              <select 
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm font-bold text-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept === 'all' ? (language === 'en' ? 'All Departments' : 'Duk Sassan') : dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-zinc-500 uppercase tracking-wider">
                {language === 'en' ? 'Category:' : 'Rukuni:'}
              </span>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm font-bold text-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? (language === 'en' ? 'All Categories' : 'Duk Rukunoni') : cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-zinc-500 uppercase tracking-wider">
                {language === 'en' ? 'Language:' : 'Harshe:'}
              </span>
              <div className="flex bg-zinc-50 p-1 rounded-xl border border-zinc-200">
                {[
                  { id: 'all', label: language === 'en' ? 'All' : 'Duka' },
                  { id: 'en', label: 'English' },
                  { id: 'ha', label: 'Hausa' }
                ].map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setSelectedCourseLanguage(lang.id)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedCourseLanguage === lang.id 
                        ? 'bg-emerald-600 text-white shadow-md' 
                        : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {isAdmin && (
            <button 
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
            >
              <Plus size={20} />
              {language === 'en' ? 'Add Course' : 'Kara Kwas'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <CourseCard 
              key={course.id} 
              course={course} 
              language={language} 
              isEnrolled={enrollments.includes(course.id)}
              onEnroll={onEnroll}
              onUnenroll={onUnenroll}
              isAdmin={isAdmin}
              onEdit={(c) => handleOpenModal(c)}
              onDelete={onDeleteCourse}
              onManageLessons={onManageLessons}
              progress={courseProgress[course.id]}
              lessonCount={lessons[course.id]?.length || 0}
              onViewLessons={() => onViewLessons(course.id)}
              onDownloadCertificate={onDownloadCertificate}
            />
          ))}
        </div>
        {filteredCourses.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-300 shadow-sm border border-zinc-100">
              <BookOpen size={40} />
            </div>
            <p className="text-zinc-500 font-medium">
              {language === 'en' ? 'No courses found matching your filters.' : 'Ba a sami darussan da suka dace da abin da kake nema ba.'}
            </p>
            <button 
              onClick={() => {
                setSelectedCategory('all');
                setSelectedCourseLanguage('all');
              }}
              className="mt-4 text-emerald-600 font-bold hover:underline"
            >
              {language === 'en' ? 'Clear all filters' : 'Share dukkan matatun'}
            </button>
          </div>
        )}
      </div>

      {/* Admin Course Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
              >
                <X size={24} />
              </button>

              <h2 className="text-3xl font-bold text-zinc-900 mb-8">
                {editingCourse ? (language === 'en' ? 'Edit Course' : 'Gyara Kwas') : (language === 'en' ? 'Add New Course' : 'Kara Sabon Kwas')}
              </h2>

              {!editingCourse && (
                <div className="mb-8 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">Quick Templates</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { title: 'National Diploma Public Health Science', dept: 'Health Science & Technology', cat: 'Health' },
                      { title: 'National Diploma Pharmacy', dept: 'Health Science & Technology', cat: 'Pharmacy' },
                      { title: 'National Diploma Medical Laboratory Technology', dept: 'Health Science & Technology', cat: 'Lab Tech' },
                      { title: 'National Diploma Health Information Management', dept: 'Health Science & Technology', cat: 'Health Info' },
                      { title: 'National Diploma Community Health', dept: 'Health Science & Technology', cat: 'Community Health' }
                    ].map((template, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          title: template.title,
                          department: template.dept,
                          category: template.cat,
                          duration: '2 Years',
                          price: 25000
                        })}
                        className="text-[10px] font-bold bg-white border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-full hover:bg-emerald-600 hover:text-white transition-all"
                      >
                        + {template.title.replace('National Diploma ', '')}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider mb-2">Title (EN)</label>
                    <input 
                      type="text" 
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-5 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider mb-2">Title (HA)</label>
                    <input 
                      type="text" 
                      required
                      value={formData.titleHa}
                      onChange={(e) => setFormData({...formData, titleHa: e.target.value})}
                      className="w-full px-5 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider mb-2">Description (EN)</label>
                    <textarea 
                      required
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-5 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider mb-2">Description (HA)</label>
                    <textarea 
                      required
                      rows={3}
                      value={formData.descriptionHa}
                      onChange={(e) => setFormData({...formData, descriptionHa: e.target.value})}
                      className="w-full px-5 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider mb-2">Department</label>
                    <input 
                      type="text" 
                      required
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      className="w-full px-5 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider mb-2">Category</label>
                    <input 
                      type="text" 
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-5 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider mb-2">Language</label>
                    <select 
                      value={formData.language}
                      onChange={(e) => setFormData({...formData, language: e.target.value as any})}
                      className="w-full px-5 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="both">Bilingual (EN & HA)</option>
                      <option value="en">English Only</option>
                      <option value="ha">Hausa Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider mb-2">Duration</label>
                    <input 
                      type="text" 
                      required
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                      className="w-full px-5 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider mb-2">Image URL</label>
                    <input 
                      type="url" 
                      required
                      value={formData.image}
                      onChange={(e) => setFormData({...formData, image: e.target.value})}
                      className="w-full px-5 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider mb-2">Price (₦)</label>
                    <input 
                      type="number" 
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                      className="w-full px-5 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider mb-2">Initial Students</label>
                    <input 
                      type="number" 
                      required
                      value={formData.students}
                      onChange={(e) => setFormData({...formData, students: Number(e.target.value)})}
                      className="w-full px-5 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  <Save size={20} />
                  {editingCourse ? (language === 'en' ? 'Save Changes' : 'Ajiye Canje-canje') : (language === 'en' ? 'Create Course' : 'Kirkiri Kwas')}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* How to Enroll Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 bg-white rounded-[3rem] p-12 shadow-xl border border-zinc-100"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-zinc-900 mb-4">
              {language === 'en' ? 'How to Enroll' : 'Yadda Ake Yin Rajista'}
            </h3>
            <p className="text-zinc-500 max-w-2xl mx-auto">
              {language === 'en' 
                ? 'Follow these simple steps to start your learning journey with us.' 
                : 'Bi wadannan matakai masu sauki don fara tafiyar koyonku tare da mu.'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: language === 'en' ? "Register Account" : "Yi Rajista",
                desc: language === 'en' ? "Create a free student account to get started." : "Kirkiri asusun dalibi kyauta don farawa.",
                icon: <UserPlus className="text-emerald-600" size={24} />
              },
              {
                step: "02",
                title: language === 'en' ? "Select Course" : "Zabi Darasi",
                desc: language === 'en' ? "Browse our programs and choose your preferred course." : "Bincika shirye-shiryenmu kuma ka zabi darasin da kake so.",
                icon: <BookOpen className="text-emerald-600" size={24} />
              },
              {
                step: "03",
                title: language === 'en' ? "Make Payment" : "Biya Kudi",
                desc: language === 'en' ? "Pay to our UBA account: 2144451100 (Yusuf Ahmadu)." : "Biya zuwa asusunmu na UBA: 2144451100 (Yusuf Ahmadu).",
                icon: <CreditCard className="text-emerald-600" size={24} />
              },
              {
                step: "04",
                title: language === 'en' ? "Start Learning" : "Fara Koyo",
                desc: language === 'en' ? "Get instant access to your course materials." : "Samu damar shiga darussan ku nan take.",
                icon: <Play className="text-emerald-600" size={24} />
              }
            ].map((item, i) => (
              <div key={i} className="relative flex flex-col items-center text-center p-6 rounded-3xl hover:bg-zinc-50 transition-colors group">
                <div className="absolute -top-4 -left-4 text-4xl font-black text-zinc-100 group-hover:text-emerald-50 transition-colors z-0">
                  {item.step}
                </div>
                <div className="bg-emerald-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 relative z-10 shadow-sm">
                  {item.icon}
                </div>
                <h4 className="text-xl font-bold text-zinc-900 mb-3 relative z-10">{item.title}</h4>
                <p className="text-zinc-500 text-sm relative z-10">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const OurCause = ({ language }: { language: 'en' | 'ha' }) => {
  const content = {
    en: {
      title: "Our Cause",
      subtitle: "Empowering the next generation of leaders through accessible education.",
      description: "Abba Online Academy is dedicated to providing high-quality, bilingual education to students across Northern Nigeria and beyond. Our mission is to bridge the gap between education and opportunity, ensuring that every student has the tools they need to succeed in the digital age.",
      points: [
        {
          title: "Accessible Learning",
          desc: "Education that fits your schedule and location.",
          icon: <Globe className="text-emerald-600" size={24} />
        },
        {
          title: "Bilingual Excellence",
          desc: "Courses taught in both English and Hausa for better understanding.",
          icon: <Target className="text-emerald-600" size={24} />
        },
        {
          title: "Community Driven",
          desc: "Building a network of lifelong learners and professionals.",
          icon: <Users className="text-emerald-600" size={24} />
        }
      ]
    },
    ha: {
      title: "Burinmu",
      subtitle: "Karfafa matasa masu tasowa ta hanyan samar da ilimi mai sauki.",
      description: "Abba Online Academy an sadaukar da ita ne don samar da ingantaccen ilimi cikin harsuna biyu ga dalibai a fadin Arewacin Najeriya da ma bayanta. Burinmu shi ne rage tazarar da ke tsakanin ilimi da dama, tare da tabbatar da cewa kowane dalibi yana da kayan aikin da yake bukata don yin nasara a wannan zamanin na dijital.",
      points: [
        {
          title: "Koyo Mai Sauki",
          desc: "Ilimi wanda ya dace da lokacinku da inda kuke.",
          icon: <Globe className="text-emerald-600" size={24} />
        },
        {
          title: "Kwarewa a Harsuna Biyu",
          desc: "Darussan da ake koyarwa da Turanci da Hausa don kyakkyawar fahimta.",
          icon: <Target className="text-emerald-600" size={24} />
        },
        {
          title: "Ginin Al'umma",
          desc: "Gina hanyar sadarwa ta dalibai da kwararru masu koyo har abada.",
          icon: <Users className="text-emerald-600" size={24} />
        }
      ]
    }
  }[language];

  return (
    <section id="about" className="py-24 bg-zinc-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold mb-6">
              <Heart size={16} />
              {content.title}
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-8 tracking-tight leading-tight">
              {content.subtitle}
            </h2>
            <p className="text-zinc-600 text-lg mb-10 leading-relaxed">
              {content.description}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {content.points.map((point, i) => (
                <div key={i} className="flex flex-col gap-3 p-6 bg-white rounded-2xl border border-zinc-100 shadow-sm">
                  <div className="bg-emerald-50 w-12 h-12 rounded-xl flex items-center justify-center">
                    {point.icon}
                  </div>
                  <h4 className="font-bold text-zinc-900">{point.title}</h4>
                  <p className="text-zinc-500 text-sm">{point.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl relative z-10">
              <img 
                src="https://picsum.photos/seed/academy/800/800" 
                alt="Our Cause" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 to-transparent" />
            </div>
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-emerald-200 rounded-full blur-3xl opacity-50" />
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-emerald-300 rounded-full blur-3xl opacity-50" />
            
            <div className="absolute -bottom-6 -right-6 bg-white p-8 rounded-3xl shadow-xl z-20 max-w-xs border border-zinc-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-emerald-600 p-3 rounded-xl text-white">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-zinc-900">500+</p>
                  <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">
                    {language === 'en' ? 'Expert Mentors' : 'Kwararrun Malamai'}
                  </p>
                </div>
              </div>
              <p className="text-zinc-600 text-sm">
                {language === 'en' 
                  ? 'Our mentors are dedicated to your success and growth.' 
                  : 'Malamanmu sun sadaukar da kansu don nasararku da ci gabanku.'}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const JoinUs = ({ language, onRegisterClick, onLoginClick }: { language: 'en' | 'ha', onRegisterClick: () => void, onLoginClick: () => void }) => {
  const { user } = useAuth();
  if (user) return null;
  return (
    <section className="py-24 bg-emerald-600 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">
            {language === 'en' ? 'Ready to Start Your Journey?' : 'Shirya don Fara Tafiyarku?'}
          </h2>
          <p className="text-emerald-50 text-xl mb-12 leading-relaxed">
            {language === 'en' 
              ? 'Join thousands of students who are already mastering new skills. Registration is quick, easy, and free.'
              : 'Kasance tare da dubban dalibai wadanda suka riga sun kware a sabbin fasahohi. Rajista yana da sauri, sauki, kuma kyauta.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button 
              onClick={onRegisterClick}
              className="inline-flex items-center gap-3 bg-white text-emerald-600 px-10 py-5 rounded-full text-xl font-bold hover:bg-emerald-50 transition-all hover:scale-105 shadow-xl shadow-emerald-900/20 w-full sm:w-auto"
            >
              <UserPlus size={24} />
              {language === 'en' ? 'Register Now' : 'Yi Rajista Yanzu'}
            </button>
            <button 
              onClick={onLoginClick}
              className="inline-flex items-center gap-3 bg-emerald-700 text-white border border-emerald-500/30 px-10 py-5 rounded-full text-xl font-bold hover:bg-emerald-800 transition-all hover:scale-105 shadow-xl shadow-emerald-900/20 w-full sm:w-auto"
            >
              <LogIn size={24} />
              {language === 'en' ? 'Student Login' : 'Shiga Dalibai'}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const VerifyCertificateModal = ({ isOpen, onClose, language }: { isOpen: boolean, onClose: () => void, language: 'en' | 'ha' }) => {
  const [certId, setCertId] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'found' | 'not-found'>('idle');
  const [result, setResult] = useState<any>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certId.trim()) return;

    setStatus('loading');
    // Simulate verification logic
    setTimeout(() => {
      if (certId.toUpperCase().startsWith('ABBA-')) {
        setStatus('found');
        setResult({
          studentName: "Abba Yusuf",
          courseTitle: certId.includes('SAMPLE') ? "Full Stack Web Development" : "Professional Certification",
          date: "March 19, 2026",
          status: "Verified"
        });
      } else {
        setStatus('not-found');
      }
    }, 1500);
  };

  if (!isOpen) return null;

  const t = {
    en: {
      title: "Verify Certificate",
      desc: "Enter the unique verification ID found on the certificate to verify its authenticity.",
      placeholder: "e.g. ABBA-XXXX-XXXX",
      verify: "Verify Now",
      verifying: "Verifying...",
      found: "Certificate Verified",
      notFound: "Certificate Not Found",
      invalid: "The verification ID provided does not match our records.",
      student: "Student Name",
      course: "Course Title",
      date: "Issue Date",
      close: "Close"
    },
    ha: {
      title: "Tabbatar da Takardar Shaida",
      desc: "Shigar da lambar tabbatarwa ta musamman da aka samu akan takardar shaida don tabbatar da sahihancinta.",
      placeholder: "misali ABBA-XXXX-XXXX",
      verify: "Tabbatar Yanzu",
      verifying: "Ana Tabbatarwa...",
      found: "An Tabbatar da Takardar Shaida",
      notFound: "Ba a Sami Takardar Shaida Ba",
      invalid: "Lambar tabbatarwa da aka bayar ba ta dace da bayananmu ba.",
      student: "Sunan Dalibi",
      course: "Sunan Kwas",
      date: "Ranar Bayarwa",
      close: "Rufe"
    }
  }[language];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        <div className="p-8 border-b border-zinc-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-bold text-zinc-900">{t.title}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          {status === 'idle' || status === 'loading' ? (
            <form onSubmit={handleVerify} className="space-y-6">
              <p className="text-zinc-500 text-sm leading-relaxed">{t.desc}</p>
              <div className="space-y-2">
                <input 
                  type="text" 
                  value={certId}
                  onChange={(e) => setCertId(e.target.value)}
                  placeholder={t.placeholder}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono uppercase"
                  disabled={status === 'loading'}
                />
              </div>
              <button 
                type="submit"
                disabled={status === 'loading' || !certId.trim()}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {status === 'loading' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t.verifying}
                  </>
                ) : (
                  <>
                    <Search size={20} />
                    {t.verify}
                  </>
                )}
              </button>
            </form>
          ) : status === 'found' ? (
            <div className="space-y-8">
              <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl text-center">
                <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Check size={32} />
                </div>
                <h4 className="text-emerald-900 font-bold text-xl mb-1">{t.found}</h4>
                <p className="text-emerald-700 text-sm font-medium">{certId.toUpperCase()}</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-zinc-50">
                  <span className="text-zinc-400 text-sm">{t.student}</span>
                  <span className="text-zinc-900 font-bold">{result.studentName}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-zinc-50">
                  <span className="text-zinc-400 text-sm">{t.course}</span>
                  <span className="text-zinc-900 font-bold">{result.courseTitle}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-zinc-400 text-sm">{t.date}</span>
                  <span className="text-zinc-900 font-bold">{result.date}</span>
                </div>
              </div>

              <button 
                onClick={() => setStatus('idle')}
                className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-bold hover:bg-zinc-800 transition-all"
              >
                {t.close}
              </button>
            </div>
          ) : (
            <div className="space-y-8 text-center">
              <div className="bg-red-50 border border-red-100 p-6 rounded-3xl">
                <div className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <X size={32} />
                </div>
                <h4 className="text-red-900 font-bold text-xl mb-1">{t.notFound}</h4>
                <p className="text-red-700 text-sm">{t.invalid}</p>
              </div>
              <button 
                onClick={() => setStatus('idle')}
                className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-bold hover:bg-zinc-800 transition-all"
              >
                {t.close}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const Footer = ({ language, onLoginClick, onVerifyClick }: { language: 'en' | 'ha', onLoginClick: () => void, onVerifyClick: () => void }) => {
  const { user, profile } = useAuth();
  return (
    <footer className="bg-zinc-900 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-emerald-600 p-2 rounded-lg">
                <GraduationCap className="text-white" size={24} />
              </div>
              <span className="text-xl font-bold tracking-tight">
                Abba <span className="text-emerald-600">Academy</span>
              </span>
            </div>
            <p className="text-zinc-400 leading-relaxed">
              {language === 'en' 
                ? 'Providing world-class education accessible to everyone, everywhere. Bridging the gap between knowledge and opportunity.'
                : 'Samar da ilimi mai daraja ta duniya ga kowa, a ko\'ina. Rage tazarar da ke tsakanin ilimi da dama.'}
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-6">{language === 'en' ? 'Quick Links' : 'Hanyoyi Masu Sauri'}</h4>
            <ul className="space-y-4 text-zinc-400">
              <li><a href="#" className="hover:text-emerald-500 transition-colors">{language === 'en' ? 'Home' : 'Gida'}</a></li>
              <li><a href="#about" className="hover:text-emerald-500 transition-colors">{language === 'en' ? 'About Us' : 'Game da Mu'}</a></li>
              <li><a href="#programs" className="hover:text-emerald-500 transition-colors">{language === 'en' ? 'Our Programs' : 'Shirye-shiryenmu'}</a></li>
              <li>
                <button 
                  onClick={onVerifyClick}
                  className="hover:text-emerald-500 transition-colors text-left flex items-center gap-2"
                >
                  <ShieldCheck size={16} />
                  {language === 'en' ? 'Verify Certificate' : 'Tabbatar da Takarda'}
                </button>
              </li>
              <li>
                <button 
                  onClick={onLoginClick}
                  className="hover:text-emerald-500 transition-colors text-left"
                >
                  {language === 'en' ? 'Student Portal' : 'Dandalin Dalibai'}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">{language === 'en' ? 'Contact Us' : 'Tuntube Mu'}</h4>
            <ul className="space-y-4 text-zinc-400">
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-emerald-500" />
                info@abbaacademy.com
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-emerald-500" />
                +234 800 123 4567
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">{language === 'en' ? 'Follow Us' : 'Bi Mu'}</h4>
            <div className="flex gap-4">
              {[Facebook, Twitter, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="bg-zinc-800 p-3 rounded-xl hover:bg-emerald-600 transition-all">
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-zinc-800 text-center text-zinc-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Abba Online Academy. {language === 'en' ? 'All rights reserved.' : 'Duk hakki ya tabbata.'}</p>
        </div>
      </div>
    </footer>
  );
};

const LoginModal = ({ isOpen, onClose, language, initialIsSignup = false }: { isOpen: boolean, onClose: () => void, language: 'en' | 'ha', initialIsSignup?: boolean }) => {
  const { login, loginWithEmail, signupWithEmail } = useAuth();
  const [isSignup, setIsSignup] = useState(initialIsSignup);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('male');
  const [dob, setDob] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsSignup(initialIsSignup);
      setError('');
    }
  }, [isOpen, initialIsSignup]);

  const validateForm = () => {
    if (isSignup) {
      if (name.trim().length < 3) {
        setError(language === 'en' ? 'Name must be at least 3 characters' : 'Suna dole ya kasance akalla haruffa 3');
        return false;
      }
      if (!/^\d{10,15}$/.test(phoneNumber.replace(/\D/g, ''))) {
        setError(language === 'en' ? 'Please enter a valid phone number' : 'Da fatan za a shigar da lambar waya mai inganci');
        return false;
      }
      if (!dob) {
        setError(language === 'en' ? 'Please enter your date of birth' : 'Da fatan za a shigar da ranar haihuwa');
        return false;
      }
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError(language === 'en' ? 'Please enter a valid email address' : 'Da fatan za a shigar da adireshin imel mai inganci');
      return false;
    }
    if (password.length < 6) {
      setError(language === 'en' ? 'Password must be at least 6 characters' : 'Kalmar sirri dole ta kasance akalla haruffa 6');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;
    setLoading(true);
    try {
      if (isSignup) {
        await signupWithEmail(email, password, name, phoneNumber, gender, dob);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl overflow-hidden"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
            >
              <X size={24} />
            </button>

            <div className="text-center mb-8">
              <div className="inline-flex bg-emerald-100 p-4 rounded-2xl text-emerald-600 mb-4">
                <LogIn size={32} />
              </div>
              <h2 className="text-3xl font-bold text-zinc-900">
                {isSignup ? (language === 'en' ? 'Create Account' : 'Bude Asusun') : (language === 'en' ? 'Student Login' : 'Shiga Dalibai')}
              </h2>
              <p className="text-zinc-500 mt-2">
                {isSignup 
                  ? (language === 'en' ? 'Join the academy today!' : 'Kasance tare da academy yau!')
                  : (language === 'en' ? 'Welcome back! Please enter your details.' : 'Barka da dawowa! Da fatan za a shigar da bayanan ku.')}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <button 
                onClick={login}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white border border-zinc-200 py-4 rounded-2xl font-bold text-zinc-700 hover:bg-zinc-50 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                {language === 'en' ? 'Continue with Google' : 'Ci gaba da Google'}
              </button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-100"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-zinc-400">
                    {language === 'en' ? 'Or use email' : 'Ko amfani da imel'}
                  </span>
                </div>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {isSignup && (
                  <div>
                    <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider mb-2">
                      {language === 'en' ? 'Full Name' : 'Cikakken Suna'}
                    </label>
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      placeholder={language === 'en' ? "Enter your name" : "Shigar da sunanka"}
                    />
                  </div>
                )}
                {isSignup && (
                  <div>
                    <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider mb-2">
                      {language === 'en' ? 'Phone Number' : 'Lambar Waya'}
                    </label>
                    <input 
                      type="tel" 
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      placeholder="07041414937"
                    />
                  </div>
                )}
                {isSignup && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider mb-2">
                        {language === 'en' ? 'Gender' : 'Jinsi'}
                      </label>
                      <select 
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      >
                        <option value="male">{language === 'en' ? 'Male' : 'Namiji'}</option>
                        <option value="female">{language === 'en' ? 'Female' : 'Mace'}</option>
                        <option value="other">{language === 'en' ? 'Other' : 'Sauran'}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider mb-2">
                        {language === 'en' ? 'Date of Birth' : 'Ranar Haihuwa'}
                      </label>
                      <input 
                        type="date" 
                        required
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider mb-2">
                    {language === 'en' ? 'Email Address' : 'Adireshin Imel'}
                  </label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider mb-2">
                    {language === 'en' ? 'Password' : 'Kalmar Sirri'}
                  </label>
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    placeholder="••••••••"
                  />
                </div>
                
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    isSignup ? (language === 'en' ? 'Create Account' : 'Bude Asusun') : (language === 'en' ? 'Sign In' : 'Shiga')
                  )}
                </button>
              </form>
            </div>

            <div className="mt-8 pt-8 border-t border-zinc-100 text-center">
              <p className="text-zinc-500">
                {isSignup 
                  ? (language === 'en' ? "Already have an account?" : "Kana da asusu?")
                  : (language === 'en' ? "Don't have an account?" : "Ba ka da asusu?")
                } 
                <button 
                  onClick={() => setIsSignup(!isSignup)}
                  className="ml-2 text-emerald-600 font-bold hover:underline"
                >
                  {isSignup 
                    ? (language === 'en' ? 'Sign In' : 'Shiga')
                    : (language === 'en' ? 'Apply Now' : 'Nemi Yanzu')
                  }
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// --- Main App ---

export default function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [loginModalInitialMode, setLoginModalInitialMode] = useState(false);
  const [language, setLanguage] = useState<'en' | 'ha'>('en');
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<string[]>([]);
  const [lessons, setLessons] = useState<Record<string, Lesson[]>>({});
  const [courseProgress, setCourseProgress] = useState<Record<string, Progress>>({});
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [isLessonManagerOpen, setIsLessonManagerOpen] = useState(false);
  const [activeCourseForLessons, setActiveCourseForLessons] = useState<Course | null>(null);
  const [activeCertificateCourse, setActiveCertificateCourse] = useState<Course | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedCourseForPayment, setSelectedCourseForPayment] = useState<Course | null>(null);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isStudentDashboardOpen, setIsStudentDashboardOpen] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // --- Auth Logic ---
  const createProfile = async (firebaseUser: FirebaseUser, name?: string, phone?: string, gender?: string, dob?: string) => {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const newProfile: any = {
      uid: firebaseUser.uid,
      displayName: name || firebaseUser.displayName || 'User',
      email: firebaseUser.email || '',
      phoneNumber: phone || '',
      role: 'student',
      createdAt: new Date()
    };
    
    if (gender) newProfile.gender = gender;
    if (dob) newProfile.dateOfBirth = dob;

    await setDoc(userDocRef, newProfile);
    setProfile(newProfile as UserProfile);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        try {
          const userDoc = await getDocFromServer(userDocRef);
          if (userDoc.exists()) {
            setProfile(userDoc.data() as UserProfile);
          } else {
            await createProfile(firebaseUser);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setIsLoginOpen(false);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      setIsLoginOpen(false);
    } catch (error) {
      console.error("Email login failed:", error);
      throw error;
    }
  };

  const signupWithEmail = async (email: string, pass: string, name: string, phoneNumber: string, gender: string, dob: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await createProfile(cred.user, name, phoneNumber, gender, dob);
      setIsLoginOpen(false);
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // --- Data Logic ---
  useEffect(() => {
    if (!user) {
      setEnrollments([]);
      return;
    }

    // Listen to courses
    const coursesQuery = collection(db, 'courses');
    const unsubscribeCourses = onSnapshot(coursesQuery, (snapshot) => {
      const coursesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
      setCourses(coursesData);

      if (coursesData.length === 0 && (profile?.role === 'admin' || user.email === 'abbapepe1999@gmail.com')) {
        seedCourses();
      }

      // Listen to lessons for each course
      coursesData.forEach(course => {
        const lessonsQuery = collection(db, 'courses', course.id, 'lessons');
        onSnapshot(lessonsQuery, (lessonSnapshot) => {
          const lessonsData = lessonSnapshot.docs.map(doc => ({ 
            id: doc.id, 
            courseId: course.id, 
            ...doc.data() 
          } as Lesson));
          setLessons(prev => ({ 
            ...prev, 
            [course.id]: lessonsData.sort((a, b) => a.order - b.order) 
          }));
        });
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'courses');
    });

    // Listen to enrollments
    const enrollmentsQuery = query(collection(db, 'enrollments'), where('userId', '==', user.uid));
    const unsubscribeEnrollments = onSnapshot(enrollmentsQuery, (snapshot) => {
      const enrolledCourseIds = snapshot.docs.map(doc => doc.data().courseId);
      setEnrollments(enrolledCourseIds);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'enrollments');
    });

    // Listen to progress
    const progressQuery = collection(db, 'users', user.uid, 'progress');
    const unsubscribeProgress = onSnapshot(progressQuery, (snapshot) => {
      const progressData: Record<string, Progress> = {};
      snapshot.docs.forEach(doc => {
        progressData[doc.id] = { courseId: doc.id, ...doc.data() } as Progress;
      });
      setCourseProgress(progressData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'progress');
    });

    return () => {
      unsubscribeCourses();
      unsubscribeEnrollments();
      unsubscribeProgress();
    };
  }, [user, profile]);

  const toggleLessonCompletion = async (courseId: string, lessonId: string) => {
    if (!user) return;
    const currentProgress = courseProgress[courseId] || { completedLessons: [] };
    const isCompleted = currentProgress.completedLessons.includes(lessonId);
    
    const newCompletedLessons = isCompleted
      ? currentProgress.completedLessons.filter(id => id !== lessonId)
      : [...currentProgress.completedLessons, lessonId];
      
    try {
      await setDoc(doc(db, 'users', user.uid, 'progress', courseId), {
        userId: user.uid,
        courseId,
        completedLessons: newCompletedLessons,
        lastUpdated: new Date()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/progress/${courseId}`);
    }
  };

  const enrollInCourse = async (courseId: string) => {
    if (!user) {
      setIsLoginOpen(true);
      return;
    }

    const course = courses.find(c => c.id === courseId);
    if (course) {
      if (course.price === 0) {
        // Skip payment for free courses
        setSelectedCourseForPayment(course);
        handlePaymentComplete();
      } else {
        setSelectedCourseForPayment(course);
        setIsPaymentOpen(true);
      }
    }
  };

  const handlePaymentComplete = async () => {
    if (!user || !selectedCourseForPayment) return;
    
    try {
      const courseId = selectedCourseForPayment.id;
      const enrollmentId = `${user.uid}_${courseId}`;
      await setDoc(doc(db, 'enrollments', enrollmentId), {
        userId: user.uid,
        courseId,
        enrolledAt: new Date()
      });
      // Increment student count
      const courseRef = doc(db, 'courses', courseId);
      const courseDoc = await getDocFromServer(courseRef);
      if (courseDoc.exists()) {
        await updateDoc(courseRef, {
          students: (courseDoc.data().students || 0) + 1
        });
      }
      setSelectedCourseForPayment(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `enrollments`);
    }
  };

  const unenrollFromCourse = async (courseId: string) => {
    if (!user) return;
    try {
      const enrollmentId = `${user.uid}_${courseId}`;
      await deleteDoc(doc(db, 'enrollments', enrollmentId));
      // Decrement student count
      const courseRef = doc(db, 'courses', courseId);
      const courseDoc = await getDocFromServer(courseRef);
      if (courseDoc.exists()) {
        await updateDoc(courseRef, {
          students: Math.max(0, (courseDoc.data().students || 0) - 1)
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `enrollments`);
    }
  };

  const addCourse = async (courseData: Omit<Course, 'id'>) => {
    if (profile?.role !== 'admin') return;
    try {
      await addDoc(collection(db, 'courses'), courseData);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'courses');
    }
  };

  const updateCourse = async (courseId: string, courseData: Partial<Course>) => {
    if (profile?.role !== 'admin') return;
    try {
      await updateDoc(doc(db, 'courses', courseId), courseData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `courses/${courseId}`);
    }
  };

  const deleteCourse = async (courseId: string) => {
    if (profile?.role !== 'admin') return;
    try {
      await deleteDoc(doc(db, 'courses', courseId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `courses/${courseId}`);
    }
  };

  const addLesson = async (courseId: string, lessonData: Omit<Lesson, 'id'>) => {
    try {
      const lessonRef = collection(db, 'courses', courseId, 'lessons');
      await addDoc(lessonRef, lessonData);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `courses/${courseId}/lessons`);
    }
  };

  const updateLesson = async (courseId: string, lessonId: string, lessonData: Partial<Lesson>) => {
    try {
      const lessonRef = doc(db, 'courses', courseId, 'lessons', lessonId);
      await updateDoc(lessonRef, lessonData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `courses/${courseId}/lessons/${lessonId}`);
    }
  };

  const deleteLesson = async (courseId: string, lessonId: string) => {
    try {
      const lessonRef = doc(db, 'courses', courseId, 'lessons', lessonId);
      await deleteDoc(lessonRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `courses/${courseId}/lessons/${lessonId}`);
    }
  };

  const seedCourses = async () => {
    const initialCourses = [
      {
        title: "Full-Stack Web Development",
        titleHa: "Cikakken Koyon Yanar Gizo",
        description: "Master modern web technologies from frontend to backend.",
        descriptionHa: "Koyi fasahar yanar gizo na zamani daga farko har karshe.",
        duration: "6 Months",
        students: 1240,
        category: "Development",
        department: "Technology",
        image: "https://picsum.photos/seed/code/800/600",
        price: 15000,
        lessons: [
          { title: "Introduction to HTML", titleHa: "Gabatarwa ga HTML", order: 1, videoUrl: "https://www.youtube.com/watch?v=kUMe1FH4CHE", content: "HTML is the standard markup language for documents designed to be displayed in a web browser." },
          { title: "CSS Basics", titleHa: "Tushen CSS", order: 2, videoUrl: "https://www.youtube.com/watch?v=1PnVor36_40", content: "Cascading Style Sheets is a style sheet language used for describing the presentation of a document written in a markup language." },
          { title: "JavaScript Fundamentals", titleHa: "Tushen JavaScript", order: 3, videoUrl: "https://www.youtube.com/watch?v=W6NZfCO5SIk", content: "JavaScript is a high-level, often just-in-time compiled language that conforms to the ECMAScript specification." }
        ]
      },
      {
        title: "Data Science & AI",
        titleHa: "Kimiyyar Bayanai da AI",
        description: "Learn to analyze data and build intelligent systems.",
        descriptionHa: "Koyi yadda ake nazarin bayanai da gina tsarin fasaha.",
        duration: "4 Months",
        students: 850,
        category: "Data Science",
        department: "Technology",
        image: "https://picsum.photos/seed/data/800/600",
        price: 20000,
        lessons: [
          { title: "Python for Data Science", titleHa: "Python don Kimiyyar Bayanai", order: 1, videoUrl: "https://www.youtube.com/watch?v=rfscVS0vtbw", content: "Python is an interpreted, high-level and general-purpose programming language." },
          { title: "Data Visualization", titleHa: "Nazarin Bayanai", order: 2, videoUrl: "https://www.youtube.com/watch?v=q7Bo_u89zmc", content: "Data visualization is the graphic representation of data." },
          { title: "Machine Learning Basics", titleHa: "Tushen Machine Learning", order: 3, videoUrl: "https://www.youtube.com/watch?v=GwIo3gDZCVQ", content: "Machine learning is the study of computer algorithms that improve automatically through experience." }
        ]
      },
      {
        title: "Mobile App Development",
        titleHa: "Koyon Gina Manhajojin Wayar Hannu",
        description: "Build native and cross-platform mobile applications.",
        descriptionHa: "Gina manhajojin wayar hannu na zamani.",
        duration: "5 Months",
        students: 920,
        category: "Mobile",
        department: "Technology",
        image: "https://picsum.photos/seed/mobile/800/600",
        price: 18000,
        lessons: [
          { title: "React Native Introduction", titleHa: "Gabatarwa ga React Native", order: 1, videoUrl: "https://www.youtube.com/watch?v=0-S5a0eXPoc", content: "React Native is an open-source UI software framework created by Meta Platforms, Inc." },
          { title: "State Management", titleHa: "Gudanar da Jiha", order: 2, videoUrl: "https://www.youtube.com/watch?v=5yEG6GhoJBs", content: "State management refers to the management of the state of one or more user interface controls." },
          { title: "Publishing to App Store", titleHa: "Wallafa a App Store", order: 3, videoUrl: "https://www.youtube.com/watch?v=mJ3bGvy0WAY", content: "The App Store is a digital distribution platform, developed and maintained by Apple Inc." }
        ]
      },
      {
        title: "Health Science & Technology",
        titleHa: "Kimiyyar Lafiya da Fasaha",
        description: "Explore the intersection of healthcare and modern technology.",
        descriptionHa: "Bincika haduwar kiwon lafiya da fasahar zamani.",
        duration: "4 Months",
        students: 450,
        category: "Health Tech",
        department: "Health Science & Technology",
        image: "https://picsum.photos/seed/health/800/600",
        price: 12000,
        lessons: [
          { title: "Introduction to Health Informatics", titleHa: "Gabatarwa ga Health Informatics", order: 1, videoUrl: "https://www.youtube.com/watch?v=5W6v_K_S_Qo", content: "Health informatics is the interdisciplinary study of the design, development, adoption and application of IT-based innovations in healthcare services delivery, management and planning." },
          { title: "Digital Health Records", titleHa: "Rikodin Lafiya na Dijital", order: 2, videoUrl: "https://www.youtube.com/watch?v=7_W6_K_S_Qo", content: "An electronic health record is the systematized collection of patient and population electronically stored health information in a digital format." },
          { title: "Telemedicine Fundamentals", titleHa: "Tushen Telemedicine", order: 3, videoUrl: "https://www.youtube.com/watch?v=8_W6_K_S_Qo", content: "Telemedicine is the distribution of health-related services and information via electronic information and telecommunication technologies." }
        ]
      }
    ];

    for (const courseData of initialCourses) {
      try {
        const { lessons: courseLessons, ...courseInfo } = courseData;
        const courseRef = await addDoc(collection(db, 'courses'), courseInfo);
        
        for (const lesson of courseLessons) {
          await addDoc(collection(db, 'courses', courseRef.id, 'lessons'), lesson);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, 'courses');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <AuthContext.Provider value={{ user, profile, loading, login, loginWithEmail, signupWithEmail, logout }}>
        <div className="min-h-screen bg-white font-sans selection:bg-emerald-100 selection:text-emerald-900">
          <Navbar 
            onLoginClick={() => {
              setLoginModalInitialMode(false);
              setIsLoginOpen(true);
            }} 
            onProfileClick={() => setIsProfileOpen(true)}
            language={language}
            setLanguage={setLanguage}
          />
          
          <main className="pt-16">
            <Hero 
              language={language} 
              onLoginClick={() => {
                setLoginModalInitialMode(false);
                setIsLoginOpen(true);
              }}
            />
            
            {/* Quick Stats / Clock Section */}
            <section className="py-12 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                  <div className="lg:col-span-2">
                    <LectureClock language={language} />
                  </div>
                  <div className="bg-zinc-900 rounded-2xl p-6 text-white flex items-center justify-between">
                    <div>
                      <p className="text-zinc-400 text-sm font-medium uppercase tracking-wider">
                        {language === 'en' ? 'Active Students' : 'Dalibai Masu Karatu'}
                      </p>
                      <p className="text-3xl font-bold mt-1">12,450+</p>
                    </div>
                    <div className="bg-white/10 p-3 rounded-xl">
                      <GraduationCap size={24} />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Our Certificates Section */}
            <section id="certificates" className="py-24 bg-zinc-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
              
              <div className="max-w-7xl mx-auto px-6 relative">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  <div className="order-2 lg:order-1">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="relative"
                    >
                      <div className="absolute -inset-4 bg-emerald-600/5 rounded-[3rem] blur-2xl" />
                      <div className="relative bg-white p-4 rounded-[2.5rem] shadow-2xl border border-zinc-100 transform -rotate-2 hover:rotate-0 transition-transform duration-700 group">
                        <div className="aspect-[1.414/1] bg-zinc-50 rounded-2xl overflow-hidden relative">
                          <img 
                            src="https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&q=80&w=1000" 
                            alt="Certificate Sample" 
                            className="w-full h-full object-cover opacity-20"
                          />
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                            <div className="w-16 h-16 bg-emerald-900 rounded-full flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                              <Award className="text-yellow-400 w-8 h-8" />
                            </div>
                            <h4 className="text-emerald-900 font-black tracking-widest uppercase text-[8px] mb-2">Abba Online Academy</h4>
                            <h3 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter mb-4">Certificate of Completion</h3>
                            <div className="w-32 h-px bg-emerald-900/20 mb-6" />
                            <div className="space-y-2">
                              <p className="text-zinc-400 text-[10px] italic">This is to certify that</p>
                              <p className="text-xl font-bold text-zinc-900">Abba Yusuf</p>
                              <p className="text-zinc-400 text-[10px] italic">has successfully completed</p>
                              <p className="text-sm font-bold text-emerald-800">Full Stack Web Development</p>
                            </div>
                            <div className="mt-8 pt-8 border-t border-zinc-100 w-full flex justify-between items-end">
                              <div className="text-left">
                                <p className="text-[8px] uppercase font-bold text-zinc-400">Date</p>
                                <p className="text-xs font-bold text-zinc-900">March 19, 2026</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[8px] uppercase font-bold text-zinc-400">Verify ID</p>
                                <p className="text-[10px] font-mono font-bold text-emerald-700">ABBA-SAMPLE-2026</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="absolute -bottom-6 -right-6 bg-yellow-400 text-zinc-900 p-4 rounded-2xl shadow-xl font-black text-xs uppercase tracking-widest transform rotate-12 group-hover:rotate-0 transition-transform">
                          Professional Certification
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  <div className="order-1 lg:order-2">
                    <h2 className="text-emerald-600 font-black tracking-[0.2em] uppercase text-sm mb-4">
                      {language === 'en' ? 'Recognition of Excellence' : 'Yabo ga Kwazo'}
                    </h2>
                    <h3 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-8 leading-tight">
                      {language === 'en' 
                        ? 'Earn a Certificate That Matters'
                        : 'Sami Takardar Shaidar Da Take Da Daraja'}
                    </h3>
                    <div className="space-y-8">
                      {[
                        {
                          icon: <ShieldCheck className="text-emerald-600" />,
                          title: language === 'en' ? 'Verified Credentials' : 'Shaidar Da Aka Tabbatar',
                          desc: language === 'en' 
                            ? 'Every certificate comes with a unique verification ID that employers can check on our platform.'
                            : 'Kowace takardar shaida tana zuwa da lambar tabbatarwa ta musamman wacce ma\'aikata za su iya dubawa a dandalinmu.'
                        },
                        {
                          icon: <Globe className="text-emerald-600" />,
                          title: language === 'en' ? 'Global Recognition' : 'Karbuwa A Duniya',
                          desc: language === 'en'
                            ? 'Our curriculum is designed to meet international standards, making your skills valuable worldwide.'
                            : 'An tsara tsarin karatunmu don dacewa da ka\'idojin duniya, wanda hakan zai sa kwarewar ku ta zama mai daraja a duk duniya.'
                        },
                        {
                          icon: <Zap className="text-emerald-600" />,
                          title: language === 'en' ? 'Instant Access' : 'Samun Shiga Nan Take',
                          desc: language === 'en'
                            ? 'Download your professional PDF certificate immediately after completing all course requirements.'
                            : 'Zazzage takardar shaidar ku ta PDF nan take bayan kun kammala dukkan bukatun kwas.'
                        }
                      ].map((item, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex gap-6"
                        >
                          <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-100 flex-shrink-0 h-fit">
                            {item.icon}
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-zinc-900 mb-2">{item.title}</h4>
                            <p className="text-zinc-500 leading-relaxed">{item.desc}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    <div className="mt-12 flex flex-col sm:flex-row gap-4">
                      <button 
                        onClick={() => {
                          const el = document.getElementById('programs');
                          el?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="bg-zinc-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-900/20 flex items-center justify-center gap-3 group"
                      >
                        {language === 'en' ? 'Start Learning Now' : 'Fara Koyo Yanzu'}
                        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                      
                      <button 
                        onClick={() => setActiveCertificateCourse({
                          id: 'sample-1',
                          title: 'Full Stack Web Development',
                          titleHa: 'Cikakken Koyon Yanar Gizo',
                          description: 'Sample certificate preview',
                          descriptionHa: 'Samfurin takardar shaida',
                          duration: '6 Months',
                          students: 1000,
                          category: 'Development',
                          department: 'Technology',
                          image: 'https://picsum.photos/seed/code/800/600',
                          language: 'both',
                          price: 0
                        })}
                        className="bg-white border-2 border-emerald-600 text-emerald-600 px-10 py-4 rounded-2xl font-bold hover:bg-emerald-50 transition-all flex items-center justify-center gap-3 group"
                      >
                        <Award size={20} className="group-hover:rotate-12 transition-transform" />
                        {language === 'en' ? 'View Sample Certificate' : 'Duba Samfurin Takarda'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <OurCause language={language} />

            <JoinUs 
              language={language} 
              onRegisterClick={() => {
                setLoginModalInitialMode(true);
                setIsLoginOpen(true);
              }}
              onLoginClick={() => {
                setLoginModalInitialMode(false);
                setIsLoginOpen(true);
              }}
            />

            <Programs 
              language={language} 
              courses={courses} 
              enrollments={enrollments}
              onEnroll={enrollInCourse}
              onUnenroll={unenrollFromCourse}
              onAddCourse={addCourse}
              onUpdateCourse={updateCourse}
              onDeleteCourse={deleteCourse}
              onManageLessons={(course) => {
                setActiveCourseForLessons(course);
                setIsLessonManagerOpen(true);
              }}
              isAdmin={profile?.role === 'admin'}
              lessons={lessons}
              courseProgress={courseProgress}
              onViewLessons={(id) => setActiveCourseId(id)}
              onDownloadCertificate={(course) => setActiveCertificateCourse(course)}
            />

            {activeCourseId && (
              <LessonViewer 
                courseId={activeCourseId}
                lessons={lessons[activeCourseId] || []}
                progress={courseProgress[activeCourseId]}
                onToggleComplete={toggleLessonCompletion}
                language={language}
                onClose={() => setActiveCourseId(null)}
              />
            )}

            {isLessonManagerOpen && activeCourseForLessons && (
              <LessonManager
                courseId={activeCourseForLessons.id}
                courseTitle={language === 'en' ? activeCourseForLessons.title : activeCourseForLessons.titleHa}
                lessons={lessons[activeCourseForLessons.id] || []}
                onAddLesson={addLesson}
                onUpdateLesson={updateLesson}
                onDeleteLesson={deleteLesson}
                language={language}
                onClose={() => {
                  setIsLessonManagerOpen(false);
                  setActiveCourseForLessons(null);
                }}
              />
            )}

            <AnimatePresence>
              {activeCertificateCourse && (
                <Certificate
                  studentName={activeCertificateCourse.id === 'sample-1' ? 'Abba Yusuf' : (profile?.displayName || profile?.email || 'Student')}
                  courseTitle={language === 'en' ? activeCertificateCourse.title : activeCertificateCourse.titleHa}
                  completionDate={new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'ha-NG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                  language={language}
                  onClose={() => setActiveCertificateCourse(null)}
                />
              )}
            </AnimatePresence>

            <ProfileModal
              isOpen={isProfileOpen}
              onClose={() => setIsProfileOpen(false)}
              profile={profile}
              language={language}
              onUpdate={(updatedProfile) => setProfile(updatedProfile)}
              onOpenAdmin={() => {
                setIsProfileOpen(false);
                setIsAdminDashboardOpen(true);
              }}
              onOpenDashboard={() => {
                setIsProfileOpen(false);
                setIsStudentDashboardOpen(true);
              }}
            />

            <StudentDashboard
              isOpen={isStudentDashboardOpen}
              onClose={() => setIsStudentDashboardOpen(false)}
              language={language}
              profile={profile}
              courses={courses}
              enrollments={enrollments}
              lessons={lessons}
              courseProgress={courseProgress}
              onViewLessons={(id) => setActiveCourseId(id)}
              onDownloadCertificate={(course) => setActiveCertificateCourse(course)}
              onLogout={logout}
            />

            <AdminDashboard
              isOpen={isAdminDashboardOpen}
              onClose={() => setIsAdminDashboardOpen(false)}
              language={language}
              onManageLessons={(course) => {
                setActiveCourseForLessons(course);
                setIsAdminDashboardOpen(false);
                setIsLessonManagerOpen(true);
              }}
            />

            {/* About Section */}
            <section id="about" className="py-24 bg-white overflow-hidden">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                  <div className="flex-1 relative">
                    <div className="absolute -top-10 -left-10 w-64 h-64 bg-emerald-100 rounded-full blur-3xl opacity-50" />
                    <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50" />
                    <img 
                      src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800" 
                      alt="Students learning"
                      className="relative z-10 rounded-[2.5rem] shadow-2xl"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-[0.2em] mb-4">
                      {language === 'en' ? 'About the Academy' : 'Game da Academy'}
                    </h2>
                    <h3 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-8 leading-tight">
                      {language === 'en' 
                        ? 'Bridging Language Barriers in Tech Education'
                        : 'Rage Tazarar Harshe a Ilimin Fasaha'}
                    </h3>
                    <p className="text-zinc-600 text-lg mb-6 leading-relaxed">
                      {language === 'en'
                        ? 'Abba Online Academy was founded with a single mission: to make high-quality technology education accessible to everyone, regardless of their primary language. We believe that language should never be a barrier to innovation.'
                        : 'An kafa Abba Online Academy ne da manufa guda: samar da ingantaccen ilimin fasaha ga kowa, ba tare da la\'akari da babban harshensu ba. Mun yi imani cewa harshe bai kamata ya zama shamaki ga kirkire-kirkire ba.'}
                    </p>
                    <p className="text-zinc-600 text-lg mb-10 leading-relaxed">
                      {language === 'en'
                        ? 'We specialize in bilingual instruction, offering our entire curriculum in both Hausa and English. Our instructors are industry experts who understand the local context and global standards, ensuring our students are competitive in the global market.'
                        : 'Mun kware a koyarwa da harsuna biyu, muna ba da dukkan tsarin karatunmu da Hausa da Turanci. Malamai namu kwararru ne a fannin masana\'antu wadanda suka fahimci yanayin gida da ka\'idojin duniya, suna tabbatar da cewa dalibanmu suna da gogayya a kasuwar duniya.'}
                    </p>
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <p className="text-3xl font-bold text-emerald-600 mb-1">98%</p>
                        <p className="text-zinc-500 font-medium">{language === 'en' ? 'Success Rate' : 'Yawan Nasara'}</p>
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-emerald-600 mb-1">50+</p>
                        <p className="text-zinc-500 font-medium">{language === 'en' ? 'Expert Mentors' : 'Kwararrun Malamai'}</p>
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-emerald-600 mb-1">24/7</p>
                        <p className="text-zinc-500 font-medium">{language === 'en' ? 'Online Support' : 'Taimakon Yanar Gizo'}</p>
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-emerald-600 mb-1">100%</p>
                        <p className="text-zinc-500 font-medium">{language === 'en' ? 'Practical Learning' : 'Koyon Aikace-aikace'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>

          <PaymentModal 
            isOpen={isPaymentOpen}
            onClose={() => setIsPaymentOpen(false)}
            course={selectedCourseForPayment}
            onPaymentSuccess={handlePaymentComplete}
            language={language}
          />

          <Footer 
            language={language} 
            onLoginClick={() => {
              setLoginModalInitialMode(false);
              setIsLoginOpen(true);
            }}
            onVerifyClick={() => setIsVerifyModalOpen(true)}
          />
          
          <LoginModal 
            isOpen={isLoginOpen} 
            onClose={() => setIsLoginOpen(false)} 
            language={language}
            initialIsSignup={loginModalInitialMode}
          />

          <VerifyCertificateModal
            isOpen={isVerifyModalOpen}
            onClose={() => setIsVerifyModalOpen(false)}
            language={language}
          />
        </div>
      </AuthContext.Provider>
    </ErrorBoundary>
  );
}
