"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Mail, Lock, Scroll } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

// ================================
// TYPES & INTERFACES
// ================================
interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
  className?: string;
  showSignUpLink?: boolean;
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

interface AuthErrorType {
  message: string;
  status?: number;
}

// ================================
// CONSTANTS & CONFIGURATION
// ================================
const FORM_CONFIG = {
  defaultRedirectPath: "/protected",
  signUpPath: "/auth/sign-up",
  forgotPasswordPath: "/auth/forgot-password",
} as const;

const VALIDATION_RULES = {
  emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

const LOADING_MESSAGES = {
  signIn: "Logging in...",
  googleAuth: "Connecting with Google...",
} as const;

const ERROR_MESSAGES = {
  invalidEmail: "Please enter a valid email address",
  requiredField: "This field is required",
  invalidCredentials: "Invalid email or password",
  emailNotConfirmed: "Please check your email and confirm your account",
  genericError: "An error occurred. Please try again",
} as const;

const UI_TEXT = {
  title: "Welcome Back, Hero",
  signInButton: "Sign In",
  googleButton: "Continue with Google",
  dividerText: "Or continue with",
  signUpPrompt: "Don't have an account?",
  signUpLink: "Sign up",
  forgotPasswordLink: "Forgot password?",
} as const;

// ================================
// UTILITY FUNCTIONS
// ================================
const validateEmail = (email: string): boolean => {
  return VALIDATION_RULES.emailPattern.test(email);
};

const validateForm = (formData: LoginFormData): string | null => {
  const { email, password } = formData;

  if (!email.trim()) return ERROR_MESSAGES.requiredField;
  if (!validateEmail(email)) return ERROR_MESSAGES.invalidEmail;
  if (!password) return ERROR_MESSAGES.requiredField;

  return null;
};

const formatAuthError = (error: unknown): string => {
  if (error instanceof Error) {
    // Handle specific Supabase auth errors
    switch (error.message) {
      case "Invalid login credentials":
        return ERROR_MESSAGES.invalidCredentials;
      case "Email not confirmed":
        return ERROR_MESSAGES.emailNotConfirmed;
      case "User not found":
        return ERROR_MESSAGES.invalidCredentials;
      case "Wrong password":
        return ERROR_MESSAGES.invalidCredentials;
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

interface AuthButtonProps {
  type?: "button" | "submit";
  onClick?: () => void;
  children: React.ReactNode;
  variant?: "primary" | "outline";
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

const AuthButton: React.FC<AuthButtonProps> = ({
  type = "button",
  onClick,
  children,
  variant = "primary",
  isLoading = false,
  disabled = false,
  className = "",
}) => {
  const baseClasses = "w-full h-12 font-crimson text-lg";
  const variantClasses = {
    primary:
      "bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700",
    outline: "border-amber-200 hover:bg-amber-50 bg-transparent",
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  if (variant === "outline") {
    return (
      <Button
        type={type}
        onClick={onClick}
        variant="outline"
        className={combinedClasses}
        disabled={isLoading || disabled}
      >
        {children}
      </Button>
    );
  }

  return (
    <Button
      type={type}
      onClick={onClick}
      className={combinedClasses}
      disabled={isLoading || disabled}
    >
      {children}
    </Button>
  );
};

const AuthDivider: React.FC<{ text?: string }> = ({
  text = UI_TEXT.dividerText,
}) => (
  <div className="relative my-6">
    <div className="absolute inset-0 flex items-center">
      <span className="w-full border-t border-amber-200" />
    </div>
    <div className="relative flex justify-center text-base uppercase">
      <span className="bg-white px-2 text-amber-600 font-crimson">{text}</span>
    </div>
  </div>
);

interface AuthFooterProps {
  showSignUpLink?: boolean;
  showForgotPassword?: boolean;
  signUpPath?: string;
  forgotPasswordPath?: string;
}

const AuthFooter: React.FC<AuthFooterProps> = ({
  showSignUpLink = true,
  showForgotPassword = false,
  signUpPath = FORM_CONFIG.signUpPath,
  forgotPasswordPath = FORM_CONFIG.forgotPasswordPath,
}) => (
  <div className="space-y-2 mt-4 text-center text-base">
    {showForgotPassword && (
      <div>
        <Link
          href={forgotPasswordPath}
          className="text-amber-700 hover:text-amber-800 underline underline-offset-4"
        >
          {UI_TEXT.forgotPasswordLink}
        </Link>
      </div>
    )}
    {showSignUpLink && (
      <div>
        {UI_TEXT.signUpPrompt}{" "}
        <Link
          href={signUpPath}
          className="text-amber-700 hover:text-amber-800 underline underline-offset-4"
        >
          {UI_TEXT.signUpLink}
        </Link>
      </div>
    )}
  </div>
);

// ================================
// CUSTOM HOOKS
// ================================
const useLoginForm = (redirectTo?: string, onSuccess?: () => void) => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = getSupabaseClient();

  const updateField = (field: keyof LoginFormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
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
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      // Call success callback if provided
      onSuccess?.();

      // Navigate to redirect path
      router.push(redirectTo || FORM_CONFIG.defaultRedirectPath);
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
            redirectTo || FORM_CONFIG.defaultRedirectPath
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
    handleLogin,
    handleGoogleAuth,
  };
};

// ================================
// MAIN COMPONENT
// ================================
export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  redirectTo,
  className = "",
  showSignUpLink = true,
}) => {
  const {
    formData,
    error,
    isLoading,
    updateField,
    handleLogin,
    handleGoogleAuth,
  } = useLoginForm(redirectTo, onSuccess);

  return (
    <Card
      className={`fantasy-border bg-white/90 backdrop-blur-sm ${className}`}
    >
      <AuthHeader title={UI_TEXT.title} />

      <CardContent className="space-y-4 p-8">
        <form onSubmit={handleLogin} className="space-y-5">
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
            placeholder="Your password"
            value={formData.password}
            onChange={updateField("password")}
            icon={Lock}
            required
            disabled={isLoading}
          />

          <ErrorDisplay error={error} />

          <AuthButton type="submit" isLoading={isLoading}>
            {isLoading ? LOADING_MESSAGES.signIn : UI_TEXT.signInButton}
          </AuthButton>
        </form>

        <AuthDivider />

        <AuthButton
          variant="outline"
          onClick={handleGoogleAuth}
          isLoading={isLoading}
        >
          {isLoading ? LOADING_MESSAGES.googleAuth : UI_TEXT.googleButton}
        </AuthButton>

        <AuthFooter showSignUpLink={showSignUpLink} showForgotPassword={true} />
      </CardContent>
    </Card>
  );
};

export default LoginForm;
