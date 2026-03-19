import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Phone, Mail, Save, AlertCircle, CheckCircle2, Shield, LayoutDashboard, Camera, Upload } from 'lucide-react';
import { UserProfile } from '../App';
import { db, doc, updateDoc, handleFirestoreError, OperationType } from '../firebase';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  language: 'en' | 'ha';
  onUpdate: (updatedProfile: UserProfile) => void;
  onOpenAdmin: () => void;
  onOpenDashboard: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  language,
  onUpdate,
  onOpenAdmin,
  onOpenDashboard
}) => {
  const [phoneNumber, setPhoneNumber] = useState(profile?.phoneNumber || '');
  const [gender, setGender] = useState(profile?.gender || 'male');
  const [dob, setDob] = useState(profile?.dateOfBirth || '');
  const [photoURL, setPhotoURL] = useState(profile?.photoURL || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  React.useEffect(() => {
    if (profile) {
      setPhoneNumber(profile.phoneNumber || '');
      setGender(profile.gender || 'male');
      setDob(profile.dateOfBirth || '');
      setPhotoURL(profile.photoURL || '');
    }
  }, [profile]);

  const t = {
    en: {
      title: "My Profile",
      subtitle: "Manage your account information",
      fullName: "Full Name",
      email: "Email Address",
      phone: "Phone Number",
      gender: "Gender",
      dob: "Date of Birth",
      male: "Male",
      female: "Female",
      other: "Other",
      save: "Save Changes",
      saving: "Saving...",
      success: "Profile updated successfully!",
      error: "Failed to update profile",
      imageTooLarge: "Image is too large (max 500KB)",
      admin: "Administrator",
      student: "Student",
      adminDashboard: "Admin Dashboard",
      studentDashboard: "Student Dashboard"
    },
    ha: {
      title: "Bayanan Suna",
      subtitle: "Sarrafa bayanan asusunka",
      fullName: "Cikakken Suna",
      email: "Adireshin Imel",
      phone: "Lambar Waya",
      gender: "Jinsi",
      dob: "Ranar Haihuwa",
      male: "Namiji",
      female: "Mace",
      other: "Sauran",
      save: "Ajiye Canje-canje",
      saving: "Ana Ajiye...",
      success: "An sabunta bayanan asusunka cikin nasara!",
      error: "An kasa sabunta bayanan asusunka",
      imageTooLarge: "Hoton ya yi girma da yawa (max 500KB)",
      admin: "Gudanarwa",
      student: "Dalibi",
      adminDashboard: "Dandalin Gudanarwa",
      studentDashboard: "Dandalin Dalibi"
    }
  }[language];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      setError(t.imageTooLarge);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoURL(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const userDocRef = doc(db, 'users', profile.uid);
      await updateDoc(userDocRef, {
        phoneNumber: phoneNumber,
        gender: gender,
        dateOfBirth: dob,
        photoURL: photoURL
      });
      
      const updatedProfile = { ...profile, phoneNumber, gender: gender as any, dateOfBirth: dob, photoURL };
      onUpdate(updatedProfile);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${profile.uid}`);
      setError(t.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
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
              <div className="relative inline-block group">
                <div className="w-24 h-24 rounded-3xl overflow-hidden bg-emerald-100 flex items-center justify-center text-emerald-600 border-4 border-white shadow-lg">
                  {photoURL ? (
                    <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={48} />
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 bg-white p-2 rounded-xl shadow-lg border border-zinc-100 cursor-pointer hover:bg-zinc-50 transition-colors text-emerald-600">
                  <Camera size={18} />
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange}
                    className="hidden" 
                  />
                </label>
              </div>
              <h2 className="text-3xl font-bold text-zinc-900 mt-4">{t.title}</h2>
              <p className="text-zinc-500 mt-2">{t.subtitle}</p>
              <div className="mt-4 flex flex-col items-center gap-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-zinc-100 text-zinc-600">
                  {profile?.role === 'admin' ? t.admin : t.student}
                </span>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={onOpenDashboard}
                    className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-bold text-sm transition-colors"
                  >
                    <LayoutDashboard size={16} />
                    {t.studentDashboard}
                  </button>
                  {profile?.role === 'admin' && (
                    <button
                      onClick={onOpenAdmin}
                      className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-bold text-sm transition-colors"
                    >
                      <Shield size={16} />
                      {t.adminDashboard}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl text-sm flex items-center gap-2">
                <CheckCircle2 size={16} />
                {t.success}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider mb-2">{t.fullName}</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input 
                    type="text" 
                    disabled
                    value={profile?.displayName || ''}
                    className="w-full pl-12 pr-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider mb-2">{t.email}</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input 
                    type="email" 
                    disabled
                    value={profile?.email || ''}
                    className="w-full pl-12 pr-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-700 uppercase tracking-wider mb-2">{t.phone}</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input 
                    type="tel" 
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-12 pr-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    placeholder="07041414937"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    <Save size={20} />
                    {t.save}
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
