export type ValidationResult = {
  valid: boolean;
  message?: string;
};

export const validateName = (name: string): ValidationResult => {
  const value = name.trim();

  if (!value) {
    return {
      valid: false,
      message: "Please enter your full name.",
    };
  }

  if (value.length < 2) {
    return {
      valid: false,
      message: "Your name must be at least 2 characters.",
    };
  }

  return {
    valid: true,
  };
};

export const validateEmail = (email: string): ValidationResult => {
  const value = email.trim();

  if (!value) {
    return {
      valid: false,
      message: "Please enter your email address.",
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(value)) {
    return {
      valid: false,
      message: "Please enter a valid email address.",
    };
  }

  return {
    valid: true,
  };
};

export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return {
      valid: false,
      message: "Please enter a password.",
    };
  }

  if (password.length < 8) {
    return {
      valid: false,
      message: "Password must be at least 8 characters.",
    };
  }

  return {
    valid: true,
  };
};

export const validateConfirmPassword = (
  password: string,
  confirmPassword: string,
): ValidationResult => {
  if (!confirmPassword) {
    return {
      valid: false,
      message: "Please confirm your password.",
    };
  }

  if (password !== confirmPassword) {
    return {
      valid: false,
      message: "Passwords do not match.",
    };
  }

  return {
    valid: true,
  };
};
