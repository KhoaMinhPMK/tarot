import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import HomeScreen from '../screens/home/HomeScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import CardDetailScreen from '../screens/cards/CardDetailScreen';
import ReadingScreen from '../screens/reading/ReadingScreen';
import { AuthProvider } from '../context/AuthContext';

// Define the stack navigator param list
export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: {
    user?: {
      displayName: string | null;
      email: string | null;
      photoURL: string | null;
      uid: string;
      phoneNumber?: string | null;
    };
  };
  Profile: undefined;
  CardDetail: {
    cardId: string;
    cardName: string;
  };
  Reading: undefined;
  ReadingResult: {
    readingTypeId: string;
  };
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="CardDetail" component={CardDetailScreen} />
          <Stack.Screen name="Reading" component={ReadingScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
};

export default AppNavigator;