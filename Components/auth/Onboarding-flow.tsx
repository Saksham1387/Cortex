"use client";
import React, { useState, FormEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { X, ArrowRight, Check, Plus, Minus } from "lucide-react";

// Define the type interfaces
interface UserSizes {
  tops: string[];
  bottoms: string[];
  shoes: string[];
  outerwear: string[];
  dresses: string[];
}

export interface OnboardingFormData {
  username: string;
  bio: string;
  gender: string;
  ageGroup: string;
  aesthetics: string[];
  sizes: UserSizes;
  [key: string]: any; // Allow for extensibility
}

interface OnboardingFlowProps {
  onComplete: (formData: OnboardingFormData) => void;
  onSkip: (partialData: Partial<OnboardingFormData>) => void;
  initialData?: Partial<OnboardingFormData>;
  steps?: Array<"profile" | "gender" | "ageGroup" | "aesthetics" | "sizes">;
}

interface StepProps {
  formData: OnboardingFormData;
  handleInputChange: (field: string, value: string) => void;
  handleMultiSizeChange: (type: keyof UserSizes, value: string) => void;
  handleAestheticToggle: (aesthetic: string) => void;
}

interface LabelInputContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * Onboarding flow component with multiple steps
 */
export default function OnboardingFlow({ 
  onComplete, 
  onSkip, 
  initialData = {}, 
  steps = ["profile", "gender", "ageGroup", "aesthetics", "sizes"] 
}: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<OnboardingFormData>({
    username: "",
    bio: "",
    gender: "",
    ageGroup: "",
    aesthetics: [],
    sizes: {
      tops: [],
      bottoms: [],
      shoes: [],
      outerwear: [],
      dresses: []
    },
    ...initialData // Merge any initial data provided
  });

  // Step definitions and their order can be customized
  const stepComponents: Record<string, React.ComponentType<StepProps>> = {
    profile: ProfileStep,
    gender: GenderStep,
    ageGroup: AgeGroupStep,
    aesthetics: AestheticsStep,
    sizes: SizesStep
  };

  // Generate active steps based on props
  const activeSteps = steps.map(step => stepComponents[step]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMultiSizeChange = (type: keyof UserSizes, value: string) => {
    setFormData(prev => {
      const currentSizes = [...prev.sizes[type]];
      
      // Toggle size selection
      if (currentSizes.includes(value)) {
        return {
          ...prev,
          sizes: {
            ...prev.sizes,
            [type]: currentSizes.filter(size => size !== value)
          }
        };
      } else {
        return {
          ...prev,
          sizes: {
            ...prev.sizes,
            [type]: [...currentSizes, value]
          }
        };
      }
    });
  };

  const handleAestheticToggle = (aesthetic: string) => {
    setFormData(prev => {
      if (prev.aesthetics.includes(aesthetic)) {
        return {
          ...prev,
          aesthetics: prev.aesthetics.filter(item => item !== aesthetic)
        };
      } else {
        return {
          ...prev,
          aesthetics: [...prev.aesthetics, aesthetic]
        };
      }
    });
  };

  const nextStep = () => {
    if (currentStep < activeSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding - call the provided callback with the data
      onComplete?.(formData);
    }
  };

  const skipStep = () => {
    nextStep();
  };

  const closeOnboarding = () => {
    // Call the provided skip callback with the partial data
    onSkip?.(formData);
  };

  // Handle form submission on complete button click
  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // For the final step, you could do validation here
    if (currentStep === activeSteps.length - 1) {
      onComplete?.(formData);
    } else {
      nextStep();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-lg w-full overflow-hidden relative">
        {/* Close button */}
        <button 
          onClick={closeOnboarding}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress indicator */}
        <div className="flex w-full">
          {activeSteps.map((_, index) => (
            <div 
              key={index}
              className={`h-1 flex-1 ${
                index <= currentStep ? "bg-blue-500" : "bg-gray-200 dark:bg-zinc-700"
              }`}
            />
          ))}
        </div>

        <form onSubmit={handleFormSubmit}>
          <div className="p-6">
            {/* Render the current step component */}
            {activeSteps[currentStep] && 
              React.createElement(activeSteps[currentStep], {
                formData,
                handleInputChange,
                handleMultiSizeChange,
                handleAestheticToggle
              })
            }

            {/* Navigation buttons */}
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={skipStep}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                {currentStep < activeSteps.length - 1 ? "Skip" : "Skip for now"}
              </button>
              
              <button
                type="submit"
                className="inline-flex items-center text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-medium"
              >
                {currentStep < activeSteps.length - 1 ? (
                  <>
                    Continue <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                ) : (
                  "Complete"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// Step 1: Username and Bio
function ProfileStep({ formData, handleInputChange }: StepProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white">Tell us about yourself</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Let's set up your profile. You can always change this later.
      </p>
      
      <div className="space-y-4 mt-6">
        <LabelInputContainer>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Username
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => handleInputChange("username", e.target.value)}
            placeholder="Choose a username"
            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 
                      bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-200"
          />
        </LabelInputContainer>
        
        <LabelInputContainer>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleInputChange("bio", e.target.value)}
            placeholder="Tell us a bit about yourself"
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 
                      bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-200"
          />
        </LabelInputContainer>
      </div>
    </div>
  );
}

// Step 2: Gender
function GenderStep({ formData, handleInputChange }: StepProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white">What's your gender?</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        This helps us personalize your style recommendations.
      </p>
      
      <div className="grid grid-cols-2 gap-3 mt-6">
        {["Male", "Female", "Non-binary", "Prefer not to say"].map((gender) => (
          <button
            key={gender}
            type="button"
            onClick={() => handleInputChange("gender", gender)}
            className={cn(
              "py-3 px-4 rounded-lg border text-sm font-medium transition-all",
              formData.gender === gender
                ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                : "border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800"
            )}
          >
            {gender}
          </button>
        ))}
      </div>
    </div>
  );
}

// New Step: Age Group
function AgeGroupStep({ formData, handleInputChange }: StepProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white">What's your age group?</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        This helps us tailor style recommendations to your life stage.
      </p>
      
      <div className="grid grid-cols-2 gap-3 mt-6">
        {["Under 18", "18-24", "25-34", "35-44", "45-54", "55+", "Prefer not to say"].map((ageGroup) => (
          <button
            key={ageGroup}
            type="button"
            onClick={() => handleInputChange("ageGroup", ageGroup)}
            className={cn(
              "py-3 px-4 rounded-lg border text-sm font-medium transition-all",
              formData.ageGroup === ageGroup
                ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                : "border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800"
            )}
          >
            {ageGroup}
          </button>
        ))}
      </div>
    </div>
  );
}

