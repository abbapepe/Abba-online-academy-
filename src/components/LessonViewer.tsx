import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Circle, ChevronRight, ChevronLeft, BookOpen, Video } from 'lucide-react';
import { Lesson, Progress } from '../App';

interface LessonViewerProps {
  courseId: string;
  lessons: Lesson[];
  progress: Progress | undefined;
  onToggleComplete: (courseId: string, lessonId: string) => void;
  language: 'en' | 'ha';
  onClose: () => void;
}

export const LessonViewer: React.FC<LessonViewerProps> = ({
  courseId,
  lessons,
  progress,
  onToggleComplete,
  language,
  onClose
}) => {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const currentLesson = lessons[currentLessonIndex];
  const completedLessons = progress?.completedLessons || [];
  
  const isLessonCompleted = (lessonId: string) => completedLessons.includes(lessonId);
  const completionPercentage = lessons.length > 0 
    ? Math.round((completedLessons.length / lessons.length) * 100) 
    : 0;

  const t = {
    en: {
      progress: "Course Progress",
      lessons: "Lessons",
      complete: "Complete",
      markComplete: "Mark as Complete",
      markIncomplete: "Mark as Incomplete",
      next: "Next Lesson",
      prev: "Previous Lesson",
      congrats: "Congratulations! You've completed this course.",
      back: "Back to Courses",
      video: "Video Lecture",
      text: "Lesson Content"
    },
    ha: {
      progress: "Ci gaban Karatu",
      lessons: "Darussa",
      complete: "An kammala",
      markComplete: "Alama a matsayin kammalawa",
      markIncomplete: "Cire alamar kammalawa",
      next: "Darasin Gaba",
      prev: "Darasin Baya",
      congrats: "Taya murna! Kun kammala wannan kwas din.",
      back: "Koma ga Darussa",
      video: "Bidiyon Darasi",
      text: "Abun Cikin Darasi"
    }
  }[language];

  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    // Handle YouTube
    const ytMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/);
    if (ytMatch && ytMatch[1]) {
      const videoId = ytMatch[1].split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // Handle Vimeo
    const vimeoMatch = url.match(/(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(.+)/);
    if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    return url;
  };

  const embedUrl = currentLesson?.videoUrl ? getEmbedUrl(currentLesson.videoUrl) : null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-6xl h-[90vh] rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl"
      >
        {/* Sidebar - Lesson List */}
        <div className="w-full md:w-80 bg-slate-50 border-r border-slate-200 flex flex-col h-full">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-4">{t.lessons}</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-slate-600 mb-1">
                <span>{t.progress}</span>
                <span>{completionPercentage}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercentage}%` }}
                  className="bg-emerald-500 h-full rounded-full"
                />
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {lessons.map((lesson, index) => (
              <button
                key={lesson.id}
                onClick={() => setCurrentLessonIndex(index)}
                className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 ${
                  currentLessonIndex === index 
                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' 
                    : 'hover:bg-white hover:shadow-sm text-slate-600'
                }`}
              >
                <div className="flex-shrink-0">
                  {isLessonCompleted(lesson.id) ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {index + 1}. {language === 'en' ? lesson.title : lesson.titleHa}
                  </p>
                  {lesson.videoUrl && (
                    <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                      <Video size={10} /> {t.video}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
          
          <div className="p-4 border-t border-slate-200">
            <button 
              onClick={onClose}
              className="w-full py-2 text-slate-600 hover:text-slate-900 font-medium text-sm"
            >
              {t.back}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-white h-full overflow-hidden">
          <AnimatePresence mode="wait">
            {currentLesson && (
              <motion.div
                key={currentLesson.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 overflow-y-auto"
              >
                {/* Video Player Section */}
                {embedUrl && (
                  <div className="w-full aspect-video bg-black relative group">
                    {embedUrl.includes('youtube.com') || embedUrl.includes('vimeo.com') ? (
                      <iframe
                        src={embedUrl}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={currentLesson.title}
                      />
                    ) : (
                      <video 
                        src={embedUrl} 
                        controls 
                        className="w-full h-full"
                        poster={lessons[0]?.videoUrl === currentLesson.videoUrl ? undefined : undefined}
                      >
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                )}

                <div className="p-8 md:p-12 max-w-3xl mx-auto">
                  <div className="flex items-center gap-2 text-emerald-600 mb-4">
                    <BookOpen className="w-5 h-5" />
                    <span className="text-sm font-semibold uppercase tracking-wider">
                      Lesson {currentLessonIndex + 1}
                    </span>
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 leading-tight">
                    {language === 'en' ? currentLesson.title : currentLesson.titleHa}
                  </h2>
                  
                  {((language === 'en' && currentLesson.content) || (language === 'ha' && currentLesson.contentHa)) && (
                    <div className="prose prose-slate max-w-none mb-12">
                      <p className="text-lg text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {language === 'en' ? currentLesson.content : currentLesson.contentHa}
                      </p>
                    </div>
                  )}

                  {!currentLesson.content && !currentLesson.contentHa && !embedUrl && (
                    <div className="bg-slate-50 p-8 rounded-2xl text-center border border-dashed border-slate-200 mb-12">
                      <p className="text-slate-500">No content available for this lesson yet.</p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-4 pt-8 border-t border-slate-100">
                    <button
                      onClick={() => onToggleComplete(courseId, currentLesson.id)}
                      className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
                        isLessonCompleted(currentLesson.id)
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200'
                      }`}
                    >
                      {isLessonCompleted(currentLesson.id) ? (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          {t.markIncomplete}
                        </>
                      ) : (
                        <>
                          <Circle className="w-5 h-5" />
                          {t.markComplete}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Footer */}
          <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-white">
            <button
              disabled={currentLessonIndex === 0}
              onClick={() => setCurrentLessonIndex(prev => prev - 1)}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed font-medium"
            >
              <ChevronLeft className="w-5 h-5" />
              {t.prev}
            </button>
            
            <div className="hidden md:flex items-center gap-4 text-sm text-slate-400 font-medium">
              <span>{currentLessonIndex + 1} / {lessons.length}</span>
            </div>

            <button
              disabled={currentLessonIndex === lessons.length - 1}
              onClick={() => setCurrentLessonIndex(prev => prev + 1)}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed font-medium"
            >
              {t.next}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
