import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Save, Trash2, Video, FileText, GripVertical } from 'lucide-react';
import { Lesson } from '../App';

interface LessonManagerProps {
  courseId: string;
  courseTitle: string;
  lessons: Lesson[];
  onAddLesson: (courseId: string, lesson: Omit<Lesson, 'id'>) => void;
  onUpdateLesson: (courseId: string, lessonId: string, lesson: Partial<Lesson>) => void;
  onDeleteLesson: (courseId: string, lessonId: string) => void;
  language: 'en' | 'ha';
  onClose: () => void;
}

export const LessonManager: React.FC<LessonManagerProps> = ({
  courseId,
  courseTitle,
  lessons,
  onAddLesson,
  onUpdateLesson,
  onDeleteLesson,
  language,
  onClose
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonToDelete, setLessonToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Lesson, 'id'>>({
    courseId: courseId,
    title: '',
    titleHa: '',
    content: '',
    contentHa: '',
    videoUrl: '',
    order: lessons.length
  });

  const t = {
    en: {
      title: "Manage Lessons",
      addLesson: "Add New Lesson",
      editLesson: "Edit Lesson",
      lessonTitleEn: "Lesson Title (English)",
      lessonTitleHa: "Lesson Title (Hausa)",
      contentEn: "Content (English)",
      contentHa: "Content (Hausa)",
      videoUrl: "Video URL (YouTube/Vimeo)",
      save: "Save Lesson",
      cancel: "Cancel",
      delete: "Delete Lesson",
      confirmDelete: "Are you sure you want to delete this lesson?",
      noLessons: "No lessons added yet."
    },
    ha: {
      title: "Sarrafa Darussa",
      addLesson: "Kara Sabon Darasi",
      editLesson: "Gyara Darasi",
      lessonTitleEn: "Taken Darasi (Turanci)",
      lessonTitleHa: "Taken Darasi (Hausa)",
      contentEn: "Abun Ciki (Turanci)",
      contentHa: "Abun Ciki (Hausa)",
      videoUrl: "Hanyar Bidiyo (YouTube/Vimeo)",
      save: "Ajiye Darasi",
      cancel: "Soke",
      delete: "Goge Darasi",
      confirmDelete: "Shin kun tabbata kuna son goge wannan darasin?",
      noLessons: "Ba a kara darussa ba tukuna."
    }
  }[language];

  const handleOpenAdd = () => {
    setEditingLesson(null);
    setFormData({
      courseId: courseId,
      title: '',
      titleHa: '',
      content: '',
      contentHa: '',
      videoUrl: '',
      order: lessons.length
    });
    setIsAdding(true);
  };

  const handleOpenEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setFormData({
      courseId: courseId,
      title: lesson.title,
      titleHa: lesson.titleHa,
      content: lesson.content,
      contentHa: lesson.contentHa,
      videoUrl: lesson.videoUrl || '',
      order: lesson.order
    });
    setIsAdding(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLesson) {
      onUpdateLesson(courseId, editingLesson.id, formData);
    } else {
      onAddLesson(courseId, formData);
    }
    setIsAdding(false);
  };

  const handleDelete = (lessonId: string) => {
    onDeleteLesson(courseId, lessonId);
    setLessonToDelete(null);
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    const ytMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/);
    if (ytMatch && ytMatch[1]) {
      const videoId = ytMatch[1].split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    const vimeoMatch = url.match(/(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(.+)/);
    if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    return url;
  };

  const previewUrl = getEmbedUrl(formData.videoUrl);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-4xl h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl"
      >
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900">{t.title}</h2>
            <p className="text-zinc-500 text-sm">{courseTitle}</p>
          </div>
          <div className="flex items-center gap-3">
            {!isAdding && (
              <button 
                onClick={handleOpenAdd}
                className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all flex items-center gap-2"
              >
                <Plus size={16} />
                {t.addLesson}
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isAdding ? (
            <motion.form 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit} 
              className="space-y-6 max-w-2xl mx-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider mb-2">{t.lessonTitleEn}</label>
                  <input 
                    type="text" 
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-5 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider mb-2">{t.lessonTitleHa}</label>
                  <input 
                    type="text" 
                    required
                    value={formData.titleHa}
                    onChange={(e) => setFormData({...formData, titleHa: e.target.value})}
                    className="w-full px-5 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider mb-2">{t.videoUrl}</label>
                <div className="relative">
                  <Video className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input 
                    type="url" 
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                    className="w-full pl-12 pr-5 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                
                {previewUrl && (
                  <div className="mt-4 rounded-xl overflow-hidden bg-black aspect-video border border-zinc-200">
                    {previewUrl.includes('youtube.com') || previewUrl.includes('vimeo.com') ? (
                      <iframe
                        src={previewUrl}
                        className="w-full h-full"
                        title="Video Preview"
                      />
                    ) : (
                      <video src={previewUrl} controls className="w-full h-full" />
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider mb-2">{t.contentEn}</label>
                  <textarea 
                    rows={6}
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    className="w-full px-5 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider mb-2">{t.contentHa}</label>
                  <textarea 
                    rows={6}
                    value={formData.contentHa}
                    onChange={(e) => setFormData({...formData, contentHa: e.target.value})}
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
                  onClick={() => setIsAdding(false)}
                  className="px-8 py-4 bg-zinc-100 text-zinc-600 rounded-2xl font-bold hover:bg-zinc-200 transition-all"
                >
                  {t.cancel}
                </button>
              </div>
            </motion.form>
          ) : (
            <div className="space-y-3">
              {lessons.length === 0 ? (
                <div className="text-center py-20 bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200">
                  <FileText className="mx-auto text-zinc-300 mb-4" size={48} />
                  <p className="text-zinc-500 font-medium">{t.noLessons}</p>
                </div>
              ) : (
                lessons.sort((a, b) => a.order - b.order).map((lesson, index) => (
                  <div 
                    key={lesson.id}
                    className="group bg-white border border-zinc-100 p-4 rounded-2xl hover:shadow-md transition-all flex items-center gap-4"
                  >
                    <div className="text-zinc-300 cursor-grab active:cursor-grabbing">
                      <GripVertical size={20} />
                    </div>
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-zinc-900 truncate">
                        {language === 'en' ? lesson.title : lesson.titleHa}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        {lesson.videoUrl && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                            <Video size={10} /> Video
                          </span>
                        )}
                        {lesson.content && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-zinc-50 text-zinc-600 px-2 py-0.5 rounded-full">
                            <FileText size={10} /> Text
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenEdit(lesson)}
                        className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                      >
                        <Save size={18} />
                      </button>
                      <button 
                        onClick={() => setLessonToDelete(lesson.id)}
                        className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {lessonToDelete && (
            <div className="fixed inset-0 z-[170] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setLessonToDelete(null)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl overflow-hidden"
              >
                <h3 className="text-2xl font-bold text-zinc-900 mb-4">{t.delete}</h3>
                <p className="text-zinc-600 mb-8">{t.confirmDelete}</p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setLessonToDelete(null)}
                    className="flex-1 py-4 px-6 bg-zinc-100 text-zinc-700 rounded-2xl font-bold hover:bg-zinc-200 transition-all"
                  >
                    {t.cancel}
                  </button>
                  <button
                    onClick={() => handleDelete(lessonToDelete)}
                    className="flex-1 py-4 px-6 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200"
                  >
                    {t.delete}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
