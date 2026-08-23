import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView,
  ImageBackground, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { loginUser, getErrorMessage } from '../../src/services/authService';

const { width, height } = Dimensions.get('window');

const NAVY      = '#091057';
const TEAL      = '#2D9596';
const BLUE      = '#1053A9';
const PALE_BLUE = '#CDEDFF';
const ICE       = '#ECF6FF';
const ORANGE    = '#EC8305';
const WHITE     = '#FFFFFF';
const MUTED     = '#5B7A9D';
const BORDER    = '#CDEDFF';

export default function LoginScreen() {
  const router = useRouter();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  async function handleLogin() {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    const result = await loginUser(email.trim(), password);
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
      {/* ── BACKGROUND ─────────────────────── */}
      <ImageBackground
        source={require('../../assets/images/dojo-bg.png')}
        style={styles.background}
        resizeMode="cover"
      >
        {/* Dark overlay with brand navy tint */}
        <View style={styles.overlay} />

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* ── TOP SECTION ──────────────────── */}
          <View style={styles.topSection}>

            {/* Logo area */}
            <View style={styles.logoWrap}>
              <Text style={styles.logoStar}>✳</Text>
            </View>

            <Text style={styles.appName}>eddium</Text>
            <Text style={styles.tagline}>Master your vocabulary. Win every battle.</Text>

            {/* Decorative divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerIcon}>⚔️</Text>
              <View style={styles.dividerLine} />
            </View>
          </View>

          {/* ── FORM CARD ────────────────────── */}
          <View style={styles.card}>

            <Text style={styles.cardTitle}>Welcome back, Warrior</Text>
            <Text style={styles.cardSub}>Login to continue your training</Text>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Email */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>EMAIL</Text>
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor={MUTED}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>PASSWORD</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={MUTED}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {/* Login button */}
            <TouchableOpacity
              style={[styles.loginBtn, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color={WHITE} />
                : <Text style={styles.loginBtnText}>⚔️  Enter the Dojo</Text>
              }
            </TouchableOpacity>

            {/* Register link */}
            <TouchableOpacity
              style={styles.registerLink}
              onPress={() => router.push('/(auth)/register')}
            >
              <Text style={styles.registerText}>
                New warrior?{' '}
                <Text style={styles.registerBold}>Create account</Text>
              </Text>
            </TouchableOpacity>

          </View>

          {/* ── BOTTOM ───────────────────────── */}
          <View style={styles.bottom}>
            <Text style={styles.bottomText}>
              IELTS & TOEFL Vocabulary Adventure
            </Text>
          </View>

        </ScrollView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1 },

  // Background
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9,16,87,0.72)',
  },

  scroll: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },

  // Top section
  topSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(45,149,150,0.25)',
    borderWidth: 2,
    borderColor: TEAL,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoStar: {
    fontSize: 32,
    color: TEAL,
  },
  appName: {
    fontSize: 42,
    fontWeight: '900',
    color: WHITE,
    letterSpacing: 6,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '60%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(45,149,150,0.4)',
  },
  dividerIcon: { fontSize: 16 },

  // Card
  card: {
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(45,149,150,0.3)',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: NAVY,
    marginBottom: 4,
    textAlign: 'center',
  },
  cardSub: {
    fontSize: 13,
    color: MUTED,
    textAlign: 'center',
    marginBottom: 20,
  },

  // Error
  errorBox: {
    backgroundColor: '#FFF0F0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: { color: '#DC2626', fontSize: 13, fontWeight: '600' },

  // Fields
  field:      { marginBottom: 14 },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: MUTED,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  input: {
    backgroundColor: ICE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 13,
    fontSize: 14,
    color: NAVY,
  },

  // Login button
  loginBtn: {
    backgroundColor: TEAL,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  loginBtnText: {
    color: WHITE,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Register
  registerLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  registerText: { fontSize: 13, color: MUTED },
  registerBold: { color: TEAL, fontWeight: '700' },

  // Bottom
  bottom: {
    alignItems: 'center',
    marginTop: 24,
  },
  bottomText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1,
    fontWeight: '600',
  },
});