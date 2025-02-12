import React, { useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Icon from './Icon';
import { icon } from './Image';

const SCREEN_WIDTH = Dimensions.get('window').width;

// Define data type
interface ScratchCard {
  id: string;
  amount: number | null; // Null means not scratched yet
}

// Define props
interface ScratchCardListProps {
  data: ScratchCard[];
  navigation:any,
  onCollectPrize: (id: string) => void;
}

const ScratchCardList: React.FC<ScratchCardListProps> = ({ data, onCollectPrize,navigation }) => {
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
            <Icon  source={icon.gift}  size={30} />
              <Text style={styles.winText}> You Won</Text>
              <View style={{flexDirection:'row',alignItems:'center',marginTop:10}}>
              <Icon  source={icon.coins}  size={20} />
              <Text style={styles.amount}> {item.amount.toFixed(2)}</Text>
              </View>
              <TouchableOpacity style={styles.collectButton} onPress={() => onCollectPrize(item.id)}>
                <Text style={styles.collectText}>Collect</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={{backgroundColor:'#9397ac',width:'100%',paddingVertical:8,alignItems:'center'}}>

              <Text style={styles.scratchText}>SCRATCH CARD</Text>
            </View>
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
    height: 170,
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
    marginTop:10
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',

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
