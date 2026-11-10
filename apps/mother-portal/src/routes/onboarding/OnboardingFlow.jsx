import React, { useState, useEffect } from 'react';
import { dataClient } from '@totoafya/api-client';
import { SCR01Welcome } from './SCR01Welcome';
import { SCR02PinLock } from './SCR02PinLock';
import { SCR03RoleSelection } from './SCR03RoleSelection';
import { SCR04PregnancySetup } from './SCR04PregnancySetup';
import { SCR05ChildSetup } from './SCR05ChildSetup';
import { SCR06AhaReveal } from './SCR06AhaReveal';

/**
 * OnboardingFlow — Master Coordinator Component for TotoAfya Onboarding (SCR-01 to SCR-06)
 *
 * Implements:
 * - Deterministic step sequencing: 1 -> 2 -> 3 -> 4/5 -> 6
 * - Step 1: SCR01Welcome (Language & Value Proposition)
 * - Step 2: SCR02PinLock (4-Digit PIN Setup & Biometrics)
 * - Step 3: SCR03RoleSelection (Caregiver Role Identification)
 * - Step 4: SCR04PregnancySetup (LMP Naegele, Ultrasound, or Guided Estimate)
 * - Step 5: SCR05ChildSetup (Child Profile & KEPI Auto-Population)
 * - Step 6: SCR06AhaReveal (Milestone summary & transition to dashboard)
 * - Persistence to @totoafya/api-client and localStorage offline storage
 * - Zero Unicode emojis across all steps
 */

