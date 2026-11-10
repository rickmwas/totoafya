import React, { useState } from 'react';
import { PillButton } from '@totoafya/shared-ui';
import {
  LockShieldIcon,
  FingerprintIcon,
  EyeIcon,
  EyeOffIcon,
  BackspaceIcon,
} from './icons';

/**
 * SCR-02: 4-Digit Quick PIN Creation / Login Screen
 *
 * Implements:
 * - 4 circular tactile dot indicators (16px diameter)
 * - 68px diameter numeric keypad buttons (high-contrast, >48x48px touch target)
 * - Two-phase creation flow: Step 1 (Enter PIN) -> Step 2 (Confirm PIN)
 * - Mismatch validation and shake/error feedback
 * - Biometric unlock quick toggle option
 * - Discreet / Private view masking toggle
 * - Zero Unicode emojis
 */

export function SCR02PinLock({
  mode = 'create', // 'create' | 'login'
  lang = 'en',
  onPinComplete,
  onBack,
  onForgotPassword,
}) {
  const isSw = lang === 'sw';

  // In create mode: phase 1 is initial PIN entry, phase 2 is confirmation
  const [phase, setPhase] = useState(1);
  const [firstPin, setFirstPin] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasError, setHasError] = useState(false);

  const handleDigitPress = (digit) => {
    if (currentPin.length >= 4) return;
    setErrorMessage('');
    setHasError(false);

    const nextPin = currentPin + digit;
    setCurrentPin(nextPin);

    if (nextPin.length === 4) {
      if (mode === 'login') {
        // Direct complete for login mode
        if (onPinComplete) onPinComplete(nextPin, { biometricEnabled });
      } else if (mode === 'create') {
        if (phase === 1) {
          // Store first PIN and transition to confirmation phase
          setFirstPin(nextPin);
          setTimeout(() => {
            setCurrentPin('');
            setPhase(2);
          }, 200);
        } else if (phase === 2) {
          // Check if confirmation matches first PIN
          if (nextPin === firstPin) {
            if (onPinComplete) {
              onPinComplete(nextPin, { biometricEnabled });
            }
          } else {
            // Mismatch error
            setHasError(true);
            setErrorMessage(
              isSw
                ? 'PIN hazilingani. Tafadhali weka upya.'
                : 'PIN numbers do not match. Please try again.'
            );
            setTimeout(() => {
              setCurrentPin('');
              setFirstPin('');
              setPhase(1);
              setHasError(false);
            }, 1200);
          }
        }
      }
    }
  };

  const handleBackspace = () => {
    if (currentPin.length > 0) {
      setCurrentPin((prev) => prev.slice(0, -1));
      setErrorMessage('');
      setHasError(false);
    }
  };

  const handleClear = () => {
    setCurrentPin('');
    setErrorMessage('');
    setHasError(false);
  };

  const handleBiometricToggle = () => {
    setBiometricEnabled((prev) => !prev);
  };

  const titleText =
    mode === 'login'
      ? isSw
        ? 'Karibu Tena'
        : 'Welcome Back'
      : phase === 1
      ? isSw
        ? 'Weka PIN ya Tarakimu 4'
        : 'Create Your 4-Digit PIN'
      : isSw
      ? 'Thibitisha PIN Yako'
      : 'Re-enter Your 4-Digit PIN';

  const subtitleText =
    mode === 'login'
      ? isSw
        ? 'Weka PIN yako ya tarakimu 4 ili kufungua kumbukumbu za faragha'
        : 'Enter your 4-digit PIN to access private records'
      : phase === 1
      ? isSw
        ? 'Linda taarifa za afya ya familia yako kwenye simu ya pamoja'
        : 'Protect your family health privacy on shared family phones'
      : isSw
      ? 'Weka tarakimu 4 zile zile ili kuthibitisha'
      : 'Enter the same 4 digits to confirm your security PIN';

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-between px-6 py-6"
      style={{ backgroundColor: '#F9F8F5', color: '#1A202C' }}
      data-testid="scr02-pin-lock"
    >
      {/* Header & Back Action */}
      <div>
        <div className="flex items-center justify-between mb-4">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="min-h-[48px] min-w-[48px] flex items-center gap-1.5 text-sm font-semibold text-[#006B5F] hover:text-[#004D44] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5F] rounded-lg"
              aria-label={isSw ? 'Rudi nyuma' : 'Go back'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>{isSw ? 'Nyuma' : 'Back'}</span>
            </button>
          ) : (
            <div className="w-12 h-12" />
          )}

          {/* Discreet Privacy Toggle Pill */}
          <button
            type="button"
            onClick={() => setIsPrivate(!isPrivate)}
            className="min-h-[48px] min-w-[48px] px-4 py-2.5 inline-flex items-center justify-center gap-2 bg-white border border-[#E2E8F0] rounded-full text-xs font-medium text-[#4A5568] hover:bg-[#F1EFEA] shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5F]"
            aria-pressed={isPrivate}
            aria-label={isSw ? 'Badili mwonekano wa faragha' : 'Toggle privacy view'}
          >
            {isPrivate ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
            <span>{isPrivate ? (isSw ? 'Faragha' : 'Private View') : (isSw ? 'Wazi' : 'Show Digits')}</span>
          </button>
        </div>

        {/* Title & Guidance */}
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-[#E6F4F1] flex items-center justify-center mb-3">
            <LockShieldIcon size={26} color="#006B5F" />
          </div>

          <h2
            className="text-xl font-bold text-[#1A202C] mb-1.5"
            style={{ fontFamily: "'Merriweather', Georgia, serif" }}
          >
            {titleText}
          </h2>
          <p className="text-xs text-[#4A5568] max-w-xs leading-relaxed">
            {subtitleText}
          </p>

          {/* Phase Badge (in create mode) */}
          {mode === 'create' && (
            <div className="mt-2.5 inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E6F4F1] text-[#006B5F]">
              {phase === 1
                ? isSw
                  ? 'Hatua 1 kati ya 2: Chagua PIN'
                  : 'Step 1 of 2: Enter PIN'
                : isSw
                ? 'Hatua 2 kati ya 2: Thibitisha PIN'
                : 'Step 2 of 2: Confirm PIN'}
            </div>
          )}
        </div>

        {/* 4 Tactile Dot Indicators */}
        <div className="flex flex-col items-center my-6">
          <div
            className={`flex items-center justify-center gap-5 transition-transform duration-200 ${
              hasError ? 'animate-shake' : ''
            }`}
            role="status"
            aria-label={`PIN entry: ${currentPin.length} of 4 digits entered`}
            data-testid="pin-dots-container"
          >
            {[0, 1, 2, 3].map((index) => {
              const isFilled = index < currentPin.length;
              const digitVal = currentPin[index];

              return (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200 ${
                    hasError
                      ? 'bg-[#DC2626] border-2 border-[#DC2626] scale-110'
                      : isFilled
                      ? 'bg-[#006B5F] border-2 border-[#006B5F] scale-110 shadow-sm'
                      : 'bg-transparent border-2 border-[#CBD5E1]'
                  }`}
                  data-testid={`pin-dot-${index}`}
                >
                  {isFilled && !isPrivate && !hasError && (
                    <span className="text-[9px] font-bold text-white">
                      {digitVal}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Error Message Feedback */}
          {errorMessage ? (
            <p
              className="mt-3 text-xs font-semibold text-[#DC2626] text-center"
              role="alert"
              data-testid="pin-error-message"
            >
              {errorMessage}
            </p>
          ) : (
            <div className="h-4 mt-3" />
          )}
        </div>
      </div>

      {/* 3x4 High-Contrast Keypad */}
      <div className="w-full max-w-[290px] mx-auto pb-2">
        <div className="grid grid-cols-3 gap-3 justify-items-center mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigitPress(digit.toString())}
              className="w-[68px] h-[68px] min-h-[48px] min-w-[48px] rounded-full bg-white border border-[#E2E8F0] shadow-[0_2px_4px_rgba(0,0,0,0.04)] text-2xl font-bold text-[#1A202C] active:scale-95 active:bg-[#E6F4F1] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5F] transition-all flex items-center justify-center"
              data-testid={`keypad-${digit}`}
              aria-label={`Digit ${digit}`}
            >
              {digit}
            </button>
          ))}

          {/* Bottom Row: Clear / Biometrics, '0', Backspace */}
          <button
            type="button"
            onClick={handleClear}
            className="w-[68px] h-[68px] min-h-[48px] min-w-[48px] rounded-full bg-white border border-[#E2E8F0] text-xs font-semibold text-[#4A5568] active:scale-95 active:bg-[#F1EFEA] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5F] transition-all flex flex-col items-center justify-center"
            data-testid="keypad-clear"
            aria-label={isSw ? 'Futa yote' : 'Clear all'}
          >
            <span>{isSw ? 'Futa' : 'Clear'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleDigitPress('0')}
            className="w-[68px] h-[68px] min-h-[48px] min-w-[48px] rounded-full bg-white border border-[#E2E8F0] shadow-[0_2px_4px_rgba(0,0,0,0.04)] text-2xl font-bold text-[#1A202C] active:scale-95 active:bg-[#E6F4F1] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5F] transition-all flex items-center justify-center"
            data-testid="keypad-0"
            aria-label="Digit 0"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleBackspace}
            className="w-[68px] h-[68px] min-h-[48px] min-w-[48px] rounded-full bg-white border border-[#E2E8F0] active:scale-95 active:bg-[#F1EFEA] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006B5F] transition-all flex items-center justify-center"
            data-testid="keypad-backspace"
            aria-label={isSw ? 'Futa tarakimu iliyotangulia' : 'Backspace'}
          >
            <BackspaceIcon size={22} color="#1A202C" />
          </button>
        </div>

        {/* Biometric Toggle Option */}
        <label className="flex items-center justify-center gap-3 py-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={biometricEnabled}
            onChange={handleBiometricToggle}
            className="w-4 h-4 rounded text-[#006B5F] focus:ring-[#006B5F] border-[#CBD5E1]"
            aria-label={isSw ? 'Washa alama za vidole' : 'Enable biometric unlock'}
          />
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#4A5568]">
            <FingerprintIcon size={16} color="#006B5F" />
            <span>
              {isSw
                ? 'Washa Utambuzi wa Alama za Vidole'
                : 'Enable Fingerprint / Face Unlock'}
            </span>
          </div>
        </label>

        {mode === 'login' && onForgotPassword && (
          <div className="text-center mt-1">
            <button
              type="button"
              onClick={onForgotPassword}
              className="min-h-[48px] px-2 text-xs font-semibold text-[#006B5F] hover:underline"
            >
              {isSw ? 'Umesahau PIN?' : 'Forgot PIN?'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SCR02PinLock;
