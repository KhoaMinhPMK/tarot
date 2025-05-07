import React from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  StyleSheet, 
  StatusBar, 
  TouchableOpacity,
  ViewStyle,
  ScrollView
} from 'react-native';
import { COLORS, FONTS } from '../../styles/globalStyles';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  showHeader?: boolean;
  headerRight?: React.ReactNode;
  style?: ViewStyle;
  scrollable?: boolean;
  headerStyle?: ViewStyle;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  showBackButton = false,
  showHeader = true,
  headerRight,
  style,
  scrollable = true,
  headerStyle
}) => {
  const navigation = useNavigation();

  const handleGoBack = () => {
    navigation.goBack();
  };

  const renderHeader = () => {
    if (!showHeader) return null;

    return (
      <View style={[styles.header, headerStyle]}>
        {showBackButton && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleGoBack}
          >
            <Icon name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
        )}
        
        {title && <Text style={styles.headerTitle}>{title}</Text>}

        {headerRight ? (
          headerRight
        ) : (
          <View style={{ width: showBackButton ? 40 : 0 }} />
        )}
      </View>
    );
  };

  const renderContent = () => {
    if (scrollable) {
      return (
        <ScrollView 
          style={styles.scrollContent} 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      );
    }

    return (
      <View style={[styles.content, style]}>
        {children}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      
      {renderHeader()}
      {renderContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    ...FONTS.h3,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  }
});

export default Layout;