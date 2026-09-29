import Toast from "@/components/common/toast";
import appConfig from "@/components/constants/appConfig";
import colors from "@/components/constants/colors";
import { useAuth, useSignUp } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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

export default function VerifyEmail() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [code, setCode] = useState("");
  const [toast, setToast] = useState<ToastState>(null);

  const isLoading = fetchStatus === "fetching";

  const onVerifyPress = async () => {
    setToast(null);

    if (code.trim().length < 6) {
      setToast({ type: "warning", message: "Enter the 6-digit code." });
      return;
    }

    const { error } = await signUp.verifications.verifyEmailCode({
      code: code.trim(),
    });

    if (error) {
      console.error(JSON.stringify(error, null, 2));
      setToast({
        type: "error",
        message: error.message ?? "Verification failed.",
      });
      return;
    }

    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            console.log(session.currentTask);
            return;
          }
          const url = decorateUrl("/");
          router.replace(url as any);
        },
      });
    } else {
      console.error("Sign-up attempt not complete:", signUp);
      setToast({
        type: "error",
        message: "Sign-up could not be completed. Please try again.",
      });
    }
  };

  const onResendPress = async () => {
    setToast(null);
    const { error } = await signUp.verifications.sendEmailCode();
    if (error) {
      setToast({
        type: "error",
        message: error.message ?? "Could not resend code.",
      });
      return;
    }
    setToast({ type: "success", message: "A new code has been sent." });
  };

  if (isSignedIn) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
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

          <View style={styles.headingContainer}>
            <Text style={styles.title}>Verify your email</Text>
            <Text style={styles.subtitle}>
              We sent a 6-digit code to{"\n"}
              <Text style={styles.email}>{signUp.emailAddress}</Text>
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
            style={[styles.button, isLoading && { opacity: 0.7 }]}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>Verify</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Didn&apos;t get a code?</Text>
            <TouchableOpacity onPress={onResendPress} disabled={isLoading}>
              <Text style={styles.footerLink}>Resend</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.footerText}>Use a different email</Text>
          </TouchableOpacity>
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
    justifyContent: "center",
  },
  logoContainer: { alignItems: "center", marginBottom: 36 },
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
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 22,
  },
  email: { fontWeight: "600", color: colors.text },
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
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  input: { fontSize: 16, color: colors.text, padding: 0 },
  codeInput: { textAlign: "center", fontSize: 22, letterSpacing: 8 },
  fieldError: { color: "#EF4444", fontSize: 13, marginTop: 6 },
  button: {
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: "700" },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 28,
  },
  footerText: { fontSize: 14, color: colors.textSecondary },
  footerLink: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
    marginLeft: 5,
  },
  backButton: { alignItems: "center", marginTop: 16 },
});
