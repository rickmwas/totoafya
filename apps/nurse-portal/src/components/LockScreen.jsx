import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Lock, Unlock, ShieldAlert, BadgePlus, LogOut } from 'lucide-react';

export default function LockScreen() {
  const { user, unlockWithPin, loginWithBadge, logout } = useAuth();
  const [pin, setPin] = useState('');
  const [badgeToken, setBadgeToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showBadgeInput, setShowBadgeInput] = useState(false);

  const handleKeyPress = (num) => {
    if (pin.length < 6) {
      setPin((prev) => prev + num);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
  };

  const handleUnlock = async (e) => {
    if (e) e.preventDefault();
    if (!pin) return;
    setLoading(true);
    setError('');
    try {
      await unlockWithPin(pin);
    } catch (err) {
      setError(err.message || 'Incorrect PIN code');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  const handleBadgeLogin = async (e) => {
    if (e) e.preventDefault();
    if (!badgeToken) return;
    setLoading(true);
    setError('');
    try {
      await loginWithBadge(badgeToken);
    } catch (err) {
      setError(err.message || 'Badge not recognized');
      setBadgeToken('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-[9999] font-sans text-white p-4">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black opacity-90" />
      
      <div className="relative w-full max-w-[420px] bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl flex flex-col items-center">
        {/* User profile avatar */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg">
            <span className="text-3xl font-bold font-serif">{user?.full_name ? user.full_name[0] : 'N'}</span>
          </div>
          <div className="absolute -bottom-1 -right-1 bg-amber-500 w-6 h-6 rounded-full flex items-center justify-center border-2 border-slate-900 shadow">
            <Lock className="w-3.5 h-3.5 text-slate-950" />
          </div>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold tracking-tight text-white">{user?.full_name || 'Clinic Nurse'}</h2>
          <p className="text-xs text-slate-400 mt-1">Session Locked • Enter PIN to unlock</p>
        </div>

        {error && (
          <div className="w-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs px-4 py-3 rounded-xl mb-6 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <p className="font-medium leading-relaxed">{error}</p>
          </div>
        )}

        {!showBadgeInput ? (
          /* PIN Input Screen */
          <div className="w-full flex flex-col items-center">
            {/* Dots */}
            <div className="flex gap-4 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`w-3.5 h-3.5 rounded-full border border-slate-700 transition-all duration-150 ${
                    pin.length >= i ? 'bg-emerald-500 border-emerald-500 scale-110 shadow-[0_0_8px_#10b981]' : 'bg-transparent'
                  }`}
                />
              ))}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-4 w-full max-w-[280px] mb-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeyPress(num)}
                  className="w-16 h-16 rounded-full bg-slate-800/40 hover:bg-slate-800 border border-slate-800 text-xl font-semibold flex items-center justify-center active:scale-95 transition-all text-slate-200"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={handleClear}
                className="w-16 h-16 rounded-full text-xs font-semibold flex items-center justify-center text-slate-500 hover:text-slate-300 active:scale-95 transition-all"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => handleKeyPress(0)}
                className="w-16 h-16 rounded-full bg-slate-800/40 hover:bg-slate-800 border border-slate-800 text-xl font-semibold flex items-center justify-center active:scale-95 transition-all text-slate-200"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="w-16 h-16 rounded-full text-xs font-semibold flex items-center justify-center text-slate-500 hover:text-slate-300 active:scale-95 transition-all"
              >
                Delete
              </button>
            </div>

            <button
              onClick={handleUnlock}
              disabled={pin.length < 4 || loading}
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Unlock Station</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* Badge Scan Screen */
          <form onSubmit={handleBadgeLogin} className="w-full flex flex-col items-center">
            <div className="w-full mb-6">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                NFC Badge Tag ID
              </label>
              <input
                type="text"
                autoFocus
                placeholder="Scan card or type badge token..."
                value={badgeToken}
                onChange={(e) => setBadgeToken(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-slate-800/60 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-600 transition-all font-mono"
              />
            </div>

            <div className="flex gap-3 w-full">
              <button
                type="button"
                onClick={() => setShowBadgeInput(false)}
                className="flex-1 h-12 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition-all"
              >
                PIN Entry
              </button>
              <button
                type="submit"
                disabled={!badgeToken || loading}
                className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Verify Badge</span>
                )}
              </button>
            </div>
          </form>
        )}

        <div className="flex justify-between w-full mt-8 pt-6 border-t border-slate-800/60">
          <button
            onClick={() => setShowBadgeInput(!showBadgeInput)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-all"
          >
            <BadgePlus className="w-4 h-4" />
            <span>{showBadgeInput ? "Switch to PIN" : "Scan Badge Card"}</span>
          </button>
          
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
