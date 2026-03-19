import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { X, Download, Award, ShieldCheck, Calendar, Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface CertificateProps {
  studentName: string;
  courseTitle: string;
  completionDate: string;
  language: 'en' | 'ha';
  onClose: () => void;
}

export const Certificate: React.FC<CertificateProps> = ({
  studentName,
  courseTitle,
  completionDate,
  language,
  onClose
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  const t = {
    en: {
      title: "Course Completion Certificate",
      download: "Download PDF",
      close: "Close",
      certOfCompletion: "Certificate of Completion",
      presentedTo: "This is to certify that",
      hasCompleted: "has successfully completed the professional course",
      date: "Date of Achievement",
      authorized: "Authorized Signature",
      academy: "Abba Online Academy",
      verify: "Verification ID",
      excellence: "In recognition of outstanding academic performance and dedication to learning."
    },
    ha: {
      title: "Takardar Kammala Kwas",
      download: "Zazzage PDF",
      close: "Rufe",
      certOfCompletion: "Takardar Shaidar Kammalawa",
      presentedTo: "Wannan shaida ce cewa",
      hasCompleted: "ya kammala kwararren kwas din",
      date: "Ranar Samun Nasara",
      authorized: "Sa hannun Hukuma",
      academy: "Abba Online Academy",
      verify: "Lambar Tabbatarwa",
      excellence: "Don nuna yabo ga kwazo na musamman da sadaukarwa ga koyo."
    }
  }[language];

  const verificationId = `ABBA-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  const handleDownload = async () => {
    if (!certificateRef.current) return;

    const canvas = await html2canvas(certificateRef.current, {
      scale: 3, // Higher scale for better quality
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`${studentName.replace(/\s+/g, '_')}_Certificate.pdf`);
  };

  const handleShare = async () => {
    const shareData = {
      title: `${t.academy} - ${t.certOfCompletion}`,
      text: `I just earned my professional certificate in ${courseTitle} from ${t.academy}!`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        alert(language === 'en' ? 'Link copied to clipboard!' : 'An kwafi hanyar haɗi!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 overflow-y-auto">
      <div className="max-w-6xl w-full">
        <div className="flex justify-between items-center mb-8 text-white">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-400 p-2 rounded-xl text-zinc-900">
              <Award size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{t.title}</h2>
              <p className="text-zinc-400 text-sm">{verificationId}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleShare}
              className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-95"
            >
              <Share2 size={20} />
              {language === 'en' ? 'Share' : 'Raba'}
            </button>
            <button
              onClick={handleDownload}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-xl shadow-emerald-900/40 active:scale-95"
            >
              <Download size={20} />
              {t.download}
            </button>
            <button
              onClick={onClose}
              className="p-3 hover:bg-white/10 rounded-2xl transition-colors text-zinc-400 hover:text-white"
            >
              <X size={28} />
            </button>
          </div>
        </div>

        {/* Certificate Preview */}
        <div className="bg-zinc-900 p-1 rounded-[3rem] shadow-2xl border border-white/5 overflow-hidden">
          <div 
            ref={certificateRef}
            className="aspect-[1.414/1] bg-white text-zinc-900 p-12 relative overflow-hidden"
            style={{ 
              backgroundImage: 'radial-gradient(rgba(16, 185, 129, 0.05) 0.5px, transparent 0.5px)',
              backgroundSize: '24px 24px'
            }}
          >
            {/* Ornate Border */}
            <div className="absolute inset-4 border-[12px] border-double border-emerald-900/10 rounded-sm" />
            <div className="absolute inset-8 border-2 border-emerald-900/20 rounded-sm" />
            
            {/* Corner Decorations */}
            <div className="absolute top-0 left-0 w-48 h-48 bg-emerald-900/5 rounded-br-full -translate-x-12 -translate-y-12" />
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-900/5 rounded-bl-full translate-x-12 -translate-y-12" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-900/5 rounded-tr-full -translate-x-12 translate-y-12" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-emerald-900/5 rounded-tl-full translate-x-12 translate-y-12" />

            <div className="relative h-full flex flex-col items-center justify-between text-center p-12 border border-emerald-900/10">
              {/* Header */}
              <div className="flex flex-col items-center">
                <div className="mb-6 relative">
                  <div className="w-24 h-24 bg-emerald-900 rounded-full flex items-center justify-center shadow-2xl relative z-10">
                    <Award className="text-yellow-400 w-12 h-12" />
                  </div>
                  <div className="absolute inset-0 bg-emerald-900/20 rounded-full animate-ping" />
                </div>
                <h3 className="text-emerald-900 font-black tracking-[0.4em] uppercase text-sm mb-4">
                  {t.academy}
                </h3>
                <h1 className="text-6xl font-black text-zinc-900 uppercase tracking-tighter mb-2">
                  {t.certOfCompletion}
                </h1>
                <div className="flex items-center gap-4 w-full max-w-md">
                  <div className="h-px bg-emerald-900/20 flex-1" />
                  <div className="w-2 h-2 rotate-45 bg-emerald-900" />
                  <div className="h-px bg-emerald-900/20 flex-1" />
                </div>
              </div>

              {/* Body */}
              <div className="space-y-10 max-w-3xl">
                <div>
                  <p className="text-2xl font-serif italic text-zinc-500 mb-6">{t.presentedTo}</p>
                  <h2 className="text-7xl font-black text-zinc-900 tracking-tight leading-none">
                    {studentName}
                  </h2>
                </div>

                <div className="space-y-4">
                  <p className="text-xl font-serif italic text-zinc-500">{t.hasCompleted}</p>
                  <h3 className="text-4xl font-bold text-emerald-900 tracking-tight">
                    {courseTitle}
                  </h3>
                  <p className="text-zinc-400 text-sm max-w-xl mx-auto font-medium italic">
                    "{t.excellence}"
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="w-full grid grid-cols-3 items-end pt-12">
                <div className="text-left space-y-2">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Calendar size={14} />
                    <span className="text-[10px] uppercase font-black tracking-widest">{t.date}</span>
                  </div>
                  <p className="text-xl font-bold text-zinc-900">{completionDate}</p>
                  <div className="pt-4">
                    <p className="text-[10px] uppercase font-black tracking-widest text-zinc-400 mb-1">{t.verify}</p>
                    <p className="text-xs font-mono font-bold text-emerald-700">{verificationId}</p>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-28 h-28 border-8 border-emerald-900/5 rounded-full flex items-center justify-center mb-2 relative">
                    <ShieldCheck size={56} className="text-emerald-900/20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 border-2 border-emerald-900/10 rounded-full flex items-center justify-center">
                        <Award size={24} className="text-emerald-900/10" />
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] uppercase font-black tracking-widest text-emerald-900/40">Official Seal</p>
                </div>

                <div className="text-right flex flex-col items-end">
                  <div className="mb-2 relative">
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Kirsch_Signature.png" 
                      alt="Signature" 
                      className="h-16 grayscale brightness-50 mix-blend-multiply relative z-10"
                    />
                    <div className="absolute -bottom-2 -right-4 w-24 h-24 bg-emerald-900/5 rounded-full blur-xl" />
                  </div>
                  <div className="w-56 h-px bg-zinc-200 mb-2" />
                  <p className="text-[10px] uppercase font-black tracking-widest text-zinc-400">{t.authorized}</p>
                  <p className="text-xs font-bold text-zinc-900 mt-1">Director of Academy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
