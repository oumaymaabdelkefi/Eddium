import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { View, ActivityIndicator } from 'react-native';

function RootLayoutNav() {
  const auth = useAuth();

  // Guard against null context
  if (!auth) {
    return (
      <View style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ECF6FF',
      }}>
        <ActivityIndicator size="large" color="#2D9596" />
      </View>
    );
  }

  const { user, userData, loading } = auth;
  const router   = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;
    if (!userData && user) return;

    const inAuth  = segments[0] === '(auth)';
    const inAdmin = segments[0] === '(admin)';
    const inTabs  = segments[0] === '(tabs)';

    if (!user) {
      if (!inAuth) router.replace('/(auth)/login');
      return;
    }

    if (userData?.role === 'admin') {
      if (!inAdmin) router.replace('/(admin)/dashboard');
      return;
    }

    if (userData?.role !== 'admin') {
      if (!inTabs) router.replace('/(tabs)/home');
      return;
    }
  }, [user, userData, loading]);

  if (loading || (user && !userData)) {
    return (
      <View style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ECF6FF',
      }}>
        <ActivityIndicator size="large" color="#2D9596" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)"  />
      <Stack.Screen name="(tabs)"  />
      <Stack.Screen name="(admin)" />
      <Stack.Screen name="index"   />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}