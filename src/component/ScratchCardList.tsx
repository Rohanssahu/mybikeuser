import React, { useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

// Define data type
interface ScratchCard {
  id: string;
  amount: number | null; // Null means not scratched yet
}

// Define props
interface ScratchCardListProps {
  data: ScratchCard[];
  onCollectPrize: (id: string) => void;
}

const ScratchCardList: React.FC<ScratchCardListProps> = ({ data, onCollectPrize }) => {
  const [scratchedCards, setScratchedCards] = useState<{ [key: string]: boolean }>({});

  const handleScratch = (id: string) => {
    setScratchedCards((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <FlatList
      data={data}
      numColumns={2}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item }) => (
        <TouchableOpacity 
          style={[styles.card, scratchedCards[item.id] ? styles.wonCard : null]} 
          onPress={() => handleScratch(item.id)}
          activeOpacity={0.8}
        >
          {scratchedCards[item.id] && item.amount !== null ? (
            <>
              <Text style={styles.winText}>🎁 You Won</Text>
              <Text style={styles.amount}>💰 {item.amount.toFixed(2)}</Text>
              <TouchableOpacity style={styles.collectButton} onPress={() => onCollectPrize(item.id)}>
                <Text style={styles.collectText}>Collect</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.scratchText}>SCRATCH CARD</Text>
          )}
        </TouchableOpacity>
      )}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  card: {
    width: SCREEN_WIDTH * 0.4,
    height: 120,
    backgroundColor: '#2C2F5B', // Dark background
    borderRadius: 10,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wonCard: {
    borderColor: '#FFD700',
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
  },
  scratchText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  winText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 5,
  },
  collectButton: {
    marginTop: 10,
    backgroundColor: '#F5F5F5',
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  collectText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default ScratchCardList;
