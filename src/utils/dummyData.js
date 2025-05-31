// src/utils/dummyData.js
import AsyncStorage from '@react-native-async-storage/async-storage';

// Dummy user accounts for login testing
export const dummyUsers = [
  {
    id: '1001',
    name: 'John Developer',
    email: 'john@example.com',
    password: 'password123', // In a real app, never store plain text passwords
    avatar: null,
    bio: 'React Native developer and tech enthusiast',
    followers: 238,
    following: 156,
    posts: 42,
    createdAt: '2023-01-15T08:30:00Z',
  },
  {
    id: '1002',
    name: 'Sarah Coder',
    email: 'sarah@example.com',
    password: 'password123',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    bio: 'Frontend developer specializing in React and React Native',
    followers: 587,
    following: 231,
    posts: 76,
    createdAt: '2023-02-18T14:22:00Z',
  },
  {
    id: '1003',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    password: 'password123',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    bio: 'Mobile app developer and coffee addict',
    followers: 842,
    following: 356,
    posts: 128,
    createdAt: '2022-11-05T19:45:00Z',
  }
];

// Dummy posts for feed
export const dummyPosts = [
  {
    id: '101',
    author: dummyUsers[0],
    content: 'Just launched my new social media app! Excited to share it with everyone. #reactnative #javascript',
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    likes: 42,
    comments: [
      { id: '1001', author: dummyUsers[1], content: 'Looks great! Can\'t wait to try it out.', createdAt: new Date(Date.now() - 2400000).toISOString() },
      { id: '1002', author: dummyUsers[2], content: 'Congrats on the launch!', createdAt: new Date(Date.now() - 1800000).toISOString() }
    ]
  },
  {
    id: '102',
    author: dummyUsers[1],
    content: 'Beautiful day for coding outside! Working on a new feature for my latest project. #javascript #coding',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
    likes: 78,
    comments: [
      { id: '1003', author: dummyUsers[2], content: 'Where are you working from? Looks peaceful!', createdAt: new Date(Date.now() - 84600000).toISOString() },
      { id: '1004', author: dummyUsers[0], content: 'Nice setup! What feature are you working on?', createdAt: new Date(Date.now() - 82800000).toISOString() }
    ]
  },
  {
    id: '103',
    author: dummyUsers[2],
    content: 'Just solved a tricky bug that\'s been bothering me for days. The solution was so simple! Sometimes you just need to step back and look at the problem differently. #debugging #programming',
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    likes: 125,
    comments: [
      { id: '1005', author: dummyUsers[0], content: 'That feeling is the best! What was the bug?', createdAt: new Date(Date.now() - 170000000).toISOString() },
      { id: '1006', author: dummyUsers[1], content: 'Been there! Sometimes the simplest solutions are the hardest to see.', createdAt: new Date(Date.now() - 169000000).toISOString() }
    ]
  },
  {
    id: '104',
    author: dummyUsers[0],
    content: 'Learning about Redux Toolkit today. It really simplifies state management compared to traditional Redux. Highly recommend checking it out if you\'re building React or React Native apps!',
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    likes: 95,
    comments: [
      { id: '1007', author: dummyUsers[1], content: 'RTK Query is a game changer too!', createdAt: new Date(Date.now() - 255200000).toISOString() }
    ]
  },
  {
    id: '105',
    author: dummyUsers[1],
    content: 'Just finished a great book on software architecture. Key takeaway: invest time in planning your architecture, it pays off exponentially as your project scales.',
    createdAt: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
    likes: 63,
    comments: [
      { id: '1008', author: dummyUsers[2], content: 'Which book was it? I\'d love to check it out.', createdAt: new Date(Date.now() - 430000000).toISOString() },
      { id: '1009', author: dummyUsers[0], content: 'So true! Poor architecture decisions come back to haunt you.', createdAt: new Date(Date.now() - 428000000).toISOString() }
    ]
  }
];

