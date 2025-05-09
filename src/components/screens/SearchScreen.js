// src/components/screens/SearchScreen.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  FlatList, 
  Image, 
  TouchableOpacity,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { colors } from '../../theme';

// Mock categories for search
const CATEGORIES = [
  { id: '1', name: 'IGTV' },
  { id: '2', name: 'Shop' },
  { id: '3', name: 'Style' },
  { id: '4', name: 'Sports' },
  { id: '5', name: 'Auto' },
  { id: '6', name: 'Travel' },
  { id: '7', name: 'Food' },
  { id: '8', name: 'Art' },
  { id: '9', name: 'Music' },
];

// Mock data for explore grid
const EXPLORE_POSTS = [
  // Row 1
  { id: '1', image: 'https://picsum.photos/id/1/500/500', aspectRatio: 1 },
  { id: '2', image: 'https://picsum.photos/id/2/500/500', aspectRatio: 1 },
  { id: '3', image: 'https://picsum.photos/id/3/500/500', aspectRatio: 1 },
  // Row 2
  { id: '4', image: 'https://picsum.photos/id/4/500/800', aspectRatio: 0.625 },
  { id: '5', image: 'https://picsum.photos/id/5/800/500', aspectRatio: 1.6 },
  // Row 3
  { id: '6', image: 'https://picsum.photos/id/6/500/500', aspectRatio: 1 },
  { id: '7', image: 'https://picsum.photos/id/7/500/500', aspectRatio: 1 },
  { id: '8', image: 'https://picsum.photos/id/8/500/500', aspectRatio: 1 },
  // Row 4
  { id: '9', image: 'https://picsum.photos/id/9/800/500', aspectRatio: 1.6 },
  { id: '10', image: 'https://picsum.photos/id/10/500/800', aspectRatio: 0.625 },
  // Continue with more rows as needed
  { id: '11', image: 'https://picsum.photos/id/11/500/500', aspectRatio: 1 },
  { id: '12', image: 'https://picsum.photos/id/12/500/500', aspectRatio: 1 },
  { id: '13', image: 'https://picsum.photos/id/13/500/500', aspectRatio: 1 },
  { id: '14', image: 'https://picsum.photos/id/14/500/500', aspectRatio: 1 },
  { id: '15', image: 'https://picsum.photos/id/15/500/500', aspectRatio: 1 },
];

const { width } = Dimensions.get('window');
const SPACING = 1;
const ITEM_WIDTH = (width - SPACING * 4) / 3;

const SearchScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');

  const renderCategory = ({ item }) => (
    <TouchableOpacity style={styles.categoryItem}>
      <Text style={styles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderGridItem = ({ item, index }) => {
    let itemStyle = { width: ITEM_WIDTH, height: ITEM_WIDTH, margin: SPACING/2 };
    
    // Example of different sized items in a grid
    // You can adjust these conditions based on your design needs
    if (index === 3) {
      // Larger item spanning 2 columns
      itemStyle = { width: ITEM_WIDTH * 2 + SPACING, height: ITEM_WIDTH, margin: SPACING/2 };
    } else if (index === 4) {
      // Single column item with different height
      itemStyle = { width: ITEM_WIDTH, height: ITEM_WIDTH, margin: SPACING/2 };
    }
    
    return (
      <TouchableOpacity style={itemStyle}>
        <Image 
          source={{ uri: item.image }} 
          style={styles.gridImage} 
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  };

  const renderExploreGrid = () => {
    return (
      <FlatList
        data={EXPLORE_POSTS}
        keyExtractor={item => item.id}
        renderItem={renderGridItem}
        numColumns={3}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.gridContent}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#8e8e8e"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>
      
      <FlatList
        style={styles.categoryList}
        data={CATEGORIES}
        keyExtractor={item => item.id}
        renderItem={renderCategory}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
      
      {renderExploreGrid()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#dbdbdb',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#efefef',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 36,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#262626',
  },
  categoryList: {
    paddingVertical: 10,
    marginBottom: 5,
  },
  categoryItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 5,
    backgroundColor: '#efefef',
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#262626',
  },
  gridRow: {
    justifyContent: 'flex-start',
  },
  gridContent: {
    paddingHorizontal: SPACING/2,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
});

export default SearchScreen;