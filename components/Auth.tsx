import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button, Input } from '@rneui/themed';
import React, { useState } from 'react';

import { supabase } from '../lib/supabase';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  async function signUpWithEmail() {
    if (!email || !password) {
      Alert.alert('Please enter both email and password.');
      return;
    }
  
    setLoading(true);
    const { data: { session }, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });
  
    if (error) {
      Alert.alert(error.message);
    } else if (!session) {
      Alert.alert('Please check your inbox for email verification!');
    }
    setLoading(false);
  }
  

  async function resetPassword() {
    if (!email) {
      Alert.alert('Please enter your email to reset your password.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      Alert.alert(error.message);
    } else {
      Alert.alert('Please check your inbox for password reset instructions.');
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.verticallySpaced}>
        <Input
          label="Email"
          leftIcon={{ type: 'font-awesome', name: 'envelope' }}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={'none'}
          inputStyle={styles.input}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          label="Password"
          leftIcon={{ type: 'font-awesome', name: 'lock' }}
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={'none'}
          inputStyle={styles.input}
        />
      </View>
      <View style={[styles.verticallySpaced, styles.buttonContainer]}>
        <Button
          title="Sign in"
          disabled={loading}
          onPress={signInWithEmail}
          buttonStyle={styles.button}
          containerStyle={styles.buttonWrapper}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Button
          title="Sign up"
          disabled={loading}
          onPress={signUpWithEmail}
          buttonStyle={styles.button}
          containerStyle={styles.buttonWrapper}
        />
      </View>
      <TouchableOpacity style={styles.resetButton} onPress={resetPassword}>
        <Text style={styles.resetButtonText}>Forgot Password?</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // White background
    paddingHorizontal: 20,
    justifyContent: 'center', // Center content vertically
  },
  verticallySpaced: {
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 24,
  },
  buttonWrapper: {
    borderRadius: 5,
    overflow: 'hidden',
  },
  button: {
    backgroundColor: '#000000', // Black button background
    padding: 10,
    borderRadius: 5,
  },
  input: {
    color: '#333333', // Dark gray text
  },
  resetButton: {
    marginTop: 20,
    alignSelf: 'center',
  },
  resetButtonText: {
    color: '#FF0000', // Red text for emphasis
    fontWeight: 'bold',
  },
});