// Dummy notifications
export const dummyNotifications = [
  {
    id: '201',
    type: 'like',
    user: dummyUsers[1],
    content: 'liked your post',
    post: dummyPosts[0],
    time: '2 hours ago',
    read: false
  },
  {
    id: '202',
    type: 'comment',
    user: dummyUsers[2],
    content: 'commented on your post',
    post: dummyPosts[0],
    comment: 'Congrats on the launch!',
    time: '5 hours ago',
    read: false
  },
  {
    id: '203',
    type: 'follow',
    user: dummyUsers[1],
    content: 'started following you',
    time: '1 day ago',
    read: true
  },
  {
    id: '204',
    type: 'like',
    user: dummyUsers[2],
    content: 'liked your post',
    post: dummyPosts[3],
    time: '2 days ago',
    read: true
  }
];

// Helper function to simulate login
export const simulateLogin = async (email, password) => {
  // Simple validation
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  // Find user with matching email
  const user = dummyUsers.find(user => user.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    throw new Error('User not found');
  }

  // Check password (in a real app, you'd use proper password hashing)
  if (user.password !== password) {
    throw new Error('Invalid password');
  }

  // Create a mock token
  const token = `mock-jwt-token-${user.id}-${Date.now()}`;

  // Store the mock token in AsyncStorage
  await AsyncStorage.setItem('auth_token', token);

  // Return user data (without password) and token
  const { password: _, ...userData } = user;
  return {
    user: userData,
    token
  };
};

// Helper function to get the currently "logged in" user
export const getCurrentUser = async () => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) return null;
    
    // Extract user ID from mock token
    const userId = token.split('-')[2];
    const user = dummyUsers.find(user => user.id === userId);
    
    if (!user) return null;
    
    // Return user data without password
    const { password: _, ...userData } = user;
    return userData;
  } catch (error) {
    console.log('Error getting current user:', error);
    return null;
  }
};

// Helper function to simulate logout
export const simulateLogout = async () => {
  await AsyncStorage.removeItem('auth_token');
  return true;
};

// Function to get posts for a user
export const getUserPosts = (userId) => {
  return dummyPosts.filter(post => post.author.id === userId);
};

// Function to get a mock feed with pagination
export const getFeed = (page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedPosts = dummyPosts.slice(startIndex, endIndex);
  
  return {
    posts: paginatedPosts,
    hasMore: endIndex < dummyPosts.length,
    total: dummyPosts.length
  };
};

// Function to get a specific post by ID
export const getPostById = (postId) => {
  return dummyPosts.find(post => post.id === postId);
};

// Function to add a new post
export const createPost = (userId, content, image = null) => {
  const user = dummyUsers.find(user => user.id === userId);
  if (!user) throw new Error('User not found');
  
  const newPost = {
    id: `post-${Date.now()}`,
    author: user,
    content,
    image,
    createdAt: new Date().toISOString(),
    likes: 0,
    comments: []
  };
  
  // Add to the beginning of the posts array
  dummyPosts.unshift(newPost);
  
  return newPost;
};

// Function to simulate liking a post
export const likePost = (postId, userId) => {
  const post = dummyPosts.find(post => post.id === postId);
  if (!post) throw new Error('Post not found');
  
  // In a real app, you'd have a more complex like system
  // For simplicity, we'll just increment the likes count
  post.likes += 1;
  
  return post;
};

// Function to add a comment to a post
export const commentOnPost = (postId, userId, content) => {
  const post = dummyPosts.find(post => post.id === postId);
  if (!post) throw new Error('Post not found');
  
  const user = dummyUsers.find(user => user.id === userId);
  if (!user) throw new Error('User not found');
  
  const newComment = {
    id: `comment-${Date.now()}`,
    author: user,
    content,
    createdAt: new Date().toISOString()
  };
  
  post.comments.push(newComment);
  
  return newComment;
};

