import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ImageBackground
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, FONTS } from '../../styles/globalStyles';
import CustomButton from '../../components/common/CustomButton';
import Layout from '../../components/common/Layout';
import BottomNavigation from '../../components/common/BottomNavigation';

// Update your RootStackParamList in AppNavigator.tsx to include this route
type CardDetailRouteProp = RouteProp<{
  CardDetail: {
    cardId: string;
    cardName: string;
  }
}, 'CardDetail'>;

const { width } = Dimensions.get('window');

const CardDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<CardDetailRouteProp>();
  
  // In a real app, you would fetch the card details based on the cardId
  // For now, we'll use placeholder data
  const cardData = {
    id: route.params?.cardId || '1',
    name: route.params?.cardName || 'The Fool',
    imageUrl: '', // Placeholder for the image URL
    meaning: 'The Fool represents new beginnings, having faith in the future, being inexperienced, not knowing what to expect, having beginners luck, improvisation and believing in the universe.',
    meaningReversed: 'When reversed, The Fool can represent holding back, recklessness, risk-taking, and poor judgment.',
    description: 'The Fool is numbered 0, the number of unlimited potential, and does not actually have a specific place in the sequence of the Tarot cards. The Fool can be placed either at the beginning of the Major Arcana or at the end. The Major Arcana is often considered as the Fools journey through life and as such, he is ever present and therefore needs no number.',
    keywords: ['Beginnings', 'Innocence', 'Spontaneity', 'Free spirit']
  };

  const headerRight = (
    <TouchableOpacity style={styles.favoriteButton}>
      <Icon name="favorite-border" size={24} color={COLORS.white} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Layout 
        title={cardData.name}
        showBackButton={true}
        headerRight={headerRight}
      >
        <View style={styles.cardImageContainer}>
          {/* This will be a placeholder for the card image */}
          <View style={styles.cardImagePlaceholder}>
            <Icon name="image" size={80} color={COLORS.lightGray} />
            <Text style={styles.placeholderText}>Card Image</Text>
            <Text style={styles.placeholderSubtext}>Image will be placed here</Text>
          </View>
        </View>

        <View style={styles.cardInfoSection}>
          <Text style={styles.sectionTitle}>Meaning</Text>
          <View style={styles.meaningContainer}>
            <View style={styles.meaningBox}>
              <Text style={styles.meaningTitle}>Upright</Text>
              <Text style={styles.meaningText}>{cardData.meaning}</Text>
            </View>
            
            <View style={[styles.meaningBox, styles.reversedBox]}>
              <Text style={styles.meaningTitle}>Reversed</Text>
              <Text style={styles.meaningText}>{cardData.meaningReversed}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardInfoSection}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{cardData.description}</Text>
        </View>

        <View style={styles.cardInfoSection}>
          <Text style={styles.sectionTitle}>Keywords</Text>
          <View style={styles.keywordsContainer}>
            {cardData.keywords.map((keyword, index) => (
              <View key={index} style={styles.keywordBadge}>
                <Text style={styles.keywordText}>{keyword}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.actionButtons}>
          <CustomButton
            title="Get a Reading"
            onPress={() => navigation.navigate('Reading' as never)}
            style={styles.readingButton}
          />
          <CustomButton
            title="Card Combinations"
            variant="outline"
            onPress={() => console.log('View combinations')}
            style={styles.combinationsButton}
          />
        </View>
      </Layout>

      <BottomNavigation activeTab="Cards" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImageContainer: {
    width: '100%',
    height: width * 1.5, // Aspect ratio for tarot cards
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  placeholderText: {
    ...FONTS.h3,
    color: COLORS.darkGray,
    marginTop: 10,
  },
  placeholderSubtext: {
    ...FONTS.body4,
    color: COLORS.gray,
    marginTop: 5,
  },
  cardInfoSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    ...FONTS.h3,
    color: COLORS.black,
    marginBottom: 15,
    fontWeight: '600',
  },
  meaningContainer: {
    flexDirection: 'column',
    gap: 15,
  },
  meaningBox: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  reversedBox: {
    backgroundColor: '#F8F9FA', // Slightly different background for reversed
  },
  meaningTitle: {
    ...FONTS.h4,
    color: COLORS.primary,
    marginBottom: 8,
    fontWeight: '600',
  },
  meaningText: {
    ...FONTS.body4,
    color: COLORS.darkGray,
    lineHeight: 22,
  },
  descriptionText: {
    ...FONTS.body4,
    color: COLORS.darkGray,
    lineHeight: 22,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  keywordBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  keywordText: {
    ...FONTS.body5,
    color: COLORS.white,
    fontWeight: '500',
  },
  actionButtons: {
    marginVertical: 20,
    gap: 12,
  },
  readingButton: {
    marginBottom: 10,
  },
  combinationsButton: {
    marginBottom: 10,
  },
});

export default CardDetailScreen;