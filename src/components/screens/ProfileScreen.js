// src/components/screens/ProfileScreen.js
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  SafeAreaView,
  FlatList,
  Dimensions,
  Platform,
  Alert
} from 'react-native';
import { colors } from '../../theme';
import { useAuth } from '../../hooks/useAuth';

// Mock data for grid posts
const GRID_POSTS = [
  { id: '1', image: 'https://picsum.photos/id/10/500/500' },
  { id: '2', image: 'https://picsum.photos/id/11/500/500' },
  { id: '3', image: 'https://picsum.photos/id/12/500/500' },
  { id: '4', image: 'https://picsum.photos/id/13/500/500' },
  { id: '5', image: 'https://picsum.photos/id/14/500/500' },
  { id: '6', image: 'https://picsum.photos/id/15/500/500' },
  { id: '7', image: 'https://picsum.photos/id/16/500/500' },
  { id: '8', image: 'https://picsum.photos/id/17/500/500' },
  { id: '9', image: 'https://picsum.photos/id/18/500/500' },
];

// Mock data for highlights
const HIGHLIGHTS = [
  { id: 'new', title: 'New', isAdd: true },
  { id: '1', title: 'Friends', image: 'https://picsum.photos/id/20/200/200' },
  { id: '2', title: 'Sport', image: 'https://picsum.photos/id/21/200/200' },
  { id: '3', title: 'Design', image: 'https://picsum.photos/id/22/200/200' },
];

const { width } = Dimensions.get('window');
const POST_SIZE = width / 3;

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  
  // Placeholder data if user is not available yet
  const userData = user || {
    name: 'Jacob West',
    username: 'jacob_w',
    bio: 'Digital goodies designer @pixsellz\nEverything is designed.',
    website: 'pixsellz.io',
    posts: 54,
    followers: 834,
    following: 162
  };
  
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Logout", 
          onPress: () => logout(),
          style: "destructive"
        }
      ]
    );
  };
  
  const HighlightItem = ({ item }) => (
    <TouchableOpacity style={styles.highlightItem}>
      <View style={styles.highlightCircle}>
        {item.isAdd ? (
          <View style={styles.addHighlightButton}>
            <Text style={styles.addHighlightIcon}>+</Text>
          </View>
        ) : (
          <Image 
            source={{ uri: item.image }} 
            style={styles.highlightImage} 
          />
        )}
      </View>
      <Text style={styles.highlightTitle} numberOfLines={1}>{item.title}</Text>
    </TouchableOpacity>
  );

  const GridItem = ({ item }) => (
    <TouchableOpacity style={styles.gridItem}>
      <Image source={{ uri: item.image }} style={styles.gridImage} />
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.profileImageContainer}>
          <Image 
            source={{ uri: userData.avatar || 'https://picsum.photos/id/1025/500/500' }} 
            style={styles.profileImage}
          />
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userData.posts}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userData.followers}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userData.following}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>
      </View>
      
      {/* Profile Info */}
      <View style={styles.profileInfo}>
        <Text style={styles.userName}>{userData.name}</Text>
        <Text style={styles.userBio}>{userData.bio}</Text>
      </View>
      
      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity style={styles.editProfileButton}>
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      
      {/* Story Highlights */}
      <FlatList
        data={HIGHLIGHTS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <HighlightItem item={item} />}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.highlightsContainer}
        contentContainerStyle={styles.highlightsContent}
      />
      
      {/* Tab Header */}
      <View style={styles.tabHeader}>
        <TouchableOpacity style={[styles.tabButton, styles.activeTab]}>
          <Text style={styles.tabIcon}>□</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabButton}>
          <Text style={styles.tabIcon}>○</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Navigation */}
      <View style={styles.navBar}>
        <View style={styles.leftNavSection}>
          <TouchableOpacity style={styles.lock}>
            <Text>🔒</Text>
          </TouchableOpacity>
          <Text style={styles.username}>{userData.username}</Text>
          <Text style={styles.dropdownIcon}>▼</Text>
        </View>
        <View style={styles.rightNavSection}>
          <TouchableOpacity style={styles.navButton}>
            <Text>➕</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={() => {}}>
            <Text>☰</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Post Grid */}
      <FlatList
        data={GRID_POSTS}
        renderItem={({ item }) => <GridItem item={item} />}
        keyExtractor={(item) => item.id}
        numColumns={3}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 44,
    paddingHorizontal: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#dbdbdb',
  },
  leftNavSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightNavSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lock: {
    marginRight: 5,
  },
  username: {
    fontWeight: '600',
    fontSize: 16,
    marginRight: 5,
  },
  dropdownIcon: {
    fontSize: 12,
  },
  navButton: {
    marginLeft: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  profileImageContainer: {
    marginRight: 25,
  },
  profileImage: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 0.5,
    borderColor: '#dbdbdb',
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 13,
    color: '#262626',
  },
  profileInfo: {
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 3,
  },
  userBio: {
    fontSize: 13,
    lineHeight: 18,
  },
  userWebsite: {
    fontSize: 13,
    color: '#003569',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  editProfileButton: {
    flex: 1,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#dbdbdb',
    marginRight: 5,
  },
  editProfileText: {
    fontWeight: '600',
    fontSize: 13,
  },
  logoutButton: {
    flex: 1,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ed4956',
    marginLeft: 5,
  },
  logoutText: {
    color: '#ed4956',
    fontWeight: '600',
    fontSize: 13,
  },
  highlightsContainer: {
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#dbdbdb',
  },
  highlightsContent: {
    paddingHorizontal: 15,
  },
  highlightItem: {
    alignItems: 'center',
    marginRight: 15,
    width: 75,
  },
  highlightCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#dbdbdb',
  },
  highlightImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  addHighlightButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  addHighlightIcon: {
    fontSize: 28,
    fontWeight: '300',
    color: '#262626',
  },
  highlightTitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  tabHeader: {
    flexDirection: 'row',
    height: 44,
    borderBottomWidth: 0.5,
    borderBottomColor: '#dbdbdb',
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 1,
    borderBottomColor: '#262626',
  },
  tabIcon: {
    fontSize: 24,
  },
  gridItem: {
    width: POST_SIZE,
    height: POST_SIZE,
    padding: 0.5,
  },
  gridImage: {
    flex: 1,
  },
});

export default ProfileScreen;