export const dummyChats = [
  {
    id: 'chat1',
    users: [dummyUsers[0], dummyUsers[1]], // Liam and Sarah
    name: dummyUsers[1].name, // Tên người chat cùng
    avatar: dummyUsers[1].avatar,
    lastMessage: 'Not bad, just finished a new script. What about you?',
    time: '2d',
    unreadCount: 0,
    messages: [
      { id: 'msg1', text: "Hey, how's it going?", sender: dummyUsers[0], timestamp: new Date(Date.now() - (2 * 24 * 60 * 60 * 1000) - (3 * 60 * 60 * 1000)).toISOString() }, // 2d 3h ago
      { id: 'msg2', text: 'Not bad, just finished a new script. What about you?', sender: dummyUsers[1], timestamp: new Date(Date.now() - (2 * 24 * 60 * 60 * 1000) - (2 * 60 * 60 * 1000)).toISOString() }, // 2d 2h ago
      { id: 'msg3', text: "Cool! I'm working on a short film project. Need any actors?", sender: dummyUsers[0], timestamp: new Date(Date.now() - (2 * 24 * 60 * 60 * 1000) - (1 * 60 * 60 * 1000)).toISOString() }, // 2d 1h ago
      { id: 'msg4', text: 'Always! Send me your reel.', sender: dummyUsers[1], timestamp: new Date(Date.now() - (2 * 24 * 60 * 60 * 1000) - (30 * 60 * 1000)).toISOString() }, // 2d 30m ago
      { id: 'msg5', text: 'Will do! Check out this mood board for the film.', sender: dummyUsers[0], image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop', timestamp: new Date(Date.now() - (2 * 24 * 60 * 60 * 1000) - (10 * 60 * 1000)).toISOString() }, // 2d 10m ago
      { id: 'msg6', text: "Looks amazing! I'm in.", sender: dummyUsers[1], timestamp: new Date(Date.now() - (2 * 24 * 60 * 60 * 1000) - (5 * 60 * 1000)).toISOString() }, // 2d 5m ago
    ],
  },
  {
    id: 'chat2',
    users: [dummyUsers[0], dummyUsers[2]], // Liam and Alex
    name: dummyUsers[2].name,
    avatar: dummyUsers[2].avatar,
    lastMessage: 'Sounds good, let me know!',
    time: '17m ago',
    unreadCount: 2,
    messages: [
      { id: 'msg7', text: 'Want to grab coffee later?', sender: dummyUsers[2], timestamp: new Date(Date.now() - (20 * 60 * 1000)).toISOString() }, // 20m ago
      { id: 'msg8', text: 'Sure, what time works for you?', sender: dummyUsers[0], timestamp: new Date(Date.now() - (18 * 60 * 1000)).toISOString() }, // 18m ago
      { id: 'msg9', text: 'How about 3 PM at the usual spot?', sender: dummyUsers[2], timestamp: new Date(Date.now() - (17 * 60 * 1000)).toISOString() }, // 17m ago
      { id: 'msg10', text: 'Sounds good, let me know!', sender: dummyUsers[0], timestamp: new Date(Date.now() - (17 * 60 * 1000)).toISOString() }, // 17m ago
    ],
  },
  {
    id: 'chat3',
    users: [dummyUsers[1], dummyUsers[2]], // Sarah and Alex
    name: 'Project Group', // Ví dụ một group chat
    avatar: null, // Hoặc một avatar mặc định cho group
    isGroup: true,
    lastMessage: "Don't forget the meeting at 10 AM.",
    time: '1h ago',
    unreadCount: 0,
    messages: [
       { id: 'msg11', text: "Hey team, how's the project coming along?", sender: dummyUsers[1], timestamp: new Date(Date.now() - (2 * 60 * 60 * 1000)).toISOString() }, // 2h ago
       { id: 'msg12', text: "Making good progress! Should have an update by EOD.", sender: dummyUsers[2], timestamp: new Date(Date.now() - (1.5 * 60 * 60 * 1000)).toISOString() }, // 1.5h ago
       { id: 'msg13', text: "Great! Don't forget the meeting at 10 AM.", sender: dummyUsers[1], timestamp: new Date(Date.now() - (1 * 60 * 60 * 1000)).toISOString() }, // 1h ago
    ],
  },
   {
    id: 'chat4',
    users: [dummyUsers[0]], // Noah (John) and Owen (another user)
    name: 'Owen Harris', // Tên user theo Figma
    avatar: 'https://randomuser.me/api/portraits/men/49.jpg',
    lastMessage: 'Thanks for the feedback!',
    time: '1h ago',
    unreadCount: 0,
    messages: [
        { id: 'msg14', text: 'Your latest design looks great!', sender: { id: 'user_owen', name: 'Owen Harris', avatar: 'https://randomuser.me/api/portraits/men/49.jpg'}, timestamp: new Date(Date.now() - (1.5 * 60 * 60 * 1000)).toISOString() },
        { id: 'msg15', text: 'Thanks for the feedback!', sender: dummyUsers[0], timestamp: new Date(Date.now() - (1 * 60 * 60 * 1000)).toISOString() },
    ],
  },
  {
    id: 'chat5',
    users: [dummyUsers[0]],
    name: 'Olivia Davis',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    lastMessage: 'See you then!',
    time: 'Active yesterday',
    unreadCount: 1,
     messages: [
        { id: 'msg16', text: 'Movie night tomorrow?', sender: { id: 'user_olivia', name: 'Olivia Davis', avatar: 'https://randomuser.me/api/portraits/women/44.jpg'}, timestamp: new Date(Date.now() - (25 * 60 * 60 * 1000)).toISOString() }, // Yesterday
        { id: 'msg17', text: 'Sounds fun! What time?', sender: dummyUsers[0], timestamp: new Date(Date.now() - (24.5 * 60 * 60 * 1000)).toISOString() },
        { id: 'msg18', text: '7 PM? My place.', sender: { id: 'user_olivia', name: 'Olivia Davis', avatar: 'https://randomuser.me/api/portraits/women/44.jpg'}, timestamp: new Date(Date.now() - (24 * 60 * 60 * 1000)).toISOString() },
        { id: 'msg19', text: 'See you then!', sender: dummyUsers[0], timestamp: new Date(Date.now() - (23.5 * 60 * 60 * 1000)).toISOString() },
    ],
  },
    {
    id: 'chat6',
    users: [dummyUsers[0]],
    name: 'Ava Harper',
    avatar: 'https://randomuser.me/api/portraits/women/42.jpg',
    lastMessage: 'No worries at all!',
    time: 'Active now',
    unreadCount: 0,
    messages: [
        { id: 'msg20', text: 'Hey, can you send me that file?', sender: { id: 'user_ava', name: 'Ava Harper', avatar: 'https://randomuser.me/api/portraits/women/42.jpg'}, timestamp: new Date(Date.now() - (10 * 60 * 1000)).toISOString() }, // 10m ago
        { id: 'msg21', text: 'Sure, just sent it over.', sender: dummyUsers[0], timestamp: new Date(Date.now() - (8 * 60 * 1000)).toISOString() },
        { id: 'msg22', text: 'Got it, thanks so much!', sender: { id: 'user_ava', name: 'Ava Harper', avatar: 'https://randomuser.me/api/portraits/women/42.jpg'}, timestamp: new Date(Date.now() - (5 * 60 * 1000)).toISOString() },
        { id: 'msg23', text: 'No worries at all!', sender: dummyUsers[0], timestamp: new Date(Date.now() - (2 * 60 * 1000)).toISOString() },
    ],
  },
];

// Dữ liệu cho phần "Online Users" ở ChatsScreen
export const dummyOnlineUsers = [
  { id: 'online1', name: 'Clara Bennett', avatar: 'https://randomuser.me/api/portraits/women/75.jpg' },
  { id: 'online2', name: 'Ethan Hartley', avatar: 'https://randomuser.me/api/portraits/men/75.jpg' },
  { id: 'online3', name: 'Caleb Stafford', avatar: 'https://randomuser.me/api/portraits/men/76.jpg' },
  { id: 'online4', name: 'Sophia Donovan', avatar: 'https://randomuser.me/api/portraits/women/76.jpg' },
  { id: 'online5', name: 'Amelia Rowe', avatar: 'https://randomuser.me/api/portraits/women/77.jpg' },
  { id: 'online6', name: 'Lucas Miller', avatar: 'https://randomuser.me/api/portraits/men/78.jpg' },
];

export const getChats = () => {
  // Trong thực tế, bạn có thể muốn lọc/sắp xếp các cuộc trò chuyện
  // Ví dụ: Sắp xếp theo tin nhắn cuối cùng
  return dummyChats.sort((a, b) => {
    const lastMsgA = a.messages[a.messages.length - 1];
    const lastMsgB = b.messages[b.messages.length - 1];
    return new Date(lastMsgB.timestamp) - new Date(lastMsgA.timestamp);
  });
};

export const getChatById = (chatId) => {
  return dummyChats.find(chat => chat.id === chatId);
};

export const getOnlineUsers = () => {
    return dummyOnlineUsers;
}