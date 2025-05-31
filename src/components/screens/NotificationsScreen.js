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
import { colors, spacing, typography } from '../../theme'; // Đảm bảo đường dẫn này chính xác

// Dữ liệu mẫu cập nhật theo thiết kế Figma
const ACTIVITY_DATA = [
  {
    section: 'Follow Requests',
    id: 'section-follow-requests', // Giữ lại ID cho keyExtractor
    data: [
      {
        id: 'fr1', // ID duy nhất cho mục
        type: 'follow_request',
        user: {
          id: 'user_sophia', // ID người dùng
          username: 'Sophia Bennett',
          avatar: 'https://randomuser.me/api/portraits/women/68.jpg' // Ảnh đại diện mẫu
        },
        time: '2d', // Thời gian từ Figma
        // Không có isFollowing vì đây là request, nút sẽ là "Follow"
      }
    ]
  },
  {
    section: 'New',
    id: 'section-new',
    data: [
      {
        id: 'new1',
        type: 'like',
        user: {
          id: 'user_liam',
          username: 'Liam Carter',
          avatar: 'https://randomuser.me/api/portraits/men/41.jpg'
        },
        content: 'liked your photo',
        time: '1h',
        photo: 'https://picsum.photos/id/201/50/50', // Ảnh thumbnail mẫu
      },
      {
        id: 'new2',
        type: 'comment', // Figma ghi là "mentioned you in a photo", nhưng thường là comment
        user: {
          id: 'user_ava',
          username: 'Ava Harper',
          avatar: 'https://randomuser.me/api/portraits/women/42.jpg'
        },
        content: 'mentioned you in a comment: @jacob_w exactly...', // Nội dung từ Figma
        time: '2h',
        photo: 'https://picsum.photos/id/202/50/50',
      },
      {
        id: 'new3',
        type: 'follow',
        user: {
          id: 'user_noah',
          username: 'Noah Thompson',
          avatar: 'https://randomuser.me/api/portraits/men/43.jpg'
        },
        content: 'started following you.', // Thêm dấu chấm cho nhất quán
        time: '3h',
        isFollowing: false, // Mặc định là chưa follow lại
      }
    ]
  },
  {
    section: 'Today',
    id: 'section-today',
    data: [
      {
        id: 'today1',
        type: 'like',
        user: {
          id: 'user_olivia',
          username: 'Olivia Davis',
          avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
        },
        content: 'liked your photo',
        time: '6h',
        photo: 'https://picsum.photos/id/203/50/50',
      },
      {
        id: 'today2',
        type: 'comment',
        user: {
          id: 'user_ethan',
          username: 'Ethan Walker',
          avatar: 'https://randomuser.me/api/portraits/men/45.jpg'
        },
        content: 'commented on your photo: Great shot!', // Giả định nội dung comment
        time: '8h',
        photo: 'https://picsum.photos/id/204/50/50',
      },
      {
        id: 'today3',
        type: 'follow',
        user: {
          id: 'user_isabella',
          username: 'Isabella Clark',
          avatar: 'https://randomuser.me/api/portraits/women/46.jpg'
        },
        content: 'started following you.',
        time: '10h',
        isFollowing: true, // Theo Figma là "Following"
      }
    ]
  },
  {
    section: 'This Week',
    id: 'section-this-week',
    data: [
      {
        id: 'week1',
        type: 'like',
        user: {
          id: 'user_lucas',
          username: 'Lucas Bennett',
          avatar: 'https://randomuser.me/api/portraits/men/47.jpg'
        },
        content: 'liked your photo',
        time: '2d',
        photo: 'https://picsum.photos/id/205/50/50',
      },
      {
        id: 'week2',
        type: 'comment',
        user: {
          id: 'user_mia',
          username: 'Mia Turner',
          avatar: 'https://randomuser.me/api/portraits/women/48.jpg'
        },
        content: 'mentioned you in a comment: Awesome!', // Giả định nội dung
        time: '3d',
        photo: 'https://picsum.photos/id/206/50/50',
      },
      {
        id: 'week3',
        type: 'follow',
        user: {
          id: 'user_owen',
          username: 'Owen Harris',
          avatar: 'https://randomuser.me/api/portraits/men/49.jpg'
        },
        content: 'started following you.',
        time: '4d',
        isFollowing: true, // Theo Figma là "Following"
      }
    ]
  },
  // Bỏ section "This Month" vì không có trong Figma
];

