import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, FONTS } from '../../styles/globalStyles';
import CustomButton from '../../components/common/CustomButton';
import Layout from '../../components/common/Layout';
import BottomNavigation from '../../components/common/BottomNavigation';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.3;
const CARD_HEIGHT = CARD_WIDTH * 1.7;

type ReadingType = {
  id: string;
  name: string;
  description: string;
  numberOfCards: number;
  icon: string;
  color: string;
};

const readingTypes: ReadingType[] = [
  {
    id: '1',
    name: 'Past-Present-Future',
    description: 'A simple 3-card spread that gives you a quick overview of your situation.',
    numberOfCards: 3,
    icon: 'watch-later',
    color: '#FF4081',
  },
  {
    id: '2',
    name: 'Celtic Cross',
    description: 'A detailed 10-card spread that provides in-depth insights into your situation.',
    numberOfCards: 10,
    icon: 'change-history',
    color: '#4CAF50',
  },
  {
    id: '3',
    name: 'Love Reading',
    description: 'A 5-card spread focused on your romantic life and relationships.',
    numberOfCards: 5,
    icon: 'favorite',
    color: '#F44336',
  },
  {
    id: '4',
    name: 'Career Path',
    description: 'A 6-card spread that helps you navigate your professional life.',
    numberOfCards: 6,
    icon: 'work',
    color: '#2196F3',
  }
];

const ReadingScreen = () => {
  const navigation = useNavigation();
  const [selectedReading, setSelectedReading] = useState<string | null>(null);
  const [shufflingCards, setShufflingCards] = useState(false);
  const [cardsReady, setCardsReady] = useState(false);

  const handleReadingTypeSelect = (id: string) => {
    setSelectedReading(id);
    setCardsReady(false);
  };

  const handleShuffleCards = () => {
    setShufflingCards(true);
    
    // Simulate shuffling animation
    setTimeout(() => {
      setShufflingCards(false);
      setCardsReady(true);
    }, 2000);
  };

  const handleStartReading = () => {
    // Navigate to reading result screen
    console.log('Start reading with type:', selectedReading);
    // In a real app, navigate to the reading result screen
    // navigation.navigate('ReadingResult', { readingTypeId: selectedReading });
  };

  const renderReadingTypeItem = ({ item }: { item: ReadingType }) => (
    <TouchableOpacity
      style={[
        styles.readingTypeCard,
        selectedReading === item.id && styles.selectedReadingCard
      ]}
      onPress={() => handleReadingTypeSelect(item.id)}
    >
      <View style={[styles.readingIconContainer, { backgroundColor: item.color }]}>
        <Icon name={item.icon} size={28} color={COLORS.white} />
      </View>
      <Text style={styles.readingTypeName}>{item.name}</Text>
      <Text style={styles.cardCount}>{item.numberOfCards} cards</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Layout 
        title="Tarot Reading"
        showBackButton={true}
      >
        <Text style={styles.sectionTitle}>Select Reading Type</Text>
        
        <FlatList
          data={readingTypes}
          renderItem={renderReadingTypeItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.readingTypesList}
        />
        
        {selectedReading && (
          <View style={styles.selectedReadingDetails}>
            <Text style={styles.selectedReadingTitle}>
              {readingTypes.find(r => r.id === selectedReading)?.name}
            </Text>
            <Text style={styles.selectedReadingDescription}>
              {readingTypes.find(r => r.id === selectedReading)?.description}
            </Text>
          </View>
        )}

        <View style={styles.cardsSection}>
          <Text style={styles.sectionTitle}>Your Cards</Text>
          
          <View style={styles.deckContainer}>
            {/* This will be the placeholder for the card deck */}
            <View style={styles.cardDeckPlaceholder}>
              <Icon 
                name={shufflingCards ? 'shuffle' : 'style'} 
                size={50} 
                color={COLORS.primary} 
              />
              <Text style={styles.deckText}>
                {shufflingCards 
                  ? 'Shuffling cards...' 
                  : cardsReady 
                    ? 'Cards are ready' 
                    : 'Tap to shuffle'}
              </Text>
            </View>

            {!shufflingCards && !cardsReady && (
              <CustomButton
                title="Shuffle Cards"
                onPress={handleShuffleCards}
                style={styles.shuffleButton}
                icon={<Icon name="shuffle" size={20} color={COLORS.white} style={{ marginRight: 10 }} />}
              />
            )}
          </View>
          
          {cardsReady && (
            <View style={styles.cardPreview}>
              <Text style={styles.previewText}>Cards are ready for your reading</Text>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardsContainer}>
                {/* Placeholder for cards - would be dynamic in a real app */}
                {Array(readingTypes.find(r => r.id === selectedReading)?.numberOfCards || 3).fill(0).map((_, index) => (
                  <View key={index} style={styles.cardPlaceholder}>
                    <Icon name="credit-card" size={30} color={COLORS.primary} />
                    <Text style={styles.cardPlaceholderText}>Card {index + 1}</Text>
                  </View>
                ))}
              </ScrollView>

              <CustomButton
                title="Begin Reading"
                onPress={handleStartReading}
                style={styles.readingButton}
              />
            </View>
          )}
        </View>
      </Layout>

      <BottomNavigation activeTab="Reading" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  sectionTitle: {
    ...FONTS.h3,
    color: COLORS.black,
    marginBottom: 15,
    fontWeight: '600',
  },
  readingTypesList: {
    paddingVertical: 10,
  },
  readingTypeCard: {
    width: 140,
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 15,
    marginRight: 15,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  selectedReadingCard: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  readingIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  readingTypeName: {
    ...FONTS.h4,
    textAlign: 'center',
    marginBottom: 5,
  },
  cardCount: {
    ...FONTS.body5,
    color: COLORS.gray,
  },
  selectedReadingDetails: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 15,
    marginTop: 20,
    marginBottom: 30,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  selectedReadingTitle: {
    ...FONTS.h3,
    color: COLORS.primary,
    marginBottom: 10,
  },
  selectedReadingDescription: {
    ...FONTS.body4,
    color: COLORS.darkGray,
    lineHeight: 22,
  },
  cardsSection: {
    marginTop: 10,
  },
  deckContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  cardDeckPlaceholder: {
    width: width * 0.6,
    height: width * 0.9,
    backgroundColor: COLORS.white,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  deckText: {
    ...FONTS.body3,
    color: COLORS.darkGray,
    marginTop: 15,
  },
  shuffleButton: {
    width: width * 0.6,
  },
  cardPreview: {
    marginTop: 20,
  },
  previewText: {
    ...FONTS.body4,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 15,
  },
  cardsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  cardPlaceholder: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  cardPlaceholderText: {
    ...FONTS.body5,
    color: COLORS.gray,
    marginTop: 10,
  },
  readingButton: {
    marginTop: 10,
  },
});

export default ReadingScreen;