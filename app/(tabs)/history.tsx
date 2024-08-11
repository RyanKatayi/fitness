import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

interface FoodEntry {
  food_name: string;
  calories: number;
}

interface MealGroup {
  meal_type: string;
  consumed_at: string;
  foods: FoodEntry[];
  total_calories: number;
}

export default function MealHistoryScreen() {
  const [mealHistory, setMealHistory] = useState<MealGroup[]>([]);

  useEffect(() => {
    fetchMealHistory();
  }, []);

  const fetchMealHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('meal_history')
        .select('*')
        .eq('user_id', user.id); // Assuming user_id is still needed

      if (error) {
        console.error('Error fetching meal history:', error.message);
      } else {
        setMealHistory(data || []);
      }
    }
  };

  const renderItem = ({ item }: { item: MealGroup }) => (
    <View style={styles.mealCard}>
      <Text style={styles.mealType}>{item.meal_type}</Text>
      <Text style={styles.mealDate}>{new Date(item.consumed_at).toLocaleString()}</Text>
      {item.foods.map((food, index) => (
        <View key={index} style={styles.foodItem}>
          <Text style={styles.foodName}>{food.food_name} - </Text>
          <Text style={styles.calories}>{food.calories} kcal</Text>
        </View>
      ))}
      <Text style={styles.totalCalories}>
        Total: {item.total_calories} kcal
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.headerTitle}>Meal History</Text>
      <FlatList
        data={mealHistory}
        keyExtractor={(item) => item.consumed_at + item.meal_type}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF', // White background
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000', // Black text
    textAlign: 'center',
    marginVertical: 15,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  mealCard: {
    backgroundColor: '#FFFFFF',  // White background
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#000000',
  },
  mealType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000', // Black text
    marginBottom: 5,
  },
  mealDate: {
    fontSize: 14,
    color: '#6c757d', // Medium gray text
    marginBottom: 10,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  foodName: {
    fontSize: 16,
    color: '#000000', // Black text
  },
  calories: {
    fontSize: 16,
    color: '#f39c12', // Accent color for calories
  },
  totalCalories: {
    fontSize: 16,
    color: '#f39c12', // Accent color for total calories
    marginTop: 10,
    fontWeight: 'bold',
  },
});
