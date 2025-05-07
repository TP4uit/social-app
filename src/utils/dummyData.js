export const dummyPosts = [
    {
      id: '1',
      content: 'Just launched my new social media app! Excited to share it with everyone.',
      createdAt: new Date().toISOString(),
      likes: 42,
      comments: [{ id: '101', text: 'Looks great!' }],
      author: {
        id: '1001',
        name: 'John Developer',
        avatar: null
      }
    },
    {
      id: '2',
      content: 'Beautiful day for coding outside! #reactnative #javascript',
      createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      likes: 18,
      comments: [
        { id: '201', text: 'Where are you working from?' },
        { id: '202', text: 'Nice view!' }
      ],
      author: {
        id: '1002',
        name: 'Sarah Coder',
        avatar: null
      },
      image: 'https://picsum.photos/600/400' // Example image URL
    }
  ];