"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import OnboardingFlow from "@/components/auth/Onboarding-flow";



// Import the enhanced types
interface UserSizes {
  tops: string[];
  bottoms: string[];
  shoes: string[];
  outerwear: string[];
  dresses: string[];
}

interface OnboardingFormData {
  username: string;
  bio: string;
  gender: string;
  ageGroup: string;
  aesthetics: string[];
  sizes: UserSizes;
  [key: string]: any;
}

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Check if the user is authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      // Redirect to login if not authenticated
      router.push('/');
    }
  }, [status, router]);

  const handleOnboardingComplete = async (formData: OnboardingFormData) => {
    try {
      // Here you would typically save the data to your backend
      // await fetch('/api/user/profile', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${session?.accessToken}`
      //   },
      //   body: JSON.stringify(formData)
      // });
      
      console.log("Onboarding completed with data:", formData);
      
      // In a real app, you might want to save this to localStorage as well
      // for quick client-side access
      localStorage.setItem('userPreferences', JSON.stringify({
        aesthetics: formData.aesthetics,
        sizes: formData.sizes,
        ageGroup: formData.ageGroup
      }));
      
      // Redirect to profile after successful onboarding
      router.push('/profile');
    } catch (error) {
      console.error("Error saving onboarding data:", error);
      // Still redirect even if there's an error (or handle differently)
      router.push('/profile');
    }
  };

  const handleOnboardingSkip = (partialData: Partial<OnboardingFormData>) => {
    console.log("Onboarding skipped with partial data:", partialData);
    
    // Save whatever partial data was provided
    if (Object.keys(partialData).length > 0) {
      // await fetch('/api/user/profile', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${session?.accessToken}`
      //   },
      //   body: JSON.stringify(partialData)
      // });
      
      // Save to localStorage for client-side access
      localStorage.setItem('userPreferences', JSON.stringify({
        aesthetics: partialData.aesthetics || [],
        sizes: partialData.sizes || {},
        ageGroup: partialData.ageGroup || ""
      }));
    }
    
    // Redirect to dashboard regardless
    router.push('/dashboard');
  };

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-lg text-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Show onboarding if authenticated
  if (status === "authenticated") {
    return (
      <OnboardingFlow 
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
        // You could load initial data from a previous session if needed
        // initialData={previousData}
        // You can also customize which steps to show
        steps={["profile", "gender", "ageGroup", "aesthetics", "sizes"]}
      />
    );
  }

  // This should never display due to the redirect in useEffect
  return null;
}