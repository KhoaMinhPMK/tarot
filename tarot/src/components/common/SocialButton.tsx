import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet,
  ViewStyle,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../styles/globalStyles';

interface SocialButtonProps {
  title: string;
  onPress: () => void;
  iconName: string;
  iconColor?: string;
  style?: ViewStyle;
  type: 'google' | 'facebook' | 'apple';
  loading?: boolean;
}

const SocialButton: React.FC<SocialButtonProps> = ({
  title,
  onPress,
  iconName,
  iconColor,
  style,
  type,
  loading = false
}) => {
  const getButtonStyle = () => {
    switch (type) {
      case 'google':
        return { backgroundColor: COLORS.white, borderColor: '#DADCE0' };
      case 'facebook':
        return { backgroundColor: '#4267B2', borderColor: '#4267B2' };
      case 'apple':
        return { backgroundColor: '#000000', borderColor: '#000000' };
      default:
        return { backgroundColor: COLORS.white, borderColor: COLORS.lightGray };
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'google':
        return COLORS.black;
      case 'facebook':
      case 'apple':
        return COLORS.white;
      default:
        return COLORS.darkGray;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, getButtonStyle(), style]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={getTextColor()} 
          style={styles.icon} 
        />
      ) : (
        <Icon 
          name={iconName} 
          size={24} 
          color={iconColor || getTextColor()} 
          style={styles.icon} 
        />
      )}
      <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    minHeight: 50,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
  },
  icon: {
    marginRight: 12,
  }
});

export default SocialButton;