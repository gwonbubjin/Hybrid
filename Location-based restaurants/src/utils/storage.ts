import { Restaurant } from "../components/RestaurantCard";

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  timestamp: number;
  title: string;
  content: string;
  images: string[];
  likes: number;
  likedBy: string[];
  comments: Comment[];
  category: string;
  restaurants: {
    id: string;
    name: string;
    category: string;
  }[];
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: number;
}

export interface Review {
  id: string;
  restaurantId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  content: string;
  timestamp: number;
  images: string[];
}

export interface ActivityLog {
  date: string;
  distance: number;
  visits: number;
  restaurantIds: string[];
}

// 로컬 스토리지 키
const STORAGE_KEYS = {
  POSTS: 'foodmap_posts',
  CURRENT_USER: 'foodmap_current_user',
  ACTIVITY_LOGS: 'foodmap_activity_logs',
  VISITED_RESTAURANTS: 'foodmap_visited_restaurants',
  REVIEWS: 'foodmap_reviews',
};

// 현재 사용자 정보
export function getCurrentUser() {
  const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (stored) {
    return JSON.parse(stored);
  }
  const user = {
    id: 'user_' + Date.now(),
    name: '맛집탐험가',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
  };
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  return user;
}

// 게시물 관련
export function getPosts(): Post[] {
  const stored = localStorage.getItem(STORAGE_KEYS.POSTS);
  return stored ? JSON.parse(stored) : [];
}

export function savePosts(posts: Post[]) {
  localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
}

export function createPost(
  title: string,
  content: string,
  category: string,
  restaurants: Restaurant[],
  images: string[] = []
): Post {
  const user = getCurrentUser();
  const posts = getPosts();
  
  const newPost: Post = {
    id: 'post_' + Date.now(),
    userId: user.id,
    userName: user.name,
    userAvatar: user.avatar,
    timestamp: Date.now(),
    title,
    content,
    images: images.length > 0 ? images : restaurants.slice(0, 2).map(r => r.image),
    likes: 0,
    likedBy: [],
    comments: [],
    category,
    restaurants: restaurants.map(r => ({
      id: r.id,
      name: r.name,
      category: r.category,
    })),
  };
  
  posts.unshift(newPost);
  savePosts(posts);
  return newPost;
}

export function likePost(postId: string) {
  const user = getCurrentUser();
  const posts = getPosts();
  const post = posts.find(p => p.id === postId);
  
  if (post) {
    if (post.likedBy.includes(user.id)) {
      post.likedBy = post.likedBy.filter(id => id !== user.id);
      post.likes--;
    } else {
      post.likedBy.push(user.id);
      post.likes++;
    }
    savePosts(posts);
  }
}

export function addComment(postId: string, content: string) {
  const user = getCurrentUser();
  const posts = getPosts();
  const post = posts.find(p => p.id === postId);
  
  if (post) {
    const comment: Comment = {
      id: 'comment_' + Date.now(),
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      content,
      timestamp: Date.now(),
    };
    post.comments.push(comment);
    savePosts(posts);
  }
}

// 활동 로그 관련
export function getActivityLogs(): ActivityLog[] {
  const stored = localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS);
  return stored ? JSON.parse(stored) : [];
}

export function saveActivityLogs(logs: ActivityLog[]) {
  localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(logs));
}

export function addActivityLog(distance: number, restaurantIds: string[]) {
  const logs = getActivityLogs();
  const today = new Date().toISOString().split('T')[0];
  
  const existingLog = logs.find(log => log.date === today);
  if (existingLog) {
    existingLog.distance += distance;
    existingLog.visits += restaurantIds.length;
    existingLog.restaurantIds.push(...restaurantIds);
  } else {
    logs.push({
      date: today,
      distance,
      visits: restaurantIds.length,
      restaurantIds,
    });
  }
  
  // 최근 30일 데이터만 유지
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const filteredLogs = logs.filter(log => new Date(log.date) >= thirtyDaysAgo);
  
  saveActivityLogs(filteredLogs);
}

export function getWeeklyActivityLogs(): ActivityLog[] {
  const logs = getActivityLogs();
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 6);
  
  const weeklyLogs: ActivityLog[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekAgo);
    date.setDate(weekAgo.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    const log = logs.find(l => l.date === dateStr);
    weeklyLogs.push(log || {
      date: dateStr,
      distance: 0,
      visits: 0,
      restaurantIds: [],
    });
  }
  
  return weeklyLogs;
}

// 방문한 맛집 관련
export function getVisitedRestaurants(): Restaurant[] {
  const stored = localStorage.getItem(STORAGE_KEYS.VISITED_RESTAURANTS);
  return stored ? JSON.parse(stored) : [];
}

export function saveVisitedRestaurants(restaurants: Restaurant[]) {
  localStorage.setItem(STORAGE_KEYS.VISITED_RESTAURANTS, JSON.stringify(restaurants));
}

export function addVisitedRestaurant(restaurant: Restaurant) {
  const visited = getVisitedRestaurants();
  const exists = visited.find(r => r.id === restaurant.id);
  
  if (!exists) {
    visited.push(restaurant);
    saveVisitedRestaurants(visited);
  }
}

// 리뷰 관련
export function getReviews(restaurantId?: string): Review[] {
  const stored = localStorage.getItem(STORAGE_KEYS.REVIEWS);
  const allReviews: Review[] = stored ? JSON.parse(stored) : [];
  
  if (restaurantId) {
    return allReviews.filter(review => review.restaurantId === restaurantId);
  }
  
  return allReviews;
}

export function saveReviews(reviews: Review[]) {
  localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
}

export function createReview(
  restaurantId: string,
  rating: number,
  content: string,
  images: string[] = []
): Review {
  const user = getCurrentUser();
  const reviews = getReviews();
  
  const newReview: Review = {
    id: 'review_' + Date.now(),
    restaurantId,
    userId: user.id,
    userName: user.name,
    userAvatar: user.avatar,
    rating,
    content,
    timestamp: Date.now(),
    images,
  };
  
  reviews.unshift(newReview);
  saveReviews(reviews);
  return newReview;
}

export function deleteReview(reviewId: string) {
  const reviews = getReviews();
  const filtered = reviews.filter(r => r.id !== reviewId);
  saveReviews(filtered);
}

// 게시물 수정
export function updatePost(postId: string, title: string, content: string, category: string) {
  const posts = getPosts();
  const post = posts.find(p => p.id === postId);
  
  if (post) {
    post.title = title;
    post.content = content;
    post.category = category;
    savePosts(posts);
  }
}

// 게시물 삭제
export function deletePost(postId: string) {
  const posts = getPosts();
  const filtered = posts.filter(p => p.id !== postId);
  savePosts(filtered);
}
