import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";

export default function Onboarding() {
  return (
    <View style={styles.container}>
      <Image source={require("../assets/logo.png")} style={styles.logo} />
      <Text style={styles.title}>Health Vault</Text>
      <Text style={styles.subtitle}>Let’s get started!</Text>
      <Text style={styles.caption}>Login to stay healthy and fit</Text>

      <TouchableOpacity style={styles.loginBtn}>
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.signupBtn}>
        <Text style={styles.signupText}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  logo: { width: 100, height: 100, marginBottom: 20 },
  title: { fontSize: 26, fontWeight: "bold", color: "#1E3A8A" },
  subtitle: { fontSize: 18, fontWeight: "600", marginTop: 10 },
  caption: { fontSize: 14, color: "#6B7280", marginBottom: 30 },
  loginBtn: { width: "70%", padding: 15, backgroundColor: "#2563EB", borderRadius: 25, alignItems: "center", marginBottom: 15 },
  loginText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  signupBtn: { width: "70%", padding: 15, borderWidth: 2, borderColor: "#2563EB", borderRadius: 25, alignItems: "center" },
  signupText: { color: "#2563EB", fontWeight: "bold", fontSize: 16 },
});
