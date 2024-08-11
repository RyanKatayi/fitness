import { FlatList, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

interface FoodItem {
  id: number;
  FoodCategory: string;
  FoodItem: string;
  per100grams: string;
  Cals_per100grams: string;
  KJ_per100grams: string;
}

interface AddFoodScreenProps {
  closeModal: () => void;
  refreshData: () => void;
}

export default function AddFoodScreen({ closeModal, refreshData }: AddFoodScreenProps) {
  const [mealType, setMealType] = useState<string>('');
  const [foodName, setFoodName] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<FoodItem[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [filteredFoodItems, setFilteredFoodItems] = useState<FoodItem[]>([]);

  useEffect(() => {
    fetchFoodItems();
  }, []);

  const fetchFoodItems = async () => {
    try {
      const { data, error } = await supabase.from('calorie_table').select('*');
      
      if (error) {
        console.error('Error fetching food items:', error.message);
      } else if (data.length === 0) {
        console.warn('The table is empty or no data matched the query.');
      } else {
        console.log('Fetched food items:', data);
        setFoodItems(data);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };

  const handleFoodSelection = (item: FoodItem) => {
    setSelectedItems([...selectedItems, item]);
    setFoodName('');
    setFilteredFoodItems([]);
  };

  const filterFoodItems = (text: string) => {
    setFoodName(text);
    const filteredItems = foodItems.filter((item) =>
      item.FoodItem.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredFoodItems(filteredItems);
  };

  const handleLogFood = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      for (const item of selectedItems) {
        const { error } = await supabase
          .from('food_entries')
          .insert([
            { 
              user_id: user.id, 
              food_name: item.FoodItem, 
              calories: parseInt(item.Cals_per100grams), 
              meal_type: mealType,
            }
          ]);

        if (error) {
          console.error('Error logging food:', error);
          return;
        }
      }

      // Clear the form and close the modal
      setMealType('');
      setFoodName('');
      setSelectedItems([]);
      refreshData(); // Refresh parent data immediately
      closeModal(); // Close the modal after logging food
    }
  };

  return (
    <SafeAreaView style={styles.modalContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Log Your Meal</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Meal Type (e.g., Breakfast, Lunch)"
          value={mealType}
          onChangeText={setMealType}
          placeholderTextColor="#588157"
        />

        <TextInput
          style={styles.input}
          placeholder="Search Food"
          value={foodName}
          onChangeText={filterFoodItems}
          placeholderTextColor="#588157"
        />

        {filteredFoodItems.length > 0 && (
          <FlatList
            data={filteredFoodItems}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.dropdownItem} onPress={() => handleFoodSelection(item)}>
                <Text>{item.FoodItem} - {item.Cals_per100grams} cal</Text>
              </TouchableOpacity>
            )}
            style={[styles.dropdown, { height: Math.min(filteredFoodItems.length * 50, 150) }]} // Ensure consistent dropdown height
            contentContainerStyle={{ paddingBottom: 20 }} // Ensure there's padding at the bottom
          />
        )}

        <Text style={styles.label}>Selected Items:</Text>
        {selectedItems.map((item, index) => (
          <Text key={index} style={styles.selectedItem}>
            {item.FoodItem} - {item.Cals_per100grams} cal
          </Text>
        ))}

        <TouchableOpacity style={styles.button} onPress={handleLogFood}>
          <Text style={styles.buttonText}>Log Meal</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    height: '75%',
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
  dropdown: {
    backgroundColor: '#FFFFFF', // White background
    marginBottom: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333333', // Dark gray border
  },
  dropdownItem: {
    padding: 15,
    fontSize: 16,
    color: '#000000', // Black text
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000000', // Black text
  },
  selectedItem: {
    fontSize: 16,
    color: '#555555', // Medium gray text
    marginBottom: 5,
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

