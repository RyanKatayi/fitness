import { Alert, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import React, { useEffect, useState } from 'react';

import Avatar from '../../components/Avatar';
import { supabase } from '../../lib/supabase';

export default function SettingsScreen() {
  const [fullName, setFullName] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error fetching user:', error);
      return;
    }

    if (user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      } else {
        setFullName(profile.full_name || '');
        setWeight(profile.weight.toString() || '');
        setHeight(profile.height.toString() || '');
        setEmail(user.email || '');
        setAvatarUrl(profile.avatar_url || '');
      }
    }
  };

  const handleUpdateProfile = async () => {
    if (!/^\d+$/.test(weight) || !/^\d+$/.test(height)) {
      Alert.alert('Invalid Input', 'Please enter valid integer values for weight and height.');
      return;
    }

    Keyboard.dismiss();

    setLoading(true);
    const userResponse = await supabase.auth.getUser();
    const user = userResponse.data.user;

    if (!user) {
      Alert.alert('Error', 'User not found.');
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        weight: parseInt(weight, 10),
        height: parseInt(height, 10),
        avatar_url: avatarUrl,  
      })
      .eq('id', user.id);

    if (profileError) {
      Alert.alert('Error', `Error updating profile: ${profileError.message}`);
    } else {
      Alert.alert('Success', 'Profile updated successfully.');
      fetchUserDetails();
    }

    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (email) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        Alert.alert('Error', 'Error sending password reset email: ' + error.message);
      } else {
        Alert.alert('Success', 'Password reset email sent successfully.');
      }
    } else {
      Alert.alert('Error', 'Email not found.');
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Error', 'Error logging out: ' + error.message);
    } else {
      // Handle successful logout
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Avatar
          url={avatarUrl}
          size={100}
          onUpload={async (url) => {
            setAvatarUrl(url);
            await handleUpdateProfile(); 
          }}
        />

        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Enter your full name"
          placeholderTextColor="#588157"
        />

        <Text style={styles.label}>Weight (kgs)</Text>
        <TextInput
          style={styles.input}
          value={weight}
          onChangeText={setWeight}
          placeholder="Enter your weight"
          keyboardType="numeric"
          placeholderTextColor="#588157"
        />

        <Text style={styles.label}>Height (cm)</Text>
        <TextInput
          style={styles.input}
          value={height}
          onChangeText={setHeight}
          placeholder="Enter your height"
          keyboardType="numeric"
          placeholderTextColor="#588157"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, { backgroundColor: '#f0f0f0' }]} 
          value={email}
          placeholder="Enter your email"
          keyboardType="email-address"
          editable={false}  
          placeholderTextColor="#588157"
        />

        <TouchableOpacity
          style={styles.updateButton}
          onPress={handleUpdateProfile}
          disabled={loading}
        >
          <Text style={styles.updateButtonText}>
            {loading ? 'Updating...' : 'Update Profile'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.forgotPasswordButton} onPress={handleForgotPassword}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#000000',
  },
  input: {
    height: 50,
    borderColor: '#333333',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 15,
    borderRadius: 10,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#F0F0F0',
  },
  updateButton: {
    backgroundColor: '#000000',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#000000',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPasswordButton: {
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  forgotPasswordText: {
    color: '#FF0000',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
