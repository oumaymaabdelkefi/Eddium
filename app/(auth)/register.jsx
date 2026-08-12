import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { registerUser, getErrorMessage } from '../../src/services/authService';

export default function RegisterScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  async function handleRegister() {
    if (!username || !email || !password || !confirm) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError('');
    const result = await registerUser(email.trim(), password, username.trim());
    if (result.success) {
      router.replace('/(tabs)/home');
    } else {
      setError(getErrorMessage(result.error));
    }
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll}>

        <View style={styles.header}>
          <Text style={styles.appName}>EDDIUM</Text>
          <Text style={styles.tagline}>Start your journey</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Join the dojo and start learning</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.field}>
            <Text style={styles.label}>USERNAME</Text>
            <TextInput
              style={styles.input}
              placeholder="Your warrior name"
              placeholderTextColor="#9BB8AF"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor="#9BB8AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              placeholder="At least 6 characters"
              placeholderTextColor="#9BB8AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>CONFIRM PASSWORD</Text>
            <TextInput
              style={styles.input}
              placeholder="Repeat your password"
              placeholderTextColor="#9BB8AF"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Create Account</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => router.back()}
          >
            <Text style={styles.loginText}>
              Already have an account?{' '}
              <Text style={styles.loginBold}>Login</Text>
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#F0FAFA' },
  scroll:     { flexGrow: 1 },
  header: {
    backgroundColor: '#2A9D8F',
    paddingTop: 80,
    paddingBottom: 48,
    alignItems: 'center',
  },
  appName: {
    fontSize: 40,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 6,
  },
  tagline:    { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 6, letterSpacing: 1 },
  form:       { flex: 1, padding: 24, paddingTop: 36 },
  title:      { fontSize: 26, fontWeight: '800', color: '#1E2D2F', marginBottom: 6 },
  subtitle:   { fontSize: 13, color: '#6B8F8A', marginBottom: 28 },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 0.5,
    borderColor: '#FECACA',
  },
  errorText:  { color: '#DC2626', fontSize: 13, fontWeight: '600' },
  field:      { marginBottom: 18 },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E2D2F',
    marginBottom: 7,
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#D9EDE3',
    padding: 14,
    fontSize: 14,
    color: '#1E2D2F',
  },
  btn: {
    backgroundColor: '#2A9D8F',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#2A9D8F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled: { backgroundColor: '#A8D5BA' },
  btnText:    { color: '#fff', fontSize: 16, fontWeight: '800' },
  loginLink:  { marginTop: 24, alignItems: 'center' },
  loginText:  { fontSize: 13, color: '#6B8F8A' },
  loginBold:  { color: '#2A9D8F', fontWeight: '700' },
});