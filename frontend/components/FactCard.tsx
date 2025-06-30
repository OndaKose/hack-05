// frontend/components/FactCard.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

type Props = {
  fact: string;
  onKnow: () => void;
  onDontKnow: () => void;
};

export function FactCard({ fact, onKnow, onDontKnow }: Props) {
  return (
    <View className="bg-white rounded-xl boxShadow p-4 mb-4">
      <Text className="text-base text-gray-800 mb-4">{fact}</Text>
      <View className="flex-row justify-end space-x-4">
        <Pressable onPress={onKnow} className="flex-row items-center space-x-1">
          <MaterialIcons name="thumb-up" size={20} color="#4CAF50" />
          <Text className="text-green-600 font-medium">知ってた</Text>
        </Pressable>
        <Pressable onPress={onDontKnow} className="flex-row items-center space-x-1">
          <MaterialIcons name="thumb-down" size={20} color="#F44336" />
          <Text className="text-red-600 font-medium">知らんかった</Text>
        </Pressable>
      </View>
    </View>
  );
}