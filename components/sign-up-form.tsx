"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Mail, Lock, User, Scroll } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

// ================================
// TYPES & INTERFACES
// ================================
interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  repeatPassword: string;
}

interface SignUpFormProps {
  // onSuccess?: () => void;
  redirectTo?: string;
  className?: string;
}

interface FormFieldProps {
  id: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  icon: React.ComponentType<{ className?: string }>;
  required?: boolean;
  disabled?: boolean;
}

// interface AuthErrorType {
//   message: string;
//   status?: number;
// }

// ================================
// CONSTANTS & CONFIGURATION
// ================================
const FORM_CONFIG = {
  emailRedirectPath: "/protected",
  successRedirectPath: "/auth/sign-up-success",
  loginPath: "/auth/login",
} as const;

const VALIDATION_RULES = {
  minPasswordLength: 8,
  emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

const LOADING_MESSAGES = {
  signUp: "Creating Account...",
  googleAuth: "Connecting with Google...",
} as const;

const ERROR_MESSAGES = {
  passwordMismatch: "Passwords do not match",
  weakPassword: `Password must be at least ${VALIDATION_RULES.minPasswordLength} characters long`,
  invalidEmail: "Please enter a valid email address",
  genericError: "An error occurred. Please try again",
} as const;

// ================================
// UTILITY FUNCTIONS
// ================================
const validateEmail = (email: string): boolean => {
  return VALIDATION_RULES.emailPattern.test(email);
};

const validatePassword = (password: string): boolean => {
  return password.length >= VALIDATION_RULES.minPasswordLength;
};

const validateForm = (formData: SignUpFormData): string | null => {
  const { name, email, password, repeatPassword } = formData;

  if (!name.trim()) return "Name is required";
  if (!email.trim()) return "Email is required";
  if (!validateEmail(email)) return ERROR_MESSAGES.invalidEmail;
  if (!password) return "Password is required";
  if (!validatePassword(password)) return ERROR_MESSAGES.weakPassword;
  if (password !== repeatPassword) return ERROR_MESSAGES.passwordMismatch;

  return null;
};

const formatAuthError = (error: unknown): string => {
  if (error instanceof Error) {
    // Handle specific Supabase auth errors
    switch (error.message) {
      case "User already registered":
        return "An account with this email already exists";
      case "Invalid login credentials":
        return "Invalid email or password";
      case "Email not confirmed":
        return "Please check your email and confirm your account";
      default:
        return error.message;
    }
  }
  return ERROR_MESSAGES.genericError;
};

const getSupabaseClient = () => createClient();

// ================================
// SUB-COMPONENTS
// ================================
const FormField: React.FC<FormFieldProps> = ({
  id,
  type,
  placeholder,
  value,
  onChange,
  icon: Icon,
  required = false,
  disabled = false,
}) => (
  <div className="relative">
    <Icon className="absolute left-3 top-3 h-5 w-5 text-amber-600" />
    <Input
      id={id}
      type={type}
      placeholder={placeholder}
      className="pl-12 h-12 text-lg border-amber-200 focus:border-amber-500"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      disabled={disabled}
    />
  </div>
);

interface AuthHeaderProps {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({
  title,
  icon: Icon = Scroll,
}) => (
  <CardHeader>
    <div className="flex items-center justify-center mb-2">
      <Icon className="w-12 h-12 text-amber-700" />
    </div>
    <CardTitle className="font-cinzel text-center text-4xl text-amber-900">
      {title}
    </CardTitle>
  </CardHeader>
);

interface ErrorDisplayProps {
  error: string | null;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  if (!error) return null;

  return (
    <div className="p-3 rounded-md bg-red-50 border border-red-200">
      <p className="text-sm text-red-600">{error}</p>
    </div>
  );
};

// interface SocialAuthButtonProps {
//   provider: string;
//   onClick: () => void;
//   isLoading: boolean;
//   disabled?: boolean;
// }

// const SocialAuthButton: React.FC<SocialAuthButtonProps> = ({
//   provider,
//   onClick,
//   isLoading,
//   disabled = false,
// }) => (
//   <Button
//     onClick={onClick}
//     variant="outline"
//     className="w-full border-amber-200 hover:bg-amber-50 font-crimson bg-transparent text-lg"
//     disabled={isLoading || disabled}
//   >
//     {isLoading ? LOADING_MESSAGES.googleAuth : `Continue with ${provider}`}
//   </Button>
// );

// const AuthDivider: React.FC = () => (
//   <div className="relative my-6">
//     <div className="absolute inset-0 flex items-center">
//       <span className="w-full border-t border-amber-200" />
//     </div>
//     <div className="relative flex justify-center text-base uppercase">
//       <span className="bg-white px-2 text-amber-600 font-crimson">
//         Or continue with
//       </span>
//     </div>
//   </div>
// );

interface AuthFooterProps {
  linkText: string;
  linkHref: string;
  prefixText: string;
}

const AuthFooter: React.FC<AuthFooterProps> = ({
  linkText,
  linkHref,
  prefixText,
}) => (
  <div className="mt-4 text-center text-base">
    {prefixText}{" "}
    <Link
      href={linkHref}
      className="underline underline-offset-4 text-amber-700 hover:text-amber-800"
    >
      {linkText}
    </Link>
  </div>
);

// ================================
// CUSTOM HOOKS
// ================================
const useSignUpForm = (redirectTo?: string) => {
  const [formData, setFormData] = useState<SignUpFormData>({
    name: "",
    email: "",
    password: "",
    repeatPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = getSupabaseClient();

  const updateField = (field: keyof SignUpFormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate form
    const validationError = validateForm(formData);
    if (validationError) {
      setError(validationError);
      setIsLoading(false);
      return;
    }

    try {
      const { error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}${
            redirectTo || FORM_CONFIG.emailRedirectPath
          }`,
          data: {
            name: formData.name.trim(),
          },
        },
      });

      if (authError) throw authError;

      router.push(FORM_CONFIG.successRedirectPath);
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}${
            redirectTo || FORM_CONFIG.emailRedirectPath
          }`,
        },
      });

      if (authError) throw authError;
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    error,
    isLoading,
    updateField,
    handleSignUp,
    handleGoogleAuth,
  };
};

// ================================
// MAIN COMPONENT
// ================================
export const SignUpForm: React.FC<SignUpFormProps> = ({
  // onSuccess,
  redirectTo,
  className = "",
}) => {
  const {
    formData,
    error,
    isLoading,
    updateField,
    handleSignUp,
    // handleGoogleAuth,
  } = useSignUpForm(redirectTo);

  return (
    <Card
      className={`fantasy-border bg-white/90 backdrop-blur-sm ${className}`}
    >
      <AuthHeader title="Begin Your Quest" />

      <CardContent className="space-y-4 p-8">
        <form onSubmit={handleSignUp} className="space-y-5">
          <FormField
            id="name"
            type="text"
            placeholder="Your name"
            value={formData.name}
            onChange={updateField("name")}
            icon={User}
            required
            disabled={isLoading}
          />

          <FormField
            id="email"
            type="email"
            placeholder="Your email"
            value={formData.email}
            onChange={updateField("email")}
            icon={Mail}
            required
            disabled={isLoading}
          />

          <FormField
            id="password"
            type="password"
            placeholder="Create password"
            value={formData.password}
            onChange={updateField("password")}
            icon={Lock}
            required
            disabled={isLoading}
          />

          <FormField
            id="repeat-password"
            type="password"
            placeholder="Repeat password"
            value={formData.repeatPassword}
            onChange={updateField("repeatPassword")}
            icon={Lock}
            required
            disabled={isLoading}
          />

          <ErrorDisplay error={error} />

          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 font-crimson text-lg"
            disabled={isLoading}
          >
            {isLoading ? LOADING_MESSAGES.signUp : "Sign Up"}
          </Button>
        </form>

        {/* <AuthDivider /> */}

        {/* <SocialAuthButton
          provider="Google"
          onClick={handleGoogleAuth}
          isLoading={isLoading}
        /> */}

        <AuthFooter
          prefixText="Already have an account?"
          linkText="Login"
          linkHref={FORM_CONFIG.loginPath}
        />
      </CardContent>
    </Card>
  );
};

export default SignUpForm;
