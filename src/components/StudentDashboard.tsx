import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  BookOpen, 
  GraduationCap, 
  Award, 
  Clock, 
  ChevronRight, 
  Play, 
  CheckCircle2,
  LayoutDashboard,
  User as UserIcon,
  Settings,
  LogOut,
  BarChart3,
  TrendingUp,
  Camera
} from 'lucide-react';
import { Course, UserProfile, Lesson, Progress } from '../App';
import { 
  db, 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc,
  handleFirestoreError,
  OperationType
} from '../firebase';

interface StudentDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'ha';
  profile: UserProfile | null;
  courses: Course[];
  enrollments: string[];
  lessons: Record<string, Lesson[]>;
  courseProgress: Record<string, Progress>;
  onViewLessons: (courseId: string) => void;
  onDownloadCertificate: (course: Course) => void;
  onLogout: () => void;
}

type Tab = 'overview' | 'my-courses' | 'certificates' | 'settings';

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  isOpen,
  onClose,
  language,
  profile,
  courses,
  enrollments,
  lessons,
  courseProgress,
  onViewLessons,
  onDownloadCertificate,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(false);
  const [photoURL, setPhotoURL] = useState(profile?.photoURL || '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phoneNumber || '');
  const [gender, setGender] = useState(profile?.gender || 'male');
  const [dob, setDob] = useState(profile?.dateOfBirth || '');
  const [displayName, setDisplayName] = useState(profile?.displayName || '');

  useEffect(() => {
    if (profile) {
      setPhotoURL(profile.photoURL || '');
      setPhoneNumber(profile.phoneNumber || '');
      setGender(profile.gender || 'male');
      setDob(profile.dateOfBirth || '');
      setDisplayName(profile.displayName || '');
    }
  }, [profile]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      alert(language === 'en' ? 'Image is too large (max 500KB)' : 'Hoton ya yi girma da yawa (max 500KB)');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoURL(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);
    try {
      const userDocRef = doc(db, 'users', profile.uid);
      await updateDoc(userDocRef, {
        displayName,
        phoneNumber,
        gender,
        dateOfBirth: dob,
        photoURL
      });
      alert(language === 'en' ? 'Profile updated successfully!' : 'An sabunta bayanan asusunka cikin nasara!');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${profile.uid}`);
      alert(language === 'en' ? 'Failed to update profile' : 'An kasa sabunta bayanan asusunka');
    } finally {
      setLoading(false);
    }
  };
  
  const t = {
    en: {
      dashboard: "Student Dashboard",
      overview: "Overview",
      myCourses: "My Courses",
      certificates: "Certificates",
      settings: "Settings",
      welcome: "Welcome back,",
      enrolledCourses: "Enrolled Courses",
      completedLessons: "Completed Lessons",
      certificatesEarned: "Certificates Earned",
      continueLearning: "Continue Learning",
      viewLessons: "View Lessons",
      download: "Download",
      noCourses: "You haven't enrolled in any courses yet.",
      noCertificates: "Complete a course to earn your first certificate!",
      progress: "Progress",
      logout: "Log Out",
      personalInfo: "Personal Information",
      fullName: "Full Name",
      email: "Email Address",
      phone: "Phone Number",
      gender: "Gender",
      dob: "Date of Birth",
      male: "Male",
      female: "Female",
      other: "Other",
      saveChanges: "Save Changes",
      recentActivity: "Recent Activity",
      browseCourses: "Browse Courses"
    },
    ha: {
      dashboard: "Dandalin Dalibi",
      overview: "Bayani",
      myCourses: "Darussa Na",
      certificates: "Shaidun Karatu",
      settings: "Saituna",
      welcome: "Barka da dawowa,",
      enrolledCourses: "Darussan da aka Shiga",
      completedLessons: "Darussan da aka Kammala",
      certificatesEarned: "Shaidun da aka Samu",
      continueLearning: "Ci gaba da Koyo",
      viewLessons: "Duba Darussa",
      download: "Sauke",
      noCourses: "Ba ku riga kun shiga kowane darasi ba.",
      noCertificates: "Kammala darasi don samun shaidar karatun ku ta farko!",
      progress: "Ci gaba",
      logout: "Fita",
      personalInfo: "Bayanin Kai",
      fullName: "Cikakken Suna",
      email: "Adireshin Imel",
      phone: "Lambar Waya",
      gender: "Jinsi",
      dob: "Ranar Haihuwa",
      male: "Namiji",
      female: "Mace",
      other: "Sauran",
      saveChanges: "Ajiye Canje-canje",
      recentActivity: "Ayyukan Kwanan Nan",
      browseCourses: "Duba Darussa"
    }
  }[language];

  const enrolledCoursesList = courses.filter(c => enrollments.includes(c.id));
  
  const totalCompletedLessons = Object.values(courseProgress).reduce((acc, p) => 
    acc + (p.completedLessons?.length || 0), 0);
    
  const earnedCertificates = enrolledCoursesList.filter(c => {
    const progress = courseProgress[c.id];
    const courseLessons = lessons[c.id] || [];
    return progress && courseLessons.length > 0 && 
           progress.completedLessons.length === courseLessons.length;
  });

  const calculateProgress = (courseId: string) => {
    const progress = courseProgress[courseId];
    const courseLessons = lessons[courseId] || [];
    if (!progress || courseLessons.length === 0) return 0;
    return Math.round((progress.completedLessons.length / courseLessons.length) * 100);
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
            <div className="flex h-full">
              {/* Sidebar */}
              <div className="w-64 bg-zinc-50 border-r border-zinc-100 p-8 flex flex-col">
                <div className="flex items-center gap-3 mb-12">
                  <div className="bg-emerald-600 p-2 rounded-xl">
                    <GraduationCap className="text-white" size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-zinc-900 leading-tight">Student<br/><span className="text-emerald-600">Portal</span></h2>
                </div>

                <nav className="space-y-2 flex-1">
                  {[
                    { id: 'overview', icon: LayoutDashboard, label: t.overview },
                    { id: 'my-courses', icon: BookOpen, label: t.myCourses },
                    { id: 'certificates', icon: Award, label: t.certificates },
                    { id: 'settings', icon: Settings, label: t.settings }
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

                <div className="mt-auto space-y-2">
                  <button 
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-red-600 font-bold transition-colors"
                  >
                    <LogOut size={20} />
                    {t.logout}
                  </button>
                  <button 
                    onClick={onClose}
                    className="w-full flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-zinc-900 font-bold transition-colors"
                  >
                    <X size={20} />
                    {language === 'en' ? 'Close' : 'Rufe'}
                  </button>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 flex flex-col overflow-hidden bg-white">
                <header className="h-20 border-b border-zinc-100 px-10 flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-zinc-900">
                    {activeTab === 'overview' ? t.dashboard : t[activeTab.replace('-', '') as keyof typeof t]}
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-bold text-zinc-900">{profile?.displayName}</p>
                      <p className="text-xs text-zinc-500">{profile?.email}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold overflow-hidden border-2 border-white shadow-sm">
                      {profile?.photoURL ? (
                        <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        profile?.displayName?.[0] || 'U'
                      )}
                    </div>
                  </div>
                </header>

                <div className="flex-1 overflow-y-auto p-10">
                  {activeTab === 'overview' && (
                    <div className="space-y-10">
                      <div className="bg-zinc-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden flex items-center justify-between">
                        <div className="relative z-10">
                          <h4 className="text-3xl font-bold mb-2">{t.welcome} {profile?.displayName?.split(' ')[0]}!</h4>
                          <p className="text-zinc-400 max-w-md">You're making great progress. Keep pushing towards your goals!</p>
                        </div>
                        {profile?.photoURL && (
                          <div className="relative z-10 hidden md:block">
                            <img src={profile.photoURL} alt="Profile" className="w-32 h-32 rounded-3xl object-cover border-4 border-white/10 shadow-2xl" />
                          </div>
                        )}
                        <TrendingUp className="absolute right-10 bottom-0 text-white/5 w-64 h-64 -mb-10" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                          { label: t.enrolledCourses, value: enrolledCoursesList.length, icon: BookOpen, color: 'bg-blue-50 text-blue-600' },
                          { label: t.completedLessons, value: totalCompletedLessons, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
                          { label: t.certificatesEarned, value: earnedCertificates.length, icon: Award, color: 'bg-purple-50 text-purple-600' }
                        ].map((stat, i) => (
                          <div key={i} className="bg-white border border-zinc-100 p-8 rounded-[2rem] shadow-sm">
                            <div className={`${stat.color} p-4 rounded-2xl inline-flex mb-6`}>
                              <stat.icon size={24} />
                            </div>
                            <p className="text-zinc-500 font-bold uppercase tracking-wider text-xs mb-2">{stat.label}</p>
                            <h4 className="text-4xl font-black text-zinc-900">{stat.value}</h4>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white border border-zinc-100 p-8 rounded-[2rem] shadow-sm">
                          <h4 className="text-xl font-bold text-zinc-900 mb-6">{t.recentActivity}</h4>
                          <div className="space-y-6">
                            {enrolledCoursesList.slice(0, 3).map(course => (
                              <div key={course.id} className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl overflow-hidden">
                                  <img src={course.image} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-bold text-zinc-900 text-sm">{language === 'en' ? course.title : course.titleHa}</p>
                                  <div className="w-full bg-zinc-100 h-1.5 rounded-full mt-2">
                                    <div 
                                      className="bg-emerald-600 h-full rounded-full transition-all" 
                                      style={{ width: `${calculateProgress(course.id)}%` }}
                                    />
                                  </div>
                                </div>
                                <p className="text-xs font-bold text-emerald-600">{calculateProgress(course.id)}%</p>
                              </div>
                            ))}
                            {enrolledCoursesList.length === 0 && (
                              <p className="text-zinc-500 text-sm italic">{t.noCourses}</p>
                            )}
                          </div>
                        </div>

                        <div className="bg-emerald-600 rounded-[2rem] p-8 text-white flex flex-col justify-between">
                          <div>
                            <h4 className="text-xl font-bold mb-2">Ready for more?</h4>
                            <p className="text-emerald-100 text-sm">Explore our new courses and expand your skill set today.</p>
                          </div>
                          <button 
                            onClick={onClose}
                            className="mt-8 bg-white text-emerald-600 px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
                          >
                            {t.browseCourses}
                            <ChevronRight size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'my-courses' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {enrolledCoursesList.map(course => {
                        const progress = calculateProgress(course.id);
                        return (
                          <div key={course.id} className="bg-white border border-zinc-100 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-all group">
                            <div className="h-48 relative">
                              <img src={course.image} alt="" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                                <span className="bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                                  {course.category}
                                </span>
                              </div>
                            </div>
                            <div className="p-8">
                              <h4 className="text-xl font-bold text-zinc-900 mb-2">{language === 'en' ? course.title : course.titleHa}</h4>
                              <p className="text-zinc-500 text-sm mb-6 line-clamp-2">
                                {language === 'en' ? course.description : course.descriptionHa}
                              </p>
                              
                              <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-zinc-500 font-medium">{t.progress}</span>
                                  <span className="text-emerald-600 font-bold">{progress}%</span>
                                </div>
                                <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                                  <div 
                                    className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <button 
                                  onClick={() => {
                                    onViewLessons(course.id);
                                    onClose();
                                  }}
                                  className="w-full bg-zinc-900 text-white py-3 rounded-xl font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
                                >
                                  <Play size={18} />
                                  {t.continueLearning}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {enrolledCoursesList.length === 0 && (
                        <div className="col-span-full text-center py-20">
                          <div className="bg-zinc-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-300">
                            <BookOpen size={40} />
                          </div>
                          <p className="text-zinc-500 font-medium">{t.noCourses}</p>
                          <button 
                            onClick={onClose}
                            className="mt-6 text-emerald-600 font-bold hover:underline"
                          >
                            {t.browseCourses}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'certificates' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {earnedCertificates.map(course => (
                        <div key={course.id} className="bg-white border border-zinc-100 p-8 rounded-[2rem] shadow-sm text-center">
                          <div className="bg-purple-50 text-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Award size={32} />
                          </div>
                          <h4 className="font-bold text-zinc-900 mb-2">{language === 'en' ? course.title : course.titleHa}</h4>
                          <p className="text-zinc-500 text-xs mb-8 uppercase tracking-widest font-bold">Earned on {new Date().toLocaleDateString()}</p>
                          <button 
                            onClick={() => onDownloadCertificate(course)}
                            className="w-full border-2 border-zinc-900 text-zinc-900 py-3 rounded-xl font-bold hover:bg-zinc-900 hover:text-white transition-all"
                          >
                            {t.download}
                          </button>
                        </div>
                      ))}
                      {earnedCertificates.length === 0 && (
                        <div className="col-span-full text-center py-20">
                          <div className="bg-zinc-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-300">
                            <Award size={40} />
                          </div>
                          <p className="text-zinc-500 font-medium">{t.noCertificates}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'settings' && (
                    <div className="max-w-2xl mx-auto bg-white border border-zinc-100 p-10 rounded-[2.5rem] shadow-sm">
                      <div className="flex items-center justify-between mb-8">
                        <h4 className="text-2xl font-bold text-zinc-900">{t.personalInfo}</h4>
                        <div className="relative">
                          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-emerald-100 flex items-center justify-center text-emerald-600 border-4 border-white shadow-lg">
                            {photoURL ? (
                              <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              <UserIcon size={32} />
                            )}
                          </div>
                          <label className="absolute -bottom-2 -right-2 bg-white p-2 rounded-xl shadow-lg border border-zinc-100 cursor-pointer hover:bg-zinc-50 transition-colors text-emerald-600">
                            <Camera size={16} />
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleImageChange}
                              className="hidden" 
                            />
                          </label>
                        </div>
                      </div>
                      <form className="space-y-6" onSubmit={handleUpdateProfile}>
                        <div>
                          <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider mb-2">{t.fullName}</label>
                          <input 
                            type="text" 
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider mb-2">{t.email}</label>
                          <input 
                            type="email" 
                            disabled
                            value={profile?.email || ''}
                            className="w-full px-5 py-4 bg-zinc-100 border border-zinc-200 rounded-2xl text-zinc-500 cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider mb-2">{t.phone}</label>
                          <input 
                            type="tel" 
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider mb-2">{t.gender}</label>
                            <select 
                              value={gender}
                              onChange={(e) => setGender(e.target.value as any)}
                              className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                            >
                              <option value="male">{t.male}</option>
                              <option value="female">{t.female}</option>
                              <option value="other">{t.other}</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider mb-2">{t.dob}</label>
                            <input 
                              type="date" 
                              value={dob}
                              onChange={(e) => setDob(e.target.value)}
                              className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                            />
                          </div>
                        </div>
                        <button 
                          type="submit"
                          disabled={loading}
                          className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                        >
                          {loading ? (language === 'en' ? 'Saving...' : 'Ana Ajiye...') : t.saveChanges}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
