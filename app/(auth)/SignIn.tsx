import Toast from "@/components/common/toast";
import appConfig from "@/components/constants/appConfig";
import colors from "@/components/constants/colors";
import { useAuth, useSignIn } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ToastState = {
  type: "success" | "error" | "warning" | "info";
  message: string;
} | null;

export default function SignIn() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [toast, setToast] = useState<ToastState>(null);

  const isLoading = fetchStatus === "fetching";

  const needsCode =
    signIn.status === "needs_client_trust" ||
    signIn.status === "needs_second_factor";

  const finish = async () => {
    await signIn.finalize({
      navigate: ({ session, decorateUrl }) => {
        if (session?.currentTask) {
          console.log(session.currentTask);
          return;
        }
        const url = decorateUrl("/");
        router.replace(url as any);
      },
    });
  };

  const onSignInPress = async () => {
    setToast(null);

    if (!email.trim() || !password) {
      setToast({
        type: "warning",
        message: "Please enter your email and password.",
      });
      return;
    }

    const { error } = await signIn.password({
      emailAddress: email.trim(),
      password,
    });

    if (error) {
      console.error(JSON.stringify(error, null, 2));
      setToast({ type: "error", message: error.message ?? "Sign in failed." });
      return;
    }

    if (signIn.status === "complete") {
      await finish();
    } else if (
      signIn.status === "needs_client_trust" ||
      signIn.status === "needs_second_factor"
    ) {
      const { error: sendError } = await signIn.mfa.sendEmailCode();
      if (sendError) {
        console.error(JSON.stringify(sendError, null, 2));
        setToast({
          type: "error",
          message: sendError.message ?? "Could not send verification code.",
        });
        return;
      }
      setToast({ type: "info", message: "We sent a code to your email." });
    } else {
      console.error("Sign-in attempt not complete:", signIn);
      setToast({
        type: "error",
        message: "Sign in could not be completed. Please try again.",
      });
    }
  };

  const onVerifyPress = async () => {
    setToast(null);

    if (code.trim().length < 6) {
      setToast({ type: "warning", message: "Enter the 6-digit code." });
      return;
    }

    const { error } = await signIn.mfa.verifyEmailCode({ code: code.trim() });

    if (error) {
      console.error(JSON.stringify(error, null, 2));
      setToast({
        type: "error",
        message: error.message ?? "Verification failed.",
      });
      return;
    }

    if (signIn.status === "complete") {
      await finish();
    } else {
      console.error("Sign-in attempt not complete:", signIn);
      setToast({
        type: "error",
        message: "Sign in could not be completed. Please try again.",
      });
    }
  };

  const onResendPress = async () => {
    setToast(null);
    const { error } = await signIn.mfa.sendEmailCode();
    if (error) {
      setToast({
        type: "error",
        message: error.message ?? "Could not resend code.",
      });
      return;
    }
    setToast({ type: "success", message: "A new code has been sent." });
  };

  const onStartOver = async () => {
    setCode("");
    setToast(null);
    await signIn.reset();
  };

  if (isSignedIn) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Ionicons
                name={appConfig.logo.icon}
                size={appConfig.logo.size}
                color={colors.white}
              />
            </View>
          </View>

          {toast && <Toast type={toast.type} message={toast.message} />}

          {needsCode ? (
            <>
              <View style={styles.headingContainer}>
                <Text style={styles.title}>Verify it&apos;s you</Text>
                <Text style={styles.subtitleCenter}>
                  Enter the 6-digit code we sent to{"\n"}
                  <Text style={styles.emailText}>{email}</Text>
                </Text>
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Verification code</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, styles.codeInput]}
                    placeholder="000000"
                    placeholderTextColor={colors.textMuted}
                    value={code}
                    onChangeText={(t) => setCode(t.replace(/[^0-9]/g, ""))}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoFocus
                    textContentType="oneTimeCode"
                    autoComplete="one-time-code"
                  />
                </View>
                {errors.fields.code && (
                  <Text style={styles.fieldError}>
                    {errors.fields.code.message}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                onPress={onVerifyPress}
                disabled={isLoading}
                style={[styles.signInButton, isLoading && { opacity: 0.7 }]}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.signInText}>Verify</Text>
                )}
              </TouchableOpacity>

              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Didn&apos;t get a code?</Text>
                <TouchableOpacity onPress={onResendPress} disabled={isLoading}>
                  <Text style={styles.signupLink}>Resend</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={onStartOver} style={styles.backButton}>
                <Text style={styles.signupText}>Back to sign in</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.headingContainer}>
                <Text style={styles.title}>Welcome back</Text>
                <Text style={styles.subtitle}>Sign in to continue</Text>
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Email address</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor={colors.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                {errors.fields.identifier && (
                  <Text style={styles.fieldError}>
                    {errors.fields.identifier.message}
                  </Text>
                )}
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={10}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={21}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>
                {errors.fields.password && (
                  <Text style={styles.fieldError}>
                    {errors.fields.password.message}
                  </Text>
                )}
              </View>

              <TouchableOpacity style={styles.forgotButton}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onSignInPress}
                disabled={isLoading}
                style={[styles.signInButton, isLoading && { opacity: 0.7 }]}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.signInText}>Sign In</Text>
                )}
              </TouchableOpacity>

              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.orText}>or</Text>
                <View style={styles.divider} />
              </View>

              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>
                  Don&apos;t have an account?
                </Text>
                <Link href="/SignUp" asChild>
                  <TouchableOpacity>
                    <Text style={styles.signupLink}>Sign Up</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 5,
    justifyContent: "center",
  },
  logoContainer: { alignItems: "center", marginTop: 24, marginBottom: 36 },
  logo: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  headingContainer: { marginBottom: 28, alignItems: "center" },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 16, color: colors.textSecondary, marginTop: 8 },
  subtitleCenter: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 22,
  },
  emailText: { fontWeight: "600", color: colors.text },
  fieldContainer: { marginBottom: 18 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    height: 56,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  input: { flex: 1, fontSize: 16, color: colors.text, paddingVertical: 0 },
  codeInput: { textAlign: "center", fontSize: 22, letterSpacing: 8 },
  fieldError: { color: colors.error, fontSize: 13, marginTop: 6 },
  forgotButton: { alignSelf: "flex-end", marginTop: 2, marginBottom: 24 },
  forgotText: { fontSize: 14, fontWeight: "600", color: colors.primary },
  signInButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  signInText: { color: colors.white, fontSize: 16, fontWeight: "700" },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 28,
  },
  divider: { flex: 1, height: 1, backgroundColor: colors.border },
  orText: { marginHorizontal: 16, fontSize: 14, color: colors.textMuted },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  signupText: { fontSize: 14, color: colors.textSecondary },
  signupLink: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
    marginLeft: 5,
  },
  backButton: { alignItems: "center", marginTop: 16 },
});
