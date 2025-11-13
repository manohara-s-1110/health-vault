// app/faq.js
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

const FAQ_ITEM = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.item}>
      <TouchableOpacity
        style={styles.itemHeader}
        onPress={() => setOpen((v) => !v)}
        activeOpacity={0.8}
      >
        <Text style={styles.question}>{q}</Text>
        <Feather name={open ? "chevron-up" : "chevron-down"} size={20} color="#1E232C" />
      </TouchableOpacity>

      {open && (
        <View style={styles.answerContainer}>
          <Text style={styles.answer}>{a}</Text>
        </View>
      )}
    </View>
  );
};

export default function FAQ() {
  const faqs = [
    {
      q: "Is my health data secure, and how is my privacy protected?",
      a: "Yes. Your health data is stored securely and we follow standard encryption and access control practices to protect your privacy. Only authorized parts of the app or services can access sensitive data. For full details, refer to our Privacy Policy on the website.",
    },
    {
      q: "What should I do if I forget my password?",
      a: "Use the Reset Password option available in Manage Profile. Go to Manage Profile → Reset Password and follow the steps to set a new password.",
    },
    {
      q: "How do I upload or manually enter a new health report (e.g., lab results, imaging report)?",
      a: "Navigate to the Reports/Add Report page and follow the on-screen steps to upload a PDF/image or enter details manually. The Add Report flow will guide you through picking a file and saving the report.",
    },
    {
      q: "How can I correct or delete an incorrectly entered health reading or report?",
      a: "You can delete the incorrect entry and re-upload the corrected report. An edit option will be available soon to allow inline edits without reuploading.",
    },
    {
      q: "Where can I find the Terms of Service and Privacy Policy?",
      a: "The Terms of Service and Privacy Policy are available on our website. Please visit the website to view the full legal documents.",
    },
  ];

  const contactCustomerCare = () => {
    Alert.alert(
      "Thank you for reaching to us",
      "Our team will contact you soon, thank you",
      [
        {
          text: "OK",
          onPress: () => router.push("/profile"), // navigate to profile page
        },
      ]
    );
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#1E232C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FAQ</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.intro}>Commonly asked questions — tap a question to see what to do.</Text>

        {faqs.map((f, idx) => (
          <FAQ_ITEM key={idx} q={f.q} a={f.a} />
        ))}

        <TouchableOpacity style={styles.contactBtn} onPress={contactCustomerCare} activeOpacity={0.8}>
          <Text style={styles.contactBtnText}>Contact Customer Care</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F3F8",
    backgroundColor: "#fff",
  },
  backBtn: { marginRight: 12 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#1E232C" },
  container: { padding: 20 },
  intro: { color: "#6A707C", marginBottom: 12 },
  item: {
    marginBottom: 12,
    borderRadius: 10,
    backgroundColor: "#F7F8FA",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E8ECF4",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  question: { fontSize: 15, fontWeight: "600", color: "#1E232C", flex: 1, marginRight: 8 },
  answerContainer: { paddingHorizontal: 16, paddingBottom: 16 },
  answer: { color: "#4A4F55", lineHeight: 20 },
  contactBtn: {
    marginTop: 18,
    backgroundColor: "#4A90E2",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  contactBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
