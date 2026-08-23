import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView,
  ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { registerUser, getErrorMessage } from '../../src/services/authService';

const NAVY      = '#091057';
const TEAL      = '#2D9596';
const BLUE      = '#1053A9';
const PALE_BLUE = '#CDEDFF';
const ICE       = '#ECF6FF';
const WHITE     = '#FFFFFF';
const MUTED     = '#5B7A9D';
const BORDER    = '#CDEDFF';

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
      {/* ── BACKGROUND ─────────────────────── */}
      <ImageBackground
        source={require('../../assets/images/dojo-bg.png')}
        style={styles.background}
        resizeMode="cover"
      >
        {/* Dark overlay */}
        <View style={styles.overlay} />

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* ── TOP SECTION ──────────────────── */}
          <View style={styles.topSection}>
            <View style={styles.logoWrap}>
              <Text style={styles.logoStar}>✳</Text>
            </View>
            <Text style={styles.appName}>eddium</Text>
            <Text style={styles.tagline}>
              Join the dojo and start learning
            </Text>
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerIcon}>⚔️</Text>
              <View style={styles.dividerLine} />
            </View>
          </View>

          {/* ── FORM CARD ────────────────────── */}
          <View style={styles.card}>

            <Text style={styles.cardTitle}>Create Account</Text>
            <Text style={styles.cardSub}>
              Choose your warrior name and begin
            </Text>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Username */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>WARRIOR NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="Your username"
                placeholderTextColor={MUTED}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

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
                placeholder="At least 6 characters"
                placeholderTextColor={MUTED}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {/* Confirm Password */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>CONFIRM PASSWORD</Text>
              <TextInput
                style={styles.input}
                placeholder="Repeat your password"
                placeholderTextColor={MUTED}
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry
              />
            </View>

            {/* Register button */}
            <TouchableOpacity
              style={[styles.registerBtn, loading && { opacity: 0.7 }]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color={WHITE} />
                : <Text style={styles.registerBtnText}>
                    ⚔️  Enter the Dojo
                  </Text>
              }
            </TouchableOpacity>

            {/* Login link */}
            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => router.back()}
            >
              <Text style={styles.loginText}>
                Already a warrior?{' '}
                <Text style={styles.loginBold}>Login</Text>
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
    flex:   1,
    width:  '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9,16,87,0.72)',
  },

  scroll: {
    flexGrow:          1,
    justifyContent:    'space-between',
    paddingHorizontal: 24,
    paddingTop:        60,
    paddingBottom:     40,
  },

  // Top section
  topSection: {
    alignItems:   'center',
    marginBottom: 24,
  },
  logoWrap: {
    width:           64,
    height:          64,
    borderRadius:    32,
    backgroundColor: 'rgba(45,149,150,0.25)',
    borderWidth:     2,
    borderColor:     TEAL,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    10,
  },
  logoStar: {
    fontSize: 28,
    color:    TEAL,
  },
  appName: {
    fontSize:     38,
    fontWeight:   '900',
    color:        WHITE,
    letterSpacing: 6,
    marginBottom:  6,
  },
  tagline: {
    fontSize:     13,
    color:        'rgba(255,255,255,0.7)',
    fontWeight:   '500',
    textAlign:    'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           12,
    width:         '60%',
  },
  dividerLine: {
    flex:            1,
    height:          1,
    backgroundColor: 'rgba(45,149,150,0.4)',
  },
  dividerIcon: { fontSize: 16 },

  // Card
  card: {
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius:    20,
    padding:         24,
    borderWidth:     1,
    borderColor:     'rgba(45,149,150,0.3)',
  },
  cardTitle: {
    fontSize:     20,
    fontWeight:   '800',
    color:        NAVY,
    marginBottom:  4,
    textAlign:    'center',
  },
  cardSub: {
    fontSize:     13,
    color:        MUTED,
    textAlign:    'center',
    marginBottom: 20,
  },

  // Error
  errorBox: {
    backgroundColor: '#FFF0F0',
    borderRadius:    10,
    padding:         12,
    marginBottom:    16,
    borderWidth:     1,
    borderColor:     '#FECACA',
  },
  errorText: { color: '#DC2626', fontSize: 13, fontWeight: '600' },

  // Fields
  field:      { marginBottom: 14 },
  fieldLabel: {
    fontSize:     10,
    fontWeight:   '800',
    color:        MUTED,
    letterSpacing: 0.8,
    marginBottom:  6,
  },
  input: {
    backgroundColor: ICE,
    borderRadius:    12,
    borderWidth:     1,
    borderColor:     BORDER,
    padding:         13,
    fontSize:        14,
    color:           NAVY,
  },

  // Register button
  registerBtn: {
    backgroundColor: TEAL,
    borderRadius:    14,
    paddingVertical: 14,
    alignItems:      'center',
    marginTop:        6,
    borderWidth:      1,
    borderColor:     'rgba(255,255,255,0.2)',
  },
  registerBtnText: {
    color:         WHITE,
    fontSize:      15,
    fontWeight:    '800',
    letterSpacing: 0.5,
  },

  // Login link
  loginLink: {
    marginTop:  16,
    alignItems: 'center',
  },
  loginText: { fontSize: 13, color: MUTED },
  loginBold: { color: TEAL, fontWeight: '700' },

  // Bottom
  bottom: {
    alignItems: 'center',
    marginTop:  24,
  },
  bottomText: {
    fontSize:      11,
    color:         'rgba(255,255,255,0.5)',
    letterSpacing: 1,
    fontWeight:    '600',
  },
});