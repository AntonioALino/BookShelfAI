import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CameraScreen from '../screens/CameraScreen';
import ResultScreen from '../screens/ResultsScreen';

export type RootStackParamList = {
  Camera: undefined; 
  Result: { imageUri: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Camera" component={CameraScreen} options={{ headerShown: false }} />
        <Stack.Screen 
          name="Result" 
          component={ResultScreen} 
          options={{ title: 'Resultado da Busca' }} 
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}