// Step 3: Aesthetics (expanded)
function AestheticsStep({ formData, handleAestheticToggle }: StepProps) {
  // Expanded list of aesthetics with more variety
  const aesthetics = [
    "Streetwear", "Minimal", "Vintage", "Business Casual", 
    "Athleisure", "Bohemian", "Preppy", "Eclectic",
    "Cottagecore", "Normcore", "Y2K", "Goth",
    "Techwear", "Academia", "Skater", "Grunge",
    "Romantic", "E-Girl/Boy", "Androgynous", "Retro"
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white">What styles interest you?</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Select all that appeal to you. This helps us curate your feed.
      </p>
      
      <div className="grid grid-cols-2 gap-3 mt-6 max-h-96 overflow-y-auto pr-2">
        {aesthetics.map((style) => (
          <button
            key={style}
            type="button"
            onClick={() => handleAestheticToggle(style)}
            className={cn(
              "py-3 px-4 rounded-lg border text-sm font-medium transition-all flex items-center justify-center",
              formData.aesthetics.includes(style)
                ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                : "border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800"
            )}
          >
            <div className="flex items-center">
              {formData.aesthetics.includes(style) ? (
                <Check className="w-4 h-4 mr-2 flex-shrink-0" />
              ) : (
                <Plus className="w-4 h-4 mr-2 flex-shrink-0" />
              )}
              <span>{style}</span>
            </div>
          </button>
        ))}
      </div>

      {formData.aesthetics.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-zinc-700">
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
            Your selected styles ({formData.aesthetics.length}):
          </p>
          <div className="flex flex-wrap gap-2">
            {formData.aesthetics.map(style => (
              <span 
                key={style}
                className="inline-flex items-center bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 text-xs px-2.5 py-1 rounded-full"
              >
                {style}
                <button
                  onClick={() => handleAestheticToggle(style)}
                  className="ml-1.5 text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Step 4: Sizes (expanded with multi-select)
function SizesStep({ formData, handleMultiSizeChange }: StepProps) {
  // Size options for different categories
  const sizeOptions = {
    tops: ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
    bottoms: ["24", "26", "28", "30", "32", "34", "36", "38", "40", "42", "44"],
    shoes: ["5", "6", "7", "8", "9", "10", "11", "12", "13", "14"],
    outerwear: ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
    dresses: ["0", "2", "4", "6", "8", "10", "12", "14", "16", "18", "20"]
  };

  // Size category labels
  const categoryLabels = {
    tops: "Tops",
    bottoms: "Bottoms",
    shoes: "Shoes",
    outerwear: "Outerwear",
    dresses: "Dresses"
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white">What sizes do you wear?</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Select all sizes that fit you. This helps us recommend items in your size.
      </p>
      
      <div className="space-y-6 mt-6 max-h-96 overflow-y-auto pr-2">
        {(Object.keys(sizeOptions) as Array<keyof typeof sizeOptions>).map((category) => (
          <div key={category} className="space-y-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {categoryLabels[category]}
            </label>
            
            <div className="flex flex-wrap gap-2">
              {sizeOptions[category].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleMultiSizeChange(category, size)}
                  className={cn(
                    "px-3 py-2 rounded-lg border text-sm font-medium transition-all",
                    formData.sizes[category].includes(size)
                      ? "border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                      : "border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {Object.values(formData.sizes).some(arr => arr.length > 0) && (
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-zinc-700">
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
            Your selected sizes:
          </p>
          <div className="space-y-2">
            {(Object.keys(formData.sizes) as Array<keyof UserSizes>).map(category => 
              formData.sizes[category].length > 0 && (
                <div key={category} className="flex items-center">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-20">
                    {categoryLabels[category]}:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {formData.sizes[category].map(size => (
                      <span 
                        key={size}
                        className="inline-flex items-center bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full"
                      >
                        {size}
                      </span>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const LabelInputContainer = ({
  children,
  className,
}: LabelInputContainerProps) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};