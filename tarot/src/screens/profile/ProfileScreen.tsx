import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, FONTS } from '../../styles/globalStyles';
import CustomButton from '../../components/common/CustomButton';
import Layout from '../../components/common/Layout';
import BottomNavigation from '../../components/common/BottomNavigation';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  // Placeholder user data
  const userData = {
    name: 'John Doe',
    email: 'johndoe@example.com',
    memberSince: 'May 2023',
    readingsCompleted: 42,
    favoriteCards: 7
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(previous => !previous);
  };

  const toggleDarkMode = () => {
    setDarkModeEnabled(previous => !previous);
  };

  const handleEditProfile = () => {
    // In a real app, navigate to EditProfile screen
    console.log('Navigate to edit profile');
  };

  const handleLogout = () => {
    // In a real app, implement logout functionality
    console.log('Logging out');
    navigation.navigate('Login' as never);
  };

  const headerRight = (
    <TouchableOpacity style={styles.settingsButton}>
      <Icon name="settings" size={24} color={COLORS.white} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Layout 
        title="Profile" 
        showBackButton={false}
        headerRight={headerRight}
      >
        <View style={styles.profileSection}>
          {/* Avatar placeholder */}
          <View style={styles.avatarPlaceholder}>
            <Icon name="person" size={60} color={COLORS.white} />
          </View>
          
          <Text style={styles.userName}>{userData.name}</Text>
          <Text style={styles.userEmail}>{userData.email}</Text>
          
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
            <Icon name="edit" size={16} color={COLORS.primary} style={{ marginLeft: 5 }} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Icon name="history" size={30} color={COLORS.primary} />
            <Text style={styles.statValue}>{userData.readingsCompleted}</Text>
            <Text style={styles.statLabel}>Readings</Text>
          </View>
          
          <View style={styles.statCard}>
            <Icon name="favorite" size={30} color={COLORS.primary} />
            <Text style={styles.statValue}>{userData.favoriteCards}</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
          
          <View style={styles.statCard}>
            <Icon name="calendar-today" size={30} color={COLORS.primary} />
            <Text style={styles.statValue}>{userData.memberSince}</Text>
            <Text style={styles.statLabel}>Member Since</Text>
          </View>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingLabelContainer}>
                <Icon name="notifications" size={24} color={COLORS.primary} style={styles.settingIcon} />
                <Text style={styles.settingLabel}>Notifications</Text>
              </View>
              <Switch
                trackColor={{ false: COLORS.lightGray, true: COLORS.primary + '80' }}
                thumbColor={notificationsEnabled ? COLORS.primary : COLORS.gray}
                onValueChange={toggleNotifications}
                value={notificationsEnabled}
              />
            </View>
            
            <View style={styles.settingDivider} />
            
            <View style={styles.settingItem}>
              <View style={styles.settingLabelContainer}>
                <Icon name="nights-stay" size={24} color={COLORS.primary} style={styles.settingIcon} />
                <Text style={styles.settingLabel}>Dark Mode</Text>
              </View>
              <Switch
                trackColor={{ false: COLORS.lightGray, true: COLORS.primary + '80' }}
                thumbColor={darkModeEnabled ? COLORS.primary : COLORS.gray}
                onValueChange={toggleDarkMode}
                value={darkModeEnabled}
              />
            </View>
          </View>
        </View>

        <View style={styles.accountSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <View style={styles.accountCard}>
            <TouchableOpacity style={styles.accountItem}>
              <Icon name="lock" size={24} color={COLORS.primary} style={styles.accountIcon} />
              <Text style={styles.accountItemText}>Change Password</Text>
              <Icon name="chevron-right" size={24} color={COLORS.gray} style={styles.accountArrow} />
            </TouchableOpacity>
            
            <View style={styles.accountDivider} />
            
            <TouchableOpacity style={styles.accountItem}>
              <Icon name="help" size={24} color={COLORS.primary} style={styles.accountIcon} />
              <Text style={styles.accountItemText}>Help & Support</Text>
              <Icon name="chevron-right" size={24} color={COLORS.gray} style={styles.accountArrow} />
            </TouchableOpacity>
            
            <View style={styles.accountDivider} />
            
            <TouchableOpacity style={styles.accountItem}>
              <Icon name="description" size={24} color={COLORS.primary} style={styles.accountIcon} />
              <Text style={styles.accountItemText}>Terms & Privacy Policy</Text>
              <Icon name="chevron-right" size={24} color={COLORS.gray} style={styles.accountArrow} />
            </TouchableOpacity>
          </View>
        </View>

        <CustomButton
          title="Logout"
          variant="secondary"
          onPress={handleLogout}
          style={styles.logoutButton}
          icon={<Icon name="logout" size={20} color={COLORS.white} style={{ marginRight: 10 }} />}
        />
      </Layout>

      <BottomNavigation activeTab="Profile" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  userName: {
    ...FONTS.h2,
    marginBottom: 5,
  },
  userEmail: {
    ...FONTS.body4,
    color: COLORS.gray,
    marginBottom: 15,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  editButtonText: {
    ...FONTS.body4,
    color: COLORS.primary,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  statValue: {
    ...FONTS.h3,
    color: COLORS.black,
    marginTop: 5,
  },
  statLabel: {
    ...FONTS.body5,
    color: COLORS.gray,
  },
  sectionTitle: {
    ...FONTS.h3,
    color: COLORS.black,
    marginBottom: 15,
    fontWeight: '600',
  },
  settingsSection: {
    marginBottom: 30,
  },
  settingsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 5,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 15,
  },
  settingLabel: {
    ...FONTS.body3,
  },
  settingDivider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginHorizontal: 15,
  },
  accountSection: {
    marginBottom: 30,
  },
  accountCard: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 5,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  accountIcon: {
    marginRight: 15,
  },
  accountItemText: {
    ...FONTS.body3,
    flex: 1,
  },
  accountArrow: {
    marginLeft: 'auto',
  },
  accountDivider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginHorizontal: 15,
  },
  logoutButton: {
    backgroundColor: '#F44336', // Red color for logout
    marginTop: 10,
    marginBottom: 20,
  },
});

export default ProfileScreen;