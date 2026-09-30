import React, { useState, useEffect } from 'react';
import { Phone, Lock, ArrowRight, RotateCw, AlertCircle, CheckCircle, ShieldCheck, X } from 'lucide-react';
import { sendOtpToPhone, verifyPhoneOtp } from '../services/auth';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    const clean = phoneNumber.trim().replace(/[\s-]/g, '');
    if (!clean || clean.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      const res = await sendOtpToPhone(clean, 'recaptcha-container');
      setLoading(false);
      if (res.success) {
        setStep('otp');
        setResendTimer(60);
        if (res.message) {
          setInfoMessage(res.message);
        }
      } else {
        setErrorMessage(res.message || 'Could not send SMS OTP. Please retry.');
      }
    } catch (err: unknown) {
      setLoading(false);
      setErrorMessage(err instanceof Error ? err.message : 'Network error. Please check connection and retry.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!otpCode || otpCode.trim().length < 6) {
      setErrorMessage('Please enter the 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyPhoneOtp(otpCode.trim(), phoneNumber);
      setLoading(false);
      if (res.success && res.user) {
        onSuccess(res.user);
        onClose();
      } else {
        setErrorMessage(res.message || 'Invalid or expired OTP. Please verify and retry.');
      }
    } catch (err: unknown) {
      setLoading(false);
      setErrorMessage(err instanceof Error ? err.message : 'Verification failed. Please retry.');
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || loading) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await sendOtpToPhone(phoneNumber, 'recaptcha-container');
      setLoading(false);
      if (res.success) {
        setResendTimer(60);
        setInfoMessage('New OTP code sent successfully.');
      } else {
        setErrorMessage(res.message || 'Failed to resend OTP.');
      }
    } catch (err: unknown) {
      setLoading(false);
      setErrorMessage(err instanceof Error ? err.message : 'Error resending OTP.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Invisible reCAPTCHA container for Firebase Phone Auth */}
      <div id="recaptcha-container"></div>

      <div className="relative w-full max-w-md rounded-2xl bg-stone-900 border border-stone-800 p-6 text-stone-100 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-5">
          <img src="/logo.jpg" alt="SRA Goat" className="w-12 h-12 rounded-full border border-emerald-500/40 object-cover" />
          <div>
            <h2 className="text-lg font-bold text-stone-100">Farmer & Buyer Login</h2>
            <p className="text-xs text-emerald-400 font-medium">SRA Group HYD • Official Marketplace</p>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-800/60 flex items-start gap-2.5 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <div className="flex-1 leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {infoMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-start gap-2.5 text-xs text-emerald-300">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            <div className="flex-1 leading-relaxed">{infoMessage}</div>
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                Mobile Phone Number
              </label>
              <div className="flex items-center rounded-xl bg-stone-950 border border-stone-800 focus-within:border-emerald-500 overflow-hidden transition">
                <span className="px-3.5 py-3 text-xs font-medium text-stone-400 bg-stone-900 border-r border-stone-800 select-none flex items-center gap-1.5">
                  🇮🇳 +91
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. 98765 43210"
                  maxLength={15}
                  required
                  autoFocus
                  className="flex-1 px-3.5 py-3 text-sm bg-transparent text-white placeholder-stone-500 focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-stone-500 mt-1.5 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                We will send a 6-digit SMS OTP code for verification.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 font-semibold text-sm text-white shadow-lg shadow-emerald-950/60 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  Sending SMS Code...
                </>
              ) : (
                <>
                  Send OTP Code
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider">
                  Enter 6-Digit SMS OTP
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setErrorMessage(null);
                  }}
                  className="text-xs text-emerald-400 hover:underline"
                >
                  Change Number
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  placeholder="• • • • • •"
                  maxLength={6}
                  required
                  autoFocus
                  className="w-full text-center tracking-[0.5em] text-xl font-bold py-3 px-4 rounded-xl bg-stone-950 border border-stone-800 text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <p className="text-xs text-stone-400 mt-2 text-center">
                OTP sent to <span className="font-semibold text-white">{phoneNumber}</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length < 6}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 font-semibold text-sm text-white shadow-lg shadow-emerald-950/60 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  Verifying OTP...
                </>
              ) : (
                <>
                  Verify & Enter
                  <CheckCircle className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Resend Option with Timer */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-800 text-xs">
              <span className="text-stone-400">Didn't receive SMS?</span>
              {resendTimer > 0 ? (
                <span className="text-stone-500 font-mono">Resend in {resendTimer}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  className="text-emerald-400 font-medium hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  Resend OTP
                </button>
              )}
            </div>
          </form>
        )}

        <div className="mt-5 pt-3 border-t border-stone-800/80 text-center">
          <p className="text-[11px] text-stone-400 leading-normal">
            By proceeding, you agree to SRA Goat Terms and Marketplace Disclaimer. All listings are for live animals only.
          </p>
        </div>
      </div>
    </div>
  );
};
