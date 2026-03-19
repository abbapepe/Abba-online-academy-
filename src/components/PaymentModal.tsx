import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  CreditCard, 
  ShieldCheck, 
  Lock, 
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Printer,
  Copy
} from 'lucide-react';
import { Course } from '../App';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
  onPaymentSuccess: () => void;
  language: 'en' | 'ha';
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  course,
  onPaymentSuccess,
  language
}) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'details' | 'processing' | 'success'>('details');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!course) return null;

  const t = {
    en: {
      title: "Course Enrollment Payment",
      subtitle: "Secure your spot in the academy",
      course: "Course",
      amount: "Amount to Pay",
      cardHolder: "Card Holder Name",
      cardNumber: "Card Number",
      expiry: "Expiry Date",
      cvv: "CVV",
      payNow: "Pay Now",
      processing: "Processing Payment...",
      success: "Payment Successful!",
      successDesc: "You are now enrolled in the course. Welcome to the academy!",
      startLearning: "Start Learning",
      secure: "Secure encrypted payment",
      cancel: "Cancel",
      bankTransfer: "Bank Transfer",
      card: "Credit/Debit Card",
      bankDetails: "Bank Account Details",
      accountNumber: "Account Number",
      bankName: "Bank Name",
      accountName: "Account Name",
      confirmTransfer: "I have made the transfer",
      transferInstruction: "Please transfer the exact amount to the account below and click confirm.",
      printForm: "Print Payment Form",
      copySuccess: "Copied!",
      paymentInvoice: "Payment Invoice",
      instructionForm: "Payment Instruction Form"
    },
    ha: {
      title: "Biyan Kudin Shiga Darasi",
      subtitle: "Tabbatar da gurbinka a academy",
      course: "Darasi",
      amount: "Adadin da za a biya",
      cardHolder: "Sunan Mai Katin",
      cardNumber: "Lambar Katin",
      expiry: "Ranar Karewa",
      cvv: "CVV",
      payNow: "Biya Yanzu",
      processing: "Ana Gudanar da Biyan...",
      success: "An Yi Nasarar Biya!",
      successDesc: "Yanzu an yi maka rajista a darasin. Barka da zuwa academy!",
      startLearning: "Fara Koyo",
      secure: "Biyan kudi amintacce",
      cancel: "Soke",
      bankTransfer: "Tura kudi ta Banki",
      card: "Katin Banki",
      bankDetails: "Bayanin Asusun Banki",
      accountNumber: "Lambar Akawun",
      bankName: "Sunan Banki",
      accountName: "Sunan Akawun",
      confirmTransfer: "Na riga na tura kudin",
      transferInstruction: "Da fatan za a tura adadin kudin zuwa asusun da ke kasa sannan a danna tabbatarwa.",
      printForm: "Buga Takardar Biya",
      copySuccess: "An kwafe!",
      paymentInvoice: "Takardar Biyan Kudi",
      instructionForm: "Takardar Umarnin Biya"
    }
  }[language];

  const handlePrint = () => {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    const content = `
      <html>
        <head>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #18181b; line-height: 1.5; }
            .header { text-align: center; border-bottom: 2px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 28px; font-weight: 900; color: #10b981; letter-spacing: -0.02em; }
            .subtitle { font-size: 14px; color: #71717a; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 4px; }
            .details { margin-bottom: 30px; }
            .row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f4f4f5; }
            .label { font-weight: 700; color: #71717a; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; }
            .value { font-weight: 700; font-size: 14px; }
            .bank-box { background: #f9fafb; padding: 24px; border-radius: 16px; border: 1px solid #e4e4e7; }
            .bank-title { font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: #10b981; margin-bottom: 16px; margin-top: 0; }
            .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #a1a1aa; border-top: 1px solid #f4f4f5; padding-top: 20px; }
            .amount-value { color: #10b981; font-size: 24px; font-weight: 900; }
            @media print {
              body { padding: 20px; }
              .bank-box { border: 1px solid #ccc; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">ABBA ONLINE ACADEMY</div>
            <div class="subtitle">${t.instructionForm}</div>
          </div>
          <div class="details">
            <div class="row">
              <span class="label">${t.course}</span>
              <span class="value">${language === 'en' ? course.title : course.titleHa}</span>
            </div>
            <div class="row" style="align-items: center;">
              <span class="label">${t.amount}</span>
              <span class="amount-value">₦${course.price.toLocaleString()}</span>
            </div>
          </div>
          <div class="bank-box">
            <h3 class="bank-title">${t.bankDetails}</h3>
            <div class="row">
              <span class="label">${t.bankName}</span>
              <span class="value">UBA Bank</span>
            </div>
            <div class="row">
              <span class="label">${t.accountNumber}</span>
              <span class="value" style="font-size: 18px; letter-spacing: 0.05em;">2144451100</span>
            </div>
            <div class="row">
              <span class="label">${t.accountName}</span>
              <span class="value">YUSUF AHMADU</span>
            </div>
          </div>
          <div class="footer">
            <p style="color: #71717a; font-weight: 500; margin-bottom: 10px;">${t.transferInstruction}</p>
            <p>&copy; ${new Date().getFullYear()} Abba Online Academy. All rights reserved.</p>
          </div>
        </body>
      </html>
    `;

    iframe.contentWindow?.document.write(content);
    iframe.contentWindow?.document.close();
    
    // Wait for fonts/content to load before printing
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }, 500);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handlePayment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setStep('processing');

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    setLoading(false);
    setStep('success');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
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
            className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {step !== 'processing' && (
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-900 transition-colors"
              >
                <X size={24} />
              </button>
            )}

            {step === 'details' && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="inline-flex bg-emerald-100 p-4 rounded-2xl text-emerald-600 mb-4">
                    <CreditCard size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-zinc-900">{t.title}</h2>
                  <p className="text-zinc-500 text-sm mt-1">{t.subtitle}</p>
                </div>

                {/* Payment Method Toggle */}
                <div className="flex p-1 bg-zinc-100 rounded-2xl">
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                      paymentMethod === 'card' 
                        ? 'bg-white text-zinc-900 shadow-sm' 
                        : 'text-zinc-500 hover:text-zinc-700'
                    }`}
                  >
                    {t.card}
                  </button>
                  <button
                    onClick={() => setPaymentMethod('bank')}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                      paymentMethod === 'bank' 
                        ? 'bg-white text-zinc-900 shadow-sm' 
                        : 'text-zinc-500 hover:text-zinc-700'
                    }`}
                  >
                    {t.bankTransfer}
                  </button>
                </div>

                <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-zinc-500 text-sm">{t.course}</span>
                    <span className="font-bold text-zinc-900">{language === 'en' ? course.title : course.titleHa}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-zinc-200">
                    <span className="text-zinc-500 text-sm font-bold uppercase tracking-wider">{t.amount}</span>
                    <span className="text-2xl font-black text-emerald-600">₦{course.price.toLocaleString()}</span>
                  </div>
                </div>

                {paymentMethod === 'card' ? (
                  <form onSubmit={handlePayment} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">{t.cardHolder}</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-5 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">{t.cardNumber}</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          required
                          maxLength={19}
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                          className="w-full px-5 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 pl-12"
                          placeholder="0000 0000 0000 0000"
                        />
                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">{t.expiry}</label>
                        <input 
                          type="text" 
                          required
                          maxLength={5}
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value.replace(/\D/g, '').replace(/(.{2})/, '$1/'))}
                          className="w-full px-5 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">{t.cvv}</label>
                        <div className="relative">
                          <input 
                            type="password" 
                            required
                            maxLength={3}
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value)}
                            className="w-full px-5 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 pl-12"
                            placeholder="***"
                          />
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-zinc-400 text-[10px] font-bold uppercase tracking-widest justify-center py-2">
                      <ShieldCheck size={14} className="text-emerald-500" />
                      {t.secure}
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
                    >
                      {t.payNow}
                    </button>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                      <p className="text-emerald-800 text-xs font-medium text-center">
                        {t.transferInstruction}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-zinc-50 rounded-xl border border-zinc-100 group relative">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t.amount}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-emerald-600 text-lg">₦{course.price.toLocaleString()}</span>
                          <button 
                            onClick={() => copyToClipboard(course.price.toString(), 'amount')}
                            className="p-1.5 hover:bg-zinc-200 rounded-lg text-zinc-400 hover:text-zinc-600 transition-all relative"
                            title="Copy Amount"
                          >
                            {copiedField === 'amount' ? (
                              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap">
                                {t.copySuccess}
                              </span>
                            ) : null}
                            <Copy size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t.bankName}</span>
                        <span className="font-bold text-zinc-900">UBA Bank</span>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-zinc-50 rounded-xl border border-zinc-100 group relative">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t.accountNumber}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-zinc-900 text-lg tracking-wider">2144451100</span>
                          <button 
                            onClick={() => copyToClipboard('2144451100', 'account')}
                            className="p-1.5 hover:bg-zinc-200 rounded-lg text-zinc-400 hover:text-zinc-600 transition-all relative"
                            title="Copy Account Number"
                          >
                            {copiedField === 'account' ? (
                              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap">
                                {t.copySuccess}
                              </span>
                            ) : null}
                            <Copy size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t.accountName}</span>
                        <span className="font-bold text-zinc-900 uppercase">Yusuf Ahmadu</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button 
                        onClick={handlePrint}
                        className="flex-1 bg-zinc-100 text-zinc-900 py-4 rounded-2xl font-bold text-lg hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
                      >
                        <Printer size={20} />
                        {t.printForm}
                      </button>
                      <button 
                        onClick={() => handlePayment()}
                        className="flex-[2] bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
                      >
                        {t.confirmTransfer}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 'processing' && (
              <div className="py-12 text-center space-y-6">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto"
                />
                <h3 className="text-xl font-bold text-zinc-900">{t.processing}</h3>
              </div>
            )}

            {step === 'success' && (
              <div className="py-6 text-center space-y-6">
                <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                  <CheckCircle2 size={48} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-zinc-900 mb-2">{t.success}</h3>
                  <p className="text-zinc-500">{t.successDesc}</p>
                </div>
                <button 
                  onClick={() => {
                    onPaymentSuccess();
                    onClose();
                  }}
                  className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-black transition-all flex items-center justify-center gap-2 group"
                >
                  {t.startLearning}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
