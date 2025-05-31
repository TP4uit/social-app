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
  SafeAreaView,
  ScrollView, // Thêm ScrollView
} from 'react-native';
import { colors, spacing, typography } from '../../theme';
import Icon from 'react-native-vector-icons/Ionicons'; // Sử dụng Ionicons

// Cập nhật danh mục, bỏ "Reels" theo quyết định trước
const CATEGORIES = [
  { id: '1', name: 'For You' },
  { id: '2', name: 'Trending' },
  // { id: '3', name: 'Reels' }, // Tạm thời loại bỏ
  { id: '4', name: 'Videos' },
  { id: '5', name: 'Accounts' },
  { id: '6', name: 'Style' }, // Giữ lại một vài categories cũ hoặc thêm mới
  { id: '7', name: 'Travel' },
  { id: '8', name: 'Food' },
];

// Mock data cho lưới khám phá - có thể giữ nguyên hoặc cập nhật
const EXPLORE_POSTS = Array.from({ length: 20 }).map((_, i) => ({
  id: `${i + 1}`,
  image: `https://picsum.photos/seed/${i + 100}/300/300`, // Đảm bảo ảnh khác nhau
}));

const { width } = Dimensions.get('window');
const NUM_COLUMNS = 2; // Chuyển sang lưới 2 cột
const ITEM_MARGIN = spacing.xs / 2; // Nửa khoảng cách xs cho mỗi bên của item
const ITEM_WIDTH = (width - (NUM_COLUMNS + 1) * ITEM_MARGIN * 2) / NUM_COLUMNS; // Tính toán lại chiều rộng item

const SearchScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id); // Danh mục active đầu tiên

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        activeCategory === item.id && styles.activeCategoryItem,
      ]}
      onPress={() => setActiveCategory(item.id)}>
      <Text
        style={[
          styles.categoryText,
          activeCategory === item.id && styles.activeCategoryText,
        ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderGridItem = ({ item }) => {
    return (
      <TouchableOpacity style={styles.gridItemContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.gridImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
        <TouchableOpacity onPress={() => { /* Xử lý sự kiện cho icon map */ }}>
          <Icon name="map-outline" size={26} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search-outline" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor={colors.textSecondary}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View>
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={item => item.id}
          renderItem={renderCategory}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryListContent}
          style={styles.categoryList}
        />
      </View>

      <FlatList
        data={EXPLORE_POSTS}
        keyExtractor={item => item.id}
        renderItem={renderGridItem}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={styles.gridContent}
        // columnWrapperStyle={styles.gridRow} // Có thể không cần nếu item tự giãn cách
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    // backgroundColor: colors.white, // Đã set ở safeArea
    height: 56,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background, // Nền xám nhạt cho search bar
    borderRadius: 10,
    marginHorizontal: spacing.md,
    paddingHorizontal: spacing.sm,
    height: 40,
    marginBottom: spacing.sm,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  categoryList: {
    maxHeight: 50, // Giới hạn chiều cao của thanh category
    paddingVertical: spacing.sm,
  },
  categoryListContent: {
    paddingHorizontal: spacing.md,
  },
  categoryItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    backgroundColor: colors.background, // Nền cho pill
    borderRadius: 20, // Bo tròn nhiều hơn
    justifyContent: 'center',
    alignItems: 'center',
    height: 36,
  },
  activeCategoryItem: {
    backgroundColor: colors.primary, // Màu nền cho pill active
  },
  categoryText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    color: colors.text,
  },
  activeCategoryText: {
    color: colors.white,
  },
  gridContent: {
    paddingHorizontal: ITEM_MARGIN * 2, // Padding ngang cho toàn bộ lưới
  },
  gridItemContainer: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * 1.2, // Ảnh có thể hơi chữ nhật một chút, hoặc để là ITEM_WIDTH cho vuông
    margin: ITEM_MARGIN,
    borderRadius: 12, // Bo góc cho item
    overflow: 'hidden', // Để borderRadius hoạt động với Image
    backgroundColor: colors.border, // Màu nền placeholder cho ảnh
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
});

export default SearchScreen;