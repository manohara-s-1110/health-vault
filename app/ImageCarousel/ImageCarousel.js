import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Image,
  Dimensions,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Text
} from 'react-native';
import { CAROUSEL_ITEMS } from './CarouselData';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width - 40; // Full width minus padding

const ImageCarousel = () => {
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // --- Auto Slide Logic ---
  useEffect(() => {
    let interval = setInterval(() => {
      const nextIndex = currentIndex === CAROUSEL_ITEMS.length - 1 ? 0 : currentIndex + 1;

      if (flatListRef.current) {
        flatListRef.current.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        setCurrentIndex(nextIndex);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const handlePress = async (url) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  };

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => handlePress(item.url)}
        style={styles.cardContainer}
      >
        {/* Added onError to log issues */}
        <Image
          source={{ uri: item.image }}
          style={styles.image}
          onError={(e) => console.log("Image Load Error:", e.nativeEvent.error)}
        />
        <View style={styles.textOverlay}>
            <Text style={styles.titleText}>{item.title}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.carouselContainer}>
      <FlatList
        ref={flatListRef}
        data={CAROUSEL_ITEMS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        snapToInterval={ITEM_WIDTH}
        decelerationRate="fast"
        style={{ flexGrow: 0 }}
        contentContainerStyle={styles.listContent}

        // Layout helper to prevent scroll errors
        getItemLayout={(data, index) => ({
          length: ITEM_WIDTH,
          offset: ITEM_WIDTH * index,
          index,
        })}

        onMomentumScrollEnd={(event) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x / ITEM_WIDTH
          );
          setCurrentIndex(index);
        }}

        onScrollToIndexFailed={(info) => {
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
            flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
          });
        }}
      />

      {/* Dots Indicator */}
      <View style={styles.dotsContainer}>
        {CAROUSEL_ITEMS.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { backgroundColor: index === currentIndex ? '#007AFF' : '#CCC' }
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  carouselContainer: {
    marginTop: 20,
    marginBottom: 10,
    alignItems: 'center',
    height: 200,
  },
  listContent: {
    paddingHorizontal: 20,
  },
  cardContainer: {
    width: ITEM_WIDTH,
    height: 180,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#E0E0E0', // Fallback color if image fails
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    backgroundColor: '#CCC', // Grey background while loading
  },
  textOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 10,
  },
  titleText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});

export default ImageCarousel;