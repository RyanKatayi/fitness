import { Modal, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { supabase } from '@/lib/supabase';
import { useState } from 'react';

interface GoalSettingModalProps {
  closeModal: () => void;
  currentGoal: number;
  refreshData: () => void; // To refresh HomeScreen after setting the goal
}

export default function GoalSettingModal({ closeModal, currentGoal, refreshData }: GoalSettingModalProps) {
  const [newGoal, setNewGoal] = useState<string>(currentGoal.toString());

  const handleSetGoal = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('profiles')
        .update({ calorie_goal: parseInt(newGoal) })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating calorie goal:', error);
      } else {
        refreshData(); // Refresh the data on HomeScreen
        closeModal(); // Close the modal after setting the goal
      }
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true}
      onRequestClose={closeModal}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>Set Your Calorie Goal</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your daily calorie goal"
            keyboardType="numeric"
            value={newGoal}
            onChangeText={setNewGoal}
          />

          <TouchableOpacity style={styles.button} onPress={handleSetGoal}>
            <Text style={styles.buttonText}>Set Goal</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    container: {
      height: '50%',
      backgroundColor: '#FFFFFF', // White background
      padding: 20,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      elevation: 5, // Slight elevation for a raised effect
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      color: '#000000', // Black text
      textAlign: 'center',
    },
    input: {
      height: 50,
      borderColor: '#333333', // Dark gray border
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 15,
      marginBottom: 20,
      fontSize: 16,
      color: '#000000', // Black text
      backgroundColor: '#F0F0F0', // Light gray background for input
    },
    button: {
      backgroundColor: '#000000', // Black button background
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 25,
      marginBottom: 10,
    },
    buttonText: {
      color: '#FFFFFF', // White text
      fontSize: 16,
      fontWeight: 'bold',
    },
    cancelButton: {
      padding: 15,
      alignItems: 'center',
    },
    cancelButtonText: {
      color: '#000000', // Black text
      fontSize: 16,
    },
  });
  
