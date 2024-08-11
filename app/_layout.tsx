import 'react-native-reanimated';
import 'react-native-url-polyfill/auto';

import * as SplashScreen from 'expo-splash-screen';

import { ActivityIndicator, View } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import Auth from '../components/Auth';
import { Colors } from '@/constants/Colors';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useFonts } from 'expo-font';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [isReady, setIsReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (loaded) {
      setIsReady(true);
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data?.session || null);

      if (data?.session) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('full_name, weight, height')
          .eq('id', data.session.user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
        } else {
          if (!profile?.full_name || !profile?.weight || !profile?.height) {
            // Ensure navigation happens after the component is mounted with a slight delay
            setTimeout(() => {
              if (isMounted) {
                console.log('Profile incomplete, redirecting to settings...');
                router.replace('/(tabs)/settings');
              }
            }, 100); // Small delay to ensure the component is mounted
          }
        }
      }

      setLoading(false);
    };

    fetchSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      authListener.subscription?.unsubscribe();
    };
  }, [isMounted]);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  if (!isReady || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={{ flex: 1 }}>
        {session && session.user ? (
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        ) : (
          <Auth />
        )}
      </View>
    </ThemeProvider>
  );
}
