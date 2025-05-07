import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { COLORS, FONTS } from '../../styles/globalStyles';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export type TabName = 'Home' | 'Reading' | 'Profile' | 'Cards';

interface BottomNavigationProps {
  activeTab: TabName;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab }) => {
  const navigation = useNavigation();

  const tabs = [
    { name: 'Home' as TabName, icon: 'home', label: 'Home' },
    { name: 'Reading' as TabName, icon: 'auto-awesome', label: 'Reading' },
    { name: 'Cards' as TabName, icon: 'dashboard', label: 'Cards' },
    { name: 'Profile' as TabName, icon: 'person', label: 'Profile' },
  ];

  const handleTabPress = (tabName: TabName) => {
    navigation.navigate(tabName as never);
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.name}
          style={styles.tabItem}
          onPress={() => handleTabPress(tab.name)}
        >
          <Icon
            name={tab.icon}
            size={24}
            color={activeTab === tab.name ? COLORS.primary : COLORS.gray}
          />
          <Text
            style={[
              styles.tabLabel,
              { color: activeTab === tab.name ? COLORS.primary : COLORS.gray }
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    ...FONTS.body5,
    marginTop: 5,
  },
});

export default BottomNavigation;