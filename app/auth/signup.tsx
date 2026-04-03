import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from "react-native";
import { useRouter, Redirect } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/src/lib/supabase";

export default function SignupScreen() {
  const router = useRouter();
  const { user, role } = useAuth();

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
      // Step 1: Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      if (!data.user) throw new Error("Registration failed");

      const userId = data.user.id;

      // Step 2: Insert profile into DB
      const { error: profileError } = await supabase.from('profiles').insert({
        id: userId,
        email,
        full_name: name,
        phone_number: phone,
        city,
        zone,
        vehicle_type: vehicleType,
        work_platform: workPlatform,
        role: 'agent',
      });
      if (profileError) throw profileError;

      // Step 3: Auto-login after signup
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) throw loginError;

      // AuthContext listener will handle navigation
    } catch (err: any) {
      const msg = err?.message || "Registration failed. Try again.";
      if (msg.toLowerCase().includes("rate limit")) {
        setErrorMsg("Too many attempts. Please try again later.");
      } else {
        setErrorMsg(msg);
      }
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
          <View style={styles.inputGroup}><Text style={styles.label}>Full Name</Text><TextInput style={styles.input} placeholder="Enter your full name" placeholderTextColor="#888888" value={name} onChangeText={setName} autoCapitalize="words" /></View>
          <View style={styles.inputGroup}><Text style={styles.label}>Email Address</Text><TextInput style={styles.input} placeholder="Enter your email" placeholderTextColor="#888888" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" /></View>
          <View style={styles.inputGroup}><Text style={styles.label}>Password</Text><TextInput style={styles.input} placeholder="Create a password" placeholderTextColor="#888888" value={password} onChangeText={setPassword} secureTextEntry /></View>
          <View style={styles.inputGroup}><Text style={styles.label}>Phone Number</Text><TextInput style={styles.input} placeholder="Enter your phone number" placeholderTextColor="#888888" value={phone} onChangeText={setPhone} keyboardType="phone-pad" /></View>
          <View style={styles.inputGroup}><Text style={styles.label}>City</Text><TextInput style={styles.input} placeholder="e.g. Bangalore" placeholderTextColor="#888888" value={city} onChangeText={setCity} /></View>
          <View style={styles.inputGroup}><Text style={styles.label}>Zone</Text><TextInput style={styles.input} placeholder="e.g. South Bangalore" placeholderTextColor="#888888" value={zone} onChangeText={setZone} /></View>
          <View style={styles.inputGroup}><Text style={styles.label}>Vehicle Type</Text><TextInput style={styles.input} placeholder="e.g. bike, scooter, car" placeholderTextColor="#888888" value={vehicleType} onChangeText={setVehicleType} /></View>
          <View style={styles.inputGroup}><Text style={styles.label}>Work Platform</Text><TextInput style={styles.input} placeholder="e.g. swiggy, zomato, uber" placeholderTextColor="#888888" value={workPlatform} onChangeText={setWorkPlatform} /></View>

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
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  scrollContainer: { flexGrow: 1, justifyContent: "center", padding: 24, paddingTop: 60 },
  headerContainer: { marginBottom: 40 },
  title: { fontSize: 32, fontWeight: "bold", color: "#0F172A", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#64748B" },
  formContainer: { marginBottom: 32 },
  inputGroup: { marginBottom: 20 },
  label: { color: "#0F172A", fontSize: 16, fontWeight: "600", marginBottom: 8 },
  input: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16, color: "#0F172A", fontSize: 16 },
  signupButton: { backgroundColor: "#16A34A", borderRadius: 12, height: 56, alignItems: "center", justifyContent: "center", marginTop: 12, boxShadow: '0px 4px 8px rgba(22, 163, 74, 0.2)' },
  signupButtonDisabled: { backgroundColor: "#CBD5E1" },
  errorContainer: { backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#FCA5A5", borderRadius: 12, padding: 12, marginBottom: 24 },
  errorText: { color: "#EF4444", fontSize: 14, textAlign: "center", fontWeight: "bold" },
  signupButtonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },
  footerContainer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: "auto", paddingBottom: 20 },
  footerText: { color: "#64748B", fontSize: 16 },
  footerLink: { color: "#16A34A", fontSize: 16, fontWeight: "bold" },
});
