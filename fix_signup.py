signup_tsx = '''import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from "react-native";
import { useRouter, Redirect } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { authAPI } from "@/src/services/api";

export default function SignupScreen() {
  const router = useRouter();
  const { user, role, login } = useAuth();

  if (user) {
    if (role === "admin") return <Redirect href="/admin/dashboard" />;
    return <Redirect href="/(tabs)" />;
  }

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [zone, setZone] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [workPlatform, setWorkPlatform] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSignup = async () => {
    setErrorMsg("");
    if (!name || !email || !password || !phone || !city || !zone || !vehicleType || !workPlatform) {
      setErrorMsg("Please fill out all fields.");
      return;
    }
    setIsLoading(true);
    try {
      await authAPI.register({
        email,
        password,
        full_name: name,
        phone_number: phone,
        city,
        zone,
        vehicle_type: vehicleType,
        work_platform: workPlatform,
      });
      await login(email, password);
      router.replace("/(tabs)");
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail || "Registration failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join us to protect what matters</Text>
        </View>

        {errorMsg ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput style={styles.input} placeholder="Enter your full name" placeholderTextColor="#888888" value={name} onChangeText={setName} autoCapitalize="words" />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput style={styles.input} placeholder="Enter your email" placeholderTextColor="#888888" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput style={styles.input} placeholder="Create a password" placeholderTextColor="#888888" value={password} onChangeText={setPassword} secureTextEntry />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput style={styles.input} placeholder="Enter your phone number" placeholderTextColor="#888888" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>City</Text>
            <TextInput style={styles.input} placeholder="e.g. Bangalore" placeholderTextColor="#888888" value={city} onChangeText={setCity} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Zone</Text>
            <TextInput style={styles.input} placeholder="e.g. South Bangalore" placeholderTextColor="#888888" value={zone} onChangeText={setZone} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Vehicle Type</Text>
            <TextInput style={styles.input} placeholder="e.g. bike, scooter, car" placeholderTextColor="#888888" value={vehicleType} onChangeText={setVehicleType} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Work Platform</Text>
            <TextInput style={styles.input} placeholder="e.g. swiggy, zomato, uber" placeholderTextColor="#888888" value={workPlatform} onChangeText={setWorkPlatform} />
          </View>

          <TouchableOpacity style={[styles.signupButton, isLoading && styles.signupButtonDisabled]} onPress={handleSignup} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.signupButtonText}>Sign Up</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/auth/login")}>
            <Text style={styles.footerLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  scrollContainer: { flexGrow: 1, justifyContent: "center", padding: 24, paddingTop: 60 },
  headerContainer: { marginBottom: 40 },
  title: { fontSize: 32, fontWeight: "bold", color: "#ffffff", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#a0a0a0" },
  formContainer: { marginBottom: 32 },
  inputGroup: { marginBottom: 20 },
  label: { color: "#ffffff", fontSize: 14, fontWeight: "600", marginBottom: 8 },
  input: { backgroundColor: "#1e1e1e", borderWidth: 1, borderColor: "#333333", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 18, color: "#ffffff", fontSize: 16 },
  signupButton: { backgroundColor: "#10b981", borderRadius: 16, paddingVertical: 18, alignItems: "center", justifyContent: "center", marginTop: 12, minHeight: 60 },
  signupButtonDisabled: { backgroundColor: "#34d399" },
  errorContainer: { backgroundColor: "rgba(239, 68, 68, 0.1)", borderWidth: 1, borderColor: "rgba(239, 68, 68, 0.5)", borderRadius: 12, padding: 12, marginBottom: 24 },
  errorText: { color: "#ef4444", fontSize: 14, textAlign: "center" },
  signupButtonText: { color: "#ffffff", fontSize: 18, fontWeight: "bold" },
  footerContainer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: "auto", paddingBottom: 20 },
  footerText: { color: "#a0a0a0", fontSize: 15 },
  footerLink: { color: "#10b981", fontSize: 15, fontWeight: "bold" },
});
'''

with open("app/auth/signup.tsx", "w", encoding="utf-8", newline="\n") as f:
    f.write(signup_tsx)
print("signup.tsx done")
