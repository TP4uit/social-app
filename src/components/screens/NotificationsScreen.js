// src/components/screens/NotificationsScreen.js
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image,
  SafeAreaView
} from 'react-native';

// Dummy data for activity
const NOTIFICATIONS = [
  {
    section: 'Follow Requests',
    id: 'section-1',
    data: []
  },
  {
    section: 'New',
    id: 'section-2',
    data: [
      {
        id: '1',
        type: 'like',
        user: {
          id: '101',
          username: 'karennne',
          avatar: 'https://randomuser.me/api/portraits/women/79.jpg'
        },
        content: 'liked your photo',
        time: '1h',
        photo: 'https://picsum.photos/id/10/300/300',
      }
    ]
  },
  {
    section: 'Today',
    id: 'section-3',
    data: [
      {
        id: '2',
        type: 'like',
        user: {
          id: '102',
          username: 'kiero_d',
          avatar: 'https://randomuser.me/api/portraits/men/29.jpg'
        },
        content: 'and 26 others liked your photo',
        time: '3h',
        photo: 'https://picsum.photos/id/11/300/300',
        otherUsers: [
          {
            id: '1021',
            username: 'zackjohn',
            avatar: 'https://randomuser.me/api/portraits/men/86.jpg'
          }
        ]
      }
    ]
  },
  {
    section: 'This Week',
    id: 'section-4',
    data: [
      {
        id: '3',
        type: 'comment',
        user: {
          id: '103',
          username: 'craig_love',
          avatar: 'https://randomuser.me/api/portraits/men/40.jpg'
        },
        content: 'mentioned you in a comment: @jacob_w exactly...',
        time: '2d',
        photo: 'https://picsum.photos/id/12/300/300',
      },
      {
        id: '4',
        type: 'follow',
        user: {
          id: '104',
          username: 'martini_rond',
          avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
        },
        content: 'started following you',
        time: '3d',
        showFollowButton: true
      },
      {
        id: '5',
        type: 'follow',
        user: {
          id: '105',
          username: 'maxjacobson',
          avatar: 'https://randomuser.me/api/portraits/men/44.jpg'
        },
        content: 'started following you',
        time: '3d',
        showFollowButton: true
      },
      {
        id: '6',
        type: 'follow',
        user: {
          id: '106',
          username: 'mis_potter',
          avatar: 'https://randomuser.me/api/portraits/women/67.jpg'
        },
        content: 'started following you',
        time: '3d',
        showFollowButton: false,
        followed: true
      }
    ]
  },
  {
    section: 'This Month',
    id: 'section-5',
    data: [
      {
        id: '7',
        type: 'follow',
        user: {
          id: '107',
          username: 'm_humphrey',
          avatar: 'https://randomuser.me/api/portraits/women/45.jpg'
        },
        content: 'started following you',
        time: '2w',
        showFollowButton: false
      }
    ]
  }
];

const NotificationsScreen = () => {
  const renderSectionHeader = ({ section }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.section}</Text>
    </View>
  );

  const renderNotificationItem = ({ item }) => {
    return (
      <TouchableOpacity style={styles.notificationItem}>
        <Image 
          source={{ uri: item.user.avatar }} 
          style={styles.avatar} 
        />
        
        <View style={styles.notificationContent}>
          <Text style={styles.notificationText}>
            <Text style={styles.username}>{item.user.username} </Text>
            {item.content}
            <Text style={styles.timeText}> • {item.time}</Text>
          </Text>
        </View>
        
        {item.showFollowButton && (
          <TouchableOpacity 
            style={[
              styles.followButton, 
              item.followed ? styles.followingButton : {}
            ]}
          >
            <Text style={[
              styles.followButtonText,
              item.followed ? styles.followingButtonText : {}
            ]}>
              {item.followed ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
        )}
        
        {item.photo && (
          <Image 
            source={{ uri: item.photo }} 
            style={styles.contentImage} 
          />
        )}
      </TouchableOpacity>
    );
  };

  // Main fix is here - use FlatList properly
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activity</Text>
      </View>

      <FlatList
        data={NOTIFICATIONS}
        keyExtractor={(item) => item.id} // Use the proper unique ID
        renderItem={({ item }) => (
          <View>
            {renderSectionHeader({ section: item })}
            <FlatList
              data={item.data}
              keyExtractor={(notification) => notification.id}
              renderItem={renderNotificationItem}
              scrollEnabled={false}
            />
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    height: 44,
    borderBottomWidth: 0.5,
    borderBottomColor: '#dbdbdb',
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionHeader: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '600',
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 15,
  },
  notificationContent: {
    flex: 1,
    marginRight: 10,
  },
  notificationText: {
    fontSize: 13,
    lineHeight: 18,
  },
  username: {
    fontWeight: '600',
  },
  timeText: {
    color: '#8e8e8e',
  },
  followButton: {
    backgroundColor: '#0095f6',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginHorizontal: 8,
  },
  followButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 13,
  },
  followingButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbdbdb',
  },
  followingButtonText: {
    color: '#262626',
  },
  contentImage: {
    width: 44,
    height: 44,
  },
});

export default NotificationsScreen;