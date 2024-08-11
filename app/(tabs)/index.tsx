import * as Progress from 'react-native-progress';

import { Dimensions, Image, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';

import AddFoodScreen from '../../components/addfood';
import GoalSettingModal from '../../components/goal';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen() {
  const [userName, setUserName] = useState<string | null>(null);
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [caloriesConsumed, setCaloriesConsumed] = useState(0);
  const [weeklyCalories, setWeeklyCalories] = useState(0);
  const [monthlyCalories, setMonthlyCalories] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bmi, setBmi] = useState<number | null>(null); // State for BMI
  const [modalVisible, setModalVisible] = useState(false);
  const [goalModalVisible, setGoalModalVisible] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
    }, [])
  );

  const fetchUserData = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error('Error fetching user:', userError);
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
        }

        if (profile) {
          setUserName(profile.full_name?.split(' ')[0] || 'Guest');
          setCalorieGoal(profile.calorie_goal);
          setStreak(profile.streak);
          if (profile.weight && profile.height) {
            const heightInMeters = profile.height / 100;
            const calculatedBmi = profile.weight / (heightInMeters * heightInMeters);
            setBmi(calculatedBmi);
          }
        }

        const { data: foodEntries, error: foodEntriesError } = await supabase
          .from('food_entries')
          .select('*')
          .eq('user_id', user.id);

        if (foodEntriesError) {
          console.error('Error fetching food entries:', foodEntriesError);
        }

        if (foodEntries) {
          const today = new Date();
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          startOfWeek.setHours(0, 0, 0, 0); // Reset the time to midnight
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

          let totalCaloriesToday = 0;
          let totalCaloriesThisWeek = 0;
          let totalCaloriesThisMonth = 0;

          foodEntries.forEach(entry => {
            const entryDate = new Date(entry.consumed_at);
            if (entryDate.toDateString() === today.toDateString()) {
              totalCaloriesToday += entry.calories;
            }
            if (entryDate >= startOfWeek) {
              totalCaloriesThisWeek += entry.calories;
            }
            if (entryDate >= startOfMonth) {
              totalCaloriesThisMonth += entry.calories;
            }
          });

          setCaloriesConsumed(totalCaloriesToday);
          setWeeklyCalories(totalCaloriesThisWeek);
          setMonthlyCalories(totalCaloriesThisMonth);
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  const getBmiMessage = (bmi: number | null) => {
    if (bmi === null) return "No BMI data available.";
    if (bmi < 18.5) return "BMI is below the healthy range.";
    if (bmi >= 18.5 && bmi <= 24.9) return "BMI is healthy.";
    if (bmi >= 25 && bmi <= 29.9) return "BMI is above the healthy range.";
    if (bmi >= 30) return "BMI is in the obesity range.";
    return "Maintain a healthy BMI!";
  };

  const refreshData = async () => {
    await fetchUserData();
  };

  const getEncouragingMessage = (remainingCalories: number, progress: number, calorieGoal: number) => {
    if (progress >= 1.3) {
      return `🔥 You're unstoppable! You've exceeded your goal by ${remainingCalories * -1} kcal! Remember to keep a balanced diet.`;
    } else if (progress >= 1.2) {
      return `🚀 Incredible! You've gone ${remainingCalories * -1} kcal over your goal! Keep that energy up!`;
    } else if (progress >= 1.1) {
      return `🎉 Amazing! You've surpassed your goal by ${remainingCalories * -1} kcal! You're doing great!`;
    } else if (progress >= 1) {
      return `🏆 Goal achieved! You've hit your calorie target for today! Fantastic work!`;
    } else if (remainingCalories <= 50) {
      return `🥳 Almost there! Just ${remainingCalories} kcal to go! Finish strong!`;
    } else if (remainingCalories <= 0.1 * calorieGoal) {
      return `💥 So close! Only ${remainingCalories} kcal left. Keep pushing, you're nearly there!`;
    } else if (remainingCalories <= 0.2 * calorieGoal) {
      return `👌 Great progress! ${remainingCalories} kcal remaining. You're on track to reach your goal!`;
    } else if (remainingCalories <= 0.3 * calorieGoal) {
      return `💪 Keep it up! ${remainingCalories} kcal left. You're doing fantastic!`;
    } else if (remainingCalories <= 0.4 * calorieGoal) {
      return `👏 Nice work! ${remainingCalories} kcal left. Keep going strong!`;
    } else if (remainingCalories <= 0.5 * calorieGoal) {
      return `🔥 You're doing well! ${remainingCalories} kcal to go. Stay focused!`;
    } else if (remainingCalories <= 0.6 * calorieGoal) {
      return `🚀 Good job! ${remainingCalories} kcal remaining. You're making solid progress!`;
    } else if (remainingCalories <= 0.75 * calorieGoal) {
      return `🌟 Keep going! ${remainingCalories} kcal left. You're on the right path!`;
    } else if (remainingCalories <= calorieGoal) {
      return `🙌🏾 Great start! ${remainingCalories} kcal to go. Let's keep moving!`;
    } else {
      return `🍽️ ${remainingCalories} kcal left to consume today. Keep your eye on the goal!`;
    }
  };

  const progress = caloriesConsumed / calorieGoal;

  const getProgressColor = (progress: number) => {
    if (progress < 0.33) {
      return '#ff6b6b'; // Red for low progress
    } else if (progress < 0.67) {
      return '#feca57'; // Yellow for moderate progress
    } else {
      return '#1dd1a1'; // Green for high progress
    }
  };

  const currentDate = format(new Date(), 'dd MMMM yyyy');

  return (
    <SafeAreaView style={styles.safeArea}>
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>
            Hi, {userName ? userName : 'Guest'}!
          </Text>
        </View>

          {/* Buttons Row */}
          <View style={styles.buttonsRow}>
            <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
              <Text style={styles.addButtonText}>Add Meal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.goalButton} onPress={() => setGoalModalVisible(true)}>
              <Text style={styles.goalButtonText}>Set Calorie Goal</Text>
            </TouchableOpacity>
          </View>

          {/* Date and Calorie Progress Card */}
          <View style={styles.progressCard}>
            <Text style={styles.levelText}>{currentDate}</Text>
            <Text style={styles.progressTitle}>Calorie Progress</Text>
            <Progress.Circle
              size={100}
              progress={progress}
              showsText={true}
              color={getProgressColor(progress)}
              thickness={8}
              style={styles.progressCircle}
              formatText={() => `${Math.round(progress * 100)}%`}
            />
            <Text style={styles.progressText}>
              {caloriesConsumed} / {calorieGoal} kcal
            </Text>
            {progress < 1 && (
              <Text style={[styles.dailyText, { color: getProgressColor(progress) }]}>
                {getEncouragingMessage(calorieGoal - caloriesConsumed, progress, calorieGoal)}
              </Text>
            )}
            {progress >= 1 && (
              <Text style={styles.motivationalText}>
                Awesome! You’ve completed your goal!
              </Text>
            )}
          </View>

          {/* Weekly Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.cardTitle}>Weekly Summary</Text>
            <Text style={styles.summaryText}>
              Total: {weeklyCalories} kcal
            </Text>
          </View>

          {/* Monthly Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.cardTitle}>Monthly Summary</Text>
            <Text style={styles.summaryText}>
              Total: {monthlyCalories} kcal
            </Text>
          </View>

          {/* BMI Card */}
          <View style={styles.streakCard}>
            <Text style={styles.cardTitle}>Current BMI</Text>
            <Text style={styles.streakText}>
              {bmi ? bmi.toFixed(2) : 'N/A'}
            </Text>
            <Text style={styles.motivationalText}>
              {getBmiMessage(bmi)}
            </Text>
          </View>

          {/* Streaks Card */}
          <View style={styles.streakCard}>
            <Text style={styles.cardTitle}>Current Streak</Text>
            <Text style={styles.streakText}>{streak} days</Text>
            <Text style={styles.motivationalText}>
              Keep the streak going!
            </Text>
          </View>

          {/* Modal for logging food */}
          <Modal
            visible={modalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setModalVisible(false)}
          >
            <AddFoodScreen closeModal={() => setModalVisible(false)} refreshData={refreshData} />
          </Modal>

          {/* Modal for setting calorie goal */}
          <Modal
            visible={goalModalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setGoalModalVisible(false)}
          >
            <GoalSettingModal 
              closeModal={() => setGoalModalVisible(false)} 
              currentGoal={calorieGoal} 
              refreshData={refreshData}
            />
          </Modal>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',  // White background
  },
  scrollView: {
    paddingHorizontal: 16,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', 
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',  // Black text
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#000000',  // Black button background
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
  },
  addButtonText: {
    color: '#FFFFFF',  // White text
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  goalButton: {
    backgroundColor: '#FFFFFF',  // White button background
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    flex: 1,
    borderWidth: 1,
    borderColor: '#000000',  // Black border
  },
  goalButtonText: {
    color: '#000000',  // Black text
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  progressCard: {
    backgroundColor: '#FFFFFF',  // White background
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000000',  // Black shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
    width: '100%',
  },
  levelText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',  // Black text
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000000',  // Black text
  },
  progressCircle: {
    marginBottom: 10,
  },
  progressText: {
    fontSize: 16,
    color: '#000000',  // Black text
    marginBottom: 5,
  },
  dailyText: {
    fontSize: 18, 
    fontWeight: '600', 
    marginBottom: 10, 
    textAlign: 'center', 
    color: '#000000',  // Black text
    paddingHorizontal: 20, 
    lineHeight: 24, 
  },
  motivationalText: {
    fontSize: 14,
    color: '#000000',  // Black text
    fontStyle: 'italic',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',  // White background
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#000000',  // Black border
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000000',  // Black text
  },
  summaryText: {
    fontSize: 16,
    color: '#000000',  // Black text
  },
  streakCard: {
    backgroundColor: '#FFFFFF',  // White background
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#000000',  // Black border
  },
  streakText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',  // Black text
    marginBottom: 10,
  },
});
