import React, { useState } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  ImageBackground,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ScratchCardModal from './ScratchCardModal';
import { hp } from './utils/Constant';

const SCREEN_WIDTH = Dimensions.get('window').width;

// Define data type
interface ScratchCard {
  id: string;
  amount: number | null; // Null means not scratched yet
  SCRATCH: boolean;
  Coins: number;
  color: string[];
}

// Define props
interface ScratchCardListProps {
  data: ScratchCard[];
  navigation: any;
  onCollectPrize: (id: string) => void;
}

const ScratchCardList: React.FC<ScratchCardListProps> = ({
  data,
  onCollectPrize,
  navigation,
}) => {
  const [scratchedCards, setScratchedCards] = useState<{ [key: string]: boolean }>({});
  const [ScratchIndex, setScratchIndex] = useState<number | null>(null);
  const [Data, setData] = useState<ScratchCard[]>(data);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const handleScratch = (id: string) => {
    setScratchedCards((prev) => ({ ...prev, [id]: true }));
  };

  const handleCloseModal = () => {
    setIsVisible(false);
  };

  const ScratchAble = (randomNumber: number) => {
    setData((prevData) =>
      prevData.map((item, index) => {
        const newCoins = index === ScratchIndex && !item.SCRATCH ? randomNumber : item.Coins;
        return {
          ...item,
          SCRATCH: index === ScratchIndex && !item.SCRATCH ? true : item.SCRATCH,
          Coins: newCoins,
        };
      })
    );
  };

  const renderItem = ({ item, index }: { item: ScratchCard; index: number }) => {
    return (
      <>
        <TouchableOpacity
          disabled={item.SCRATCH}
          onPress={() => {
            setIsVisible(true);
            setScratchIndex(index);
          }}
          style={styles.cardContainer}
        >
          <ImageBackground

            source={require('../screen/ScratchCard/scratch_card.jpg')}
resizeMode='cover'
            style={[
              styles.gradientContainer,
              
              { padding: item.SCRATCH ? 2 : 0 ,borderRadius:10},
            ]}
          >
            {!item.SCRATCH && (
              <View style={styles.scratchArea}>
                <Text style={styles.scratchText}>SCRATCH CARD</Text>
              </View>
            )}
            {item.SCRATCH && (
              <View style={styles.wonContainer}>
                <Image
                  source={require('../screen/ScratchCard/GiftsBox.png')}
                  style={styles.giftBox}
                />
                <Text style={styles.winText}>You Won</Text>
                <View style={styles.coinContainer}>
                  <Image
                    source={require('../screen/ScratchCard/Coins.png')}
                    style={styles.coinIcon}
                  />
                  <Text style={styles.amount}>{item.Coins}.00</Text>
                </View>
              </View>
            )}
          </ImageBackground>
        </TouchableOpacity>

        <ScratchCardModal
          visible={isVisible}
          onClose={handleCloseModal}
          Scratch={ScratchAble}
          imageUri={require('../screen/ScratchCard/scratch_card.jpg')}
        />
      </>
    );
  };

  return (
    <FlatList
      data={Data}
      numColumns={2}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      renderItem={renderItem}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  cardContainer: {
    height: hp(24),
    width: '45%',
    margin: 5,
    borderRadius: 10,
    justifyContent: 'center',
  },
  gradientContainer: {
    height: hp(22),
    justifyContent: 'center',
    overflow:'hidden'
 
  },
  scratchArea: {
    height: hp(4),
    backgroundColor: 'rgba(52, 52, 52, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scratchText: {
    fontSize: 12,
    lineHeight: 15, // Fixed incorrect width property
    fontWeight: '800',
    color: '#FFFFFF',
  },
  wonContainer: {
    backgroundColor: '#ffffff',
    height: '100%',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftBox: {
    height: 45,
    width: 45,
  },
  winText: {
    fontSize: 10,
    fontWeight: '400',
    marginVertical: 5,
  },
  coinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinIcon: {
    height: 22,
    width: 22,
  },
  amount: {
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 5,
  },
});

export default ScratchCardList;