export function OnboardingFlow({
  initialStep = 1,
  initialLang = 'en',
  onComplete,
  onNavigateLogin,
}) {
  // Global Onboarding State
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [lang, setLang] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('toto_lang') || initialLang;
    }
    return initialLang;
  });

  const [pinData, setPinData] = useState({
    pin: '',
    biometricEnabled: true,
  });

  const [selectedRole, setSelectedRole] = useState(null); // 'expecting' | 'child' | 'both' | 'skip'
  const [pregnancyData, setPregnancyData] = useState(null);
  const [childData, setChildData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync language changes to localStorage
  const handleLanguageChange = (newLang) => {
    setLang(newLang);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('toto_lang', newLang);
    }
  };

  // Step 1: Welcome actions
  const handleGetStarted = () => {
    setCurrentStep(2);
  };

  const handleLoginRedirect = () => {
    if (onNavigateLogin) {
      onNavigateLogin();
    } else {
      // Default to login mode in PIN screen
      setCurrentStep(2);
    }
  };

  // Step 2: PIN actions
  const handlePinComplete = (pin, options = {}) => {
    setPinData({
      pin,
      biometricEnabled: options.biometricEnabled ?? true,
    });
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('toto_pin', pin);
      localStorage.setItem(
        'toto_biometrics',
        options.biometricEnabled ? 'true' : 'false'
      );
    }
    setCurrentStep(3);
  };

  // Step 3: Role selection actions
  const handleRoleContinue = (role) => {
    setSelectedRole(role);
    if (role === 'expecting' || role === 'both') {
      setCurrentStep(4);
    } else if (role === 'child') {
      setCurrentStep(5);
    }
  };

  const handleRoleSkip = () => {
    setSelectedRole('skip');
    setCurrentStep(6);
  };

  // Step 4: Pregnancy setup actions
  const handlePregnancyComplete = (data) => {
    setPregnancyData(data);
    if (selectedRole === 'both') {
      setCurrentStep(5);
    } else {
      setCurrentStep(6);
    }
  };

  // Step 5: Child setup actions
  const handleChildComplete = (data) => {
    setChildData(data);
    setCurrentStep(6);
  };

  // Step 6: Complete Onboarding & Persist
  const handleEnterDashboard = async () => {
    setIsSubmitting(true);

    const fullJourneySummary = {
      lang,
      pin: pinData.pin,
      biometricEnabled: pinData.biometricEnabled,
      role: selectedRole,
      pregnancyData,
      childData,
      completedAt: new Date().toISOString(),
    };

    try {
      // Persist to local storage for immediate offline reliability
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('toto_onboarding_completed', 'true');
        localStorage.setItem(
          'toto_mother_profile',
          JSON.stringify({
            role: selectedRole,
            pregnancy: pregnancyData,
            completedAt: fullJourneySummary.completedAt,
          })
        );
        if (childData) {
          localStorage.setItem('toto_child_profile', JSON.stringify(childData));
        }
      }

      // Persist to @totoafya/api-client data repositories
      if (dataClient) {
        if (pregnancyData && dataClient.mothers?.create) {
          try {
            await dataClient.mothers.create({
              pregnancy_status: 'pregnant',
              edd: pregnancyData.edd,
              lmp: pregnancyData.lmp || null,
              gestational_age_weeks: pregnancyData.gestationalWeeks,
            });
          } catch (e) {
            console.warn('[OnboardingFlow] Mother profile sync deferred:', e);
          }
        }

        if (childData && dataClient.children?.create) {
          try {
            await dataClient.children.create({
              first_name: childData.firstName,
              dob: childData.dob,
              gender: childData.gender,
              birth_weight: childData.birthWeight,
            });
          } catch (e) {
            console.warn('[OnboardingFlow] Child profile sync deferred:', e);
          }
        }
      }
    } catch (err) {
      console.warn('[OnboardingFlow] Persistence notice:', err);
    } finally {
      setIsSubmitting(false);
      if (onComplete) {
        onComplete(fullJourneySummary);
      }
    }
  };

  // Back button routing logic
  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 4) {
      setCurrentStep(3);
    } else if (currentStep === 5) {
      if (selectedRole === 'both') {
        setCurrentStep(4);
      } else {
        setCurrentStep(3);
      }
    } else if (currentStep === 6) {
      if (selectedRole === 'child' || selectedRole === 'both') {
        setCurrentStep(5);
      } else if (selectedRole === 'expecting') {
        setCurrentStep(4);
      } else {
        setCurrentStep(3);
      }
    }
  };

  return (
    <div
      className="w-full max-w-[430px] min-h-screen mx-auto relative shadow-2xl overflow-hidden"
      style={{ backgroundColor: '#F9F8F5' }}
      data-testid="onboarding-flow-coordinator"
      data-current-step={currentStep}
    >
      {/* Step Progress Top Bar (Visible on Steps 2 through 5) */}
      {currentStep >= 2 && currentStep <= 5 && (
        <div className="w-full bg-[#E2E8F0] h-1.5 sticky top-0 z-20">
          <div
            className="bg-[#006B5F] h-1.5 transition-all duration-300 ease-out"
            style={{ width: `${(currentStep / 6) * 100}%` }}
            role="progressbar"
            aria-valuenow={currentStep}
            aria-valuemin={1}
            aria-valuemax={6}
          />
        </div>
      )}

      {/* Render Current Step */}
      {currentStep === 1 && (
        <SCR01Welcome
          lang={lang}
          onLanguageChange={handleLanguageChange}
          onGetStarted={handleGetStarted}
          onLogin={handleLoginRedirect}
        />
      )}

      {currentStep === 2 && (
        <SCR02PinLock
          mode="create"
          lang={lang}
          onPinComplete={handlePinComplete}
          onBack={handleBack}
        />
      )}

      {currentStep === 3 && (
        <SCR03RoleSelection
          selectedRole={selectedRole}
          lang={lang}
          onSelectRole={(r) => setSelectedRole(r)}
          onContinue={handleRoleContinue}
          onSkip={handleRoleSkip}
          onBack={handleBack}
        />
      )}

      {currentStep === 4 && (
        <SCR04PregnancySetup
          initialData={pregnancyData || {}}
          lang={lang}
          onComplete={handlePregnancyComplete}
          onBack={handleBack}
        />
      )}

      {currentStep === 5 && (
        <SCR05ChildSetup
          initialData={childData || {}}
          lang={lang}
          onComplete={handleChildComplete}
          onBack={handleBack}
        />
      )}

      {currentStep === 6 && (
        <SCR06AhaReveal
          journeyData={{
            role: selectedRole,
            pregnancyData,
            childData,
            pin: pinData.pin,
          }}
          lang={lang}
          onEnterDashboard={handleEnterDashboard}
        />
      )}
    </div>
  );
}

export default OnboardingFlow;