const NotificationsScreen = ({ navigation }) => {
  // State cho nút follow được quản lý cục bộ trong từng item
  const [activityData, setActivityData] = React.useState(ACTIVITY_DATA);

  const handleFollowToggle = (sectionId, itemId) => {
    setActivityData(prevData =>
      prevData.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            data: section.data.map(item => {
              if (item.id === itemId) {
                return { ...item, isFollowing: !item.isFollowing };
              }
              return item;
            }),
          };
        }
        return section;
      })
    );
    // Trong ứng dụng thực tế, bạn sẽ gọi API ở đây
  };


  const renderSectionHeader = ({ section }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.section}</Text>
    </View>
  );

  const renderNotificationItem = ({ item, sectionId }) => { // Thêm sectionId để cập nhật đúng
    return (
      <TouchableOpacity style={styles.notificationItem}>
        <Image
          source={{ uri: item.user.avatar }}
          style={styles.avatar}
        />

        <View style={styles.notificationContent}>
          <Text style={styles.notificationText} numberOfLines={2}>
            <Text style={styles.username}>{item.user.username} </Text>
            {item.content}
            <Text style={styles.timeText}> {item.time}</Text>
          </Text>
        </View>

        {(item.type === 'follow' || item.type === 'follow_request') && (
          <TouchableOpacity
            style={[
              styles.followButton,
              item.isFollowing ? styles.followingButton : styles.notFollowingButton
            ]}
            onPress={() => handleFollowToggle(sectionId, item.id)}
          >
            <Text style={[
              styles.followButtonText,
              item.isFollowing ? styles.followingButtonText : styles.notFollowingButtonText
            ]}>
              {item.isFollowing ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
        )}

        {item.photo && item.type !== 'follow' && item.type !== 'follow_request' && (
          <Image
            source={{ uri: item.photo }}
            style={styles.contentImage}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {/* Giả sử bạn có màn hình Settings và navigation được truyền vào */}
        <TouchableOpacity onPress={() => navigation && navigation.navigate('Settings')}>
          <Text style={styles.settingsIcon}>⋮</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={activityData} // Sử dụng state đã cập nhật
        keyExtractor={(item) => item.id} // Key cho section
        renderItem={({ item: sectionItem }) => ( // sectionItem là một section từ ACTIVITY_DATA
          <View>
            {renderSectionHeader({ section: sectionItem })}
            <FlatList
              data={sectionItem.data}
              keyExtractor={(notification) => notification.id} // Key cho từng notification item
              renderItem={({item: notification}) => renderNotificationItem({item: notification, sectionId: sectionItem.id})}
              scrollEnabled={false} // Vì FlatList cha đã scroll rồi
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
    backgroundColor: colors.white, // Sử dụng màu từ theme
  },
  header: {
    flexDirection: 'row', // Sắp xếp các item trên cùng một hàng
    justifyContent: 'space-between', // Đẩy tiêu đề sang trái, icon sang phải
    alignItems: 'center', // Căn giữa theo chiều dọc
    height: 56, // Chiều cao tiêu chuẩn cho header, có thể điều chỉnh
    paddingHorizontal: spacing.md, // Khoảng cách lề ngang từ theme
    borderBottomWidth: 1,
    borderBottomColor: colors.border, // Màu viền từ theme
  },
  headerTitle: {
    fontSize: typography.fontSize.xl, // Kích thước chữ từ theme
    fontWeight: 'bold', // Figma thường dùng chữ đậm cho tiêu đề
    color: colors.text, // Màu chữ từ theme
  },
  settingsIcon: {
    fontSize: 24, // Kích thước icon, có thể điều chỉnh
    color: colors.text,
  },
  sectionHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg, // Tăng khoảng cách phía trên cho tiêu đề section
    paddingBottom: spacing.sm,
    backgroundColor: colors.white, // Đảm bảo nền trắng
  },
  sectionHeaderText: {
    fontSize: typography.fontSize.lg, // Kích thước chữ cho tiêu đề section
    fontWeight: 'bold',
    color: colors.text,
  },
  notificationItem: {
    flexDirection: 'row',
    paddingVertical: spacing.sm, // Khoảng cách lề dọc
    paddingHorizontal: spacing.md, // Khoảng cách lề ngang
    alignItems: 'center', // Căn giữa các item theo chiều dọc
    // Không cần borderBottom ở đây nữa vì FlatList cha sẽ xử lý nếu cần, hoặc mỗi item tự có
  },
  avatar: {
    width: 40, // Kích thước avatar từ Figma
    height: 40,
    borderRadius: 20, // Bo tròn avatar
    marginRight: spacing.md, // Khoảng cách bên phải avatar
  },
  notificationContent: {
    flex: 1, // Để nội dung chiếm hết không gian còn lại
    marginRight: spacing.sm, // Khoảng cách nhỏ trước nút/ảnh thumbnail
  },
  notificationText: {
    fontSize: typography.fontSize.sm, // Kích thước chữ cho nội dung thông báo
    color: colors.text,
    lineHeight: typography.fontSize.sm * 1.4, // Tăng lineHeight cho dễ đọc
  },
  username: {
    fontWeight: 'bold', // Tên người dùng in đậm
  },
  timeText: {
    color: colors.textSecondary, // Màu chữ phụ cho thời gian
    fontSize: typography.fontSize.xs, // Thời gian nhỏ hơn một chút
  },
  followButton: {
    paddingHorizontal: 15, // Tăng padding ngang cho nút rộng hơn
    paddingVertical: 7,   // Padding dọc
    borderRadius: 6,      // Bo góc nút
    justifyContent: 'center',
    alignItems: 'center',
    height: 30, // Chiều cao nút nhất quán
    minWidth: 70, // Chiều rộng tối thiểu
  },
  notFollowingButton: {
    backgroundColor: colors.primary, // Màu xanh cho nút "Follow"
  },
  followingButton: {
    backgroundColor: colors.white, // Nền trắng cho nút "Following"
    borderWidth: 1,
    borderColor: colors.border, // Viền xám nhạt
  },
  followButtonText: {
    fontSize: typography.fontSize.xs,
    fontWeight: 'bold',
  },
  notFollowingButtonText: {
    color: colors.white, // Chữ trắng trên nền xanh
  },
  followingButtonText: {
    color: colors.text, // Chữ đen trên nền trắng
  },
  contentImage: {
    width: 40, // Kích thước ảnh thumbnail
    height: 40,
    borderRadius: 4, // Bo góc nhẹ cho thumbnail
    // marginLeft: spacing.sm, // Không cần nếu nút không hiển thị
  },
});

export default NotificationsScreen;