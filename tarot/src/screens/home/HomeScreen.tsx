import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { COLORS, FONTS } from '../../styles/globalStyles';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/common/Layout';

type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const DEFAULT_PROFILE_IMAGE = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const route = useRoute<HomeScreenRouteProp>();
  const { user: authUser, signOut } = useAuth();
  
  // Sử dụng user từ navigation params hoặc từ AuthContext
  const user = route.params?.user || authUser;

  const handleSignOut = async () => {
    try {
      await signOut();
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  // Hiển thị thông tin người dùng
  return (
    <Layout
      title="Home"
      showBackButton={false}
      scrollable={true}
    >
      {/* User Profile Section */}
      <View style={styles.profileContainer}>
        <Image
          source={{ uri: user?.photoURL || DEFAULT_PROFILE_IMAGE }}
          style={styles.profileImage}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.welcomeText}>Welcome,</Text>
          <Text style={styles.userName}>{user?.displayName || 'Tarot User'}</Text>
        </View>
      </View>
      
      {/* User Information Card */}
      <View style={styles.userInfoCard}>
        <Text style={styles.cardTitle}>Account Information</Text>
        
        <View style={styles.infoRow}>
          <Icon name="person" size={20} color={COLORS.primary} />
          <Text style={styles.infoLabel}>Name:</Text>
          <Text style={styles.infoValue}>{user?.displayName || 'Not provided'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Icon name="email" size={20} color={COLORS.primary} />
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>{user?.email || 'Not provided'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Icon name="phone" size={20} color={COLORS.primary} />
          <Text style={styles.infoLabel}>Phone:</Text>
          <Text style={styles.infoValue}>{user?.phoneNumber || 'Not provided'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Icon name="fingerprint" size={20} color={COLORS.primary} />
          <Text style={styles.infoLabel}>User ID:</Text>
          <Text style={styles.infoValue}>{user?.uid || 'Unknown'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Icon name="verified-user" size={20} color={COLORS.primary} />
          <Text style={styles.infoLabel}>Auth Method:</Text>
          <Text style={styles.infoValue}>
            {user?.photoURL ? 'Google Account' : 'Phone Number'}
          </Text>
        </View>
      </View>
      
      {/* Sign Out Button */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Icon name="logout" size={20} color="#fff" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
      
      <View style={styles.successInfo}>
        <Icon name="check-circle" size={40} color="green" />
        <Text style={styles.successText}>Google Sign-In Successful!</Text>
        <Text style={styles.successDetail}>User information has been retrieved successfully.</Text>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.lightGray2,
    borderRadius: 12,
    marginBottom: 20,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  welcomeText: {
    ...FONTS.body4,
    color: COLORS.gray,
  },
  userName: {
    ...FONTS.h2,
    color: COLORS.black,
  },
  userInfoCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    ...FONTS.h3,
    color: COLORS.primary,
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray2,
  },
  infoLabel: {
    ...FONTS.body3,
    color: COLORS.gray,
    width: 80,
    marginLeft: 10,
  },
  infoValue: {
    ...FONTS.body3,
    color: COLORS.black,
    flex: 1,
  },
  signOutButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginVertical: 20,
  },
  signOutText: {
    ...FONTS.body3,
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  successInfo: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 200, 0, 0.1)',
    borderRadius: 12,
    marginBottom: 20,
  },
  successText: {
    ...FONTS.h3,
    color: 'green',
    marginTop: 10,
  },
  successDetail: {
    ...FONTS.body4,
    color: 'green',
    textAlign: 'center',
    marginTop: 5,
  },
});

export default HomeScreen;