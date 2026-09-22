import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import colors from "../constants/colors";

type ToastType = "success" | "error" | "warning" | "info";

type ToastProps = {
  message?: string;
  type?: ToastType;
};

const toastConfig = {
  success: {
    icon: "checkmark-circle" as keyof typeof Ionicons.glyphMap,
    color: colors.success,
    background: colors.successBackground,
  },

  error: {
    icon: "alert-circle" as keyof typeof Ionicons.glyphMap,
    color: colors.error,
    background: colors.errorBackground,
  },

  warning: {
    icon: "warning" as keyof typeof Ionicons.glyphMap,
    color: colors.warning,
    background: colors.warningBackground,
  },

  info: {
    icon: "information-circle" as keyof typeof Ionicons.glyphMap,
    color: colors.primary,
    background: colors.infoBackground,
  },
};

export default function Toast({ message, type = "error" }: ToastProps) {
  if (!message) {
    return null;
  }

  const config = toastConfig[type];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: config.background,
          borderColor: config.color,
        },
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: config.color,
          },
        ]}
      >
        <Ionicons name={config.icon} size={17} color={colors.white} />
      </View>

      <Text style={[styles.text, { color: config.color }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",

    marginHorizontal: 16,
    marginVertical: 8,

    paddingVertical: 12,
    paddingHorizontal: 12,

    borderWidth: 1,
    borderRadius: 14,

    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,

    alignItems: "center",
    justifyContent: "center",
  },

  text: {
    flex: 1,

    marginLeft: 10,

    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
});
