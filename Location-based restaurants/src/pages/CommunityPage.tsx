import { useState, useEffect, useRef } from "react";
import { ArrowLeft, MapPin, Star, Heart, MessageCircle, Share2, TrendingUp, Users, Send, Plus, Trash2, Edit2, MoreVertical } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Restaurant } from "../components/RestaurantCard";
import { 
  getPosts, 
  Post, 
  getCurrentUser, 
  createPost, 
  likePost, 
  addComment,
  updatePost,
  deletePost 
} from "../utils/storage";

interface CommunityPageProps {
  favorites: Restaurant[];
  onBack: () => void;
}

export function CommunityPage({ favorites, onBack }: CommunityPageProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [commentText, setCommentText] = useState("");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("전체");
  const [selectedRestaurants, setSelectedRestaurants] = useState<Restaurant[]>([]);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [openMenuPostId, setOpenMenuPostId] = useState<string | null>(null);
  const currentUser = getCurrentUser();

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = () => {
    const allPosts = getPosts();
    setPosts(allPosts);
  };

  const handleLike = (postId: string) => {
    likePost(postId);
    loadPosts();
  };

  const handleComment = () => {
    if (selectedPost && commentText.trim()) {
      addComment(selectedPost.id, commentText);
      setCommentText("");
      loadPosts();
      const updatedPosts = getPosts();
      const updatedPost = updatedPosts.find(p => p.id === selectedPost.id);
      if (updatedPost) {
        setSelectedPost(updatedPost);
      }
    }
  };

  const handleCreatePost = () => {
    if (newPostTitle.trim() && newPostContent.trim() && selectedRestaurants.length > 0) {
      if (editingPost) {
        // 수정 모드
        updatePost(editingPost.id, newPostTitle, newPostContent, newPostCategory);
        setEditingPost(null);
      } else {
        // 새 게시물 작성
        createPost(newPostTitle, newPostContent, newPostCategory, selectedRestaurants);
      }
      setNewPostTitle("");
      setNewPostContent("");
      setNewPostCategory("전체");
      setSelectedRestaurants([]);
      setShowCreatePost(false);
      loadPosts();
    }
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setNewPostTitle(post.title);
    setNewPostContent(post.content);
    setNewPostCategory(post.category);
    setShowCreatePost(true);
  };

  const handleDeletePost = (postId: string) => {
    if (confirm("게시글을 삭제하시겠습니까?")) {
      deletePost(postId);
      loadPosts();
    }
  };

  const handleCloseDialog = () => {
    setShowCreatePost(false);
    setEditingPost(null);
    setNewPostTitle("");
    setNewPostContent("");
    setNewPostCategory("전체");
    setSelectedRestaurants([]);
  };

  const toggleRestaurantSelection = (restaurant: Restaurant) => {
    if (selectedRestaurants.find(r => r.id === restaurant.id)) {
      setSelectedRestaurants(selectedRestaurants.filter(r => r.id !== restaurant.id));
    } else {
      setSelectedRestaurants([...selectedRestaurants, restaurant]);
    }
  };

  const getFilteredPosts = () => {
    let filtered = [...posts];
    
    if (activeTab === "popular") {
      filtered = filtered.sort((a, b) => b.likes - a.likes);
    } else if (activeTab === "recent") {
      filtered = filtered.sort((a, b) => b.timestamp - a.timestamp);
    }
    
    return filtered;
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return "방금 전";
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    return `${days}일 전`;
  };

  const trendingTags = posts.reduce((acc, post) => {
    const tags = post.category ? [post.category] : [];
    tags.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const topTags = Object.entries(trendingTags)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="bg-gradient-to-br from-amber-500 to-orange-600 text-white px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-white hover:bg-white/20 rounded-lg -ml-2 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Users className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl mb-1">커뮤니티</h1>
                <p className="text-white/90 text-sm">맛집 여행기와 추천 코스 공유</p>
              </div>
            </div>
            
            <Button
              onClick={() => setShowCreatePost(true)}
              className="bg-white text-primary hover:bg-white/90 rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              글쓰기
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 메인 컨텐츠 */}
          <div className="lg:col-span-2 space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-3 bg-white rounded-xl">
                <TabsTrigger value="all" className="rounded-lg">전체</TabsTrigger>
                <TabsTrigger value="popular" className="rounded-lg">인기</TabsTrigger>
                <TabsTrigger value="recent" className="rounded-lg">최신</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-4 mt-4">
                {getFilteredPosts().length === 0 ? (
                  <Card className="p-12 text-center">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-600 mb-2">아직 게시물이 없습니다</p>
                    <p className="text-gray-400 text-sm mb-4">
                      첫 번째로 맛집 여행기를 공유해보세요!
                    </p>
                    <Button onClick={() => setShowCreatePost(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      글쓰기
                    </Button>
                  </Card>
                ) : (
                  getFilteredPosts().map((post) => (
                    <Card key={post.id} className="p-5 hover:shadow-lg transition-all relative z-0">
                      {/* 작성자 정보 */}
                      <div className="flex items-center gap-3 mb-4 overflow-visible">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {post.userName.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{post.userName}</p>
                          <p className="text-xs text-gray-500">{formatTimestamp(post.timestamp)}</p>
                        </div>
                        {post.category && <Badge variant="outline">{post.category}</Badge>}
                        
                        {/* 작성자만 수정/삭제 가능 */}
                        {post.userId === currentUser.id && (
                          <div className="relative">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => setOpenMenuPostId(openMenuPostId === post.id ? null : post.id)}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                            {openMenuPostId === post.id && (
                              <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 flex">
                                <button
                                  onClick={() => {
                                    handleEditPost(post);
                                    setOpenMenuPostId(null);
                                  }}
                                  className="px-4 py-2 text-sm text-gray-900 hover:bg-gray-100 flex items-center gap-2 rounded-l-lg whitespace-nowrap"
                                >
                                  <Edit2 className="w-4 h-4" />
                                  수정
                                </button>
                                <div className="w-px bg-gray-200"></div>
                                <button
                                  onClick={() => {
                                    handleDeletePost(post.id);
                                    setOpenMenuPostId(null);
                                  }}
                                  className="px-4 py-2 text-sm text-destructive hover:bg-destructive/10 flex items-center gap-2 rounded-r-lg whitespace-nowrap"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  삭제
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 게시물 내용 */}
                      <h3 className="text-lg mb-2">{post.title}</h3>
                      <p className="text-gray-700 mb-4">{post.content}</p>

                      {/* 이미지 */}
                      {post.images.length > 0 && (
                        <div className={`grid ${post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-2 mb-4 rounded-xl overflow-hidden`}>
                          {post.images.map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`Post image ${index + 1}`}
                              className="w-full h-48 object-cover"
                            />
                          ))}
                        </div>
                      )}

                      {/* 방문한 맛집 */}
                      {post.restaurants.length > 0 && (
                        <div className="mb-4 p-3 bg-amber-50 rounded-lg">
                          <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            방문한 맛집
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {post.restaurants.map((restaurant, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {restaurant.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 액션 버튼 */}
                      <div className="flex items-center gap-4 pt-4 border-t">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="gap-2"
                          onClick={() => handleLike(post.id)}
                        >
                          <Heart className={`w-4 h-4 ${post.likedBy.includes(currentUser.id) ? 'fill-primary text-primary' : ''}`} />
                          <span>{post.likes}</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="gap-2"
                          onClick={() => setSelectedPost(post)}
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.comments.length}</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="gap-2 ml-auto"
                          onClick={() => {
                            navigator.share({
                              title: post.title,
                              text: post.content,
                            }).catch(err => console.log('Share failed:', err));
                          }}
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* 사이드바 */}
          <div className="space-y-4">
            {/* 내 정보 */}
            <Card className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {currentUser.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{currentUser.name}</p>
                  <p className="text-xs text-gray-500">
                    게시물 {posts.filter(p => p.userId === currentUser.id).length}개
                  </p>
                </div>
              </div>
              <Button onClick={() => setShowCreatePost(true)} className="w-full rounded-lg">
                <Plus className="w-4 h-4 mr-2" />
                새 글 작성
              </Button>
            </Card>

            {/* 트렌딩 토픽 */}
            {topTags.length > 0 && (
              <Card className="p-5">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  트렌딩 카테고리
                </h3>
                <div className="space-y-3">
                  {topTags.map(([tag, count], index) => (
                    <div
                      key={tag}
                      className="flex items-center justify-between hover:bg-amber-50 p-2 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-primary">#{index + 1}</span>
                        <span className="text-sm text-gray-900">{tag}</span>
                      </div>
                      <span className="text-xs text-gray-500">{count}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* 댓글 다이얼로그 */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedPost?.title}</DialogTitle>
            <DialogDescription>
              {selectedPost?.userName} • {selectedPost && formatTimestamp(selectedPost.timestamp)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-4">
            <p className="text-gray-700">{selectedPost?.content}</p>
            
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">댓글 {selectedPost?.comments.length}개</h4>
              <div className="space-y-3 mb-4">
                {selectedPost?.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs">
                        {comment.userName.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{comment.userName}</span>
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(comment.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Input
                  placeholder="댓글을 입력하세요..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleComment()}
                  className="flex-1"
                />
                <Button onClick={handleComment}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 글쓰기 다이얼로그 */}
      <Dialog open={showCreatePost} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? "글 수정" : "새 글 작성"}</DialogTitle>
            <DialogDescription>
              {editingPost ? "게시글을 수정해주세요" : "맛집 여행기를 공유해주세요"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">제목</label>
              <Input
                placeholder="제목을 입력하세요"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">카테고리</label>
              <div className="flex flex-wrap gap-2">
                {["전체", "한식", "일식", "중식", "양식", "이탈리안", "카페"].map((cat) => (
                  <Badge
                    key={cat}
                    variant={newPostCategory === cat ? "default" : "outline"}
                    className="cursor-pointer px-4 py-2"
                    onClick={() => setNewPostCategory(cat)}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">내용</label>
              <Textarea
                placeholder="내용을 입력하세요"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={5}
              />
            </div>
            
            {!editingPost && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  방문한 맛집 선택 ({selectedRestaurants.length}개 선택됨)
                </label>
                {favorites.length === 0 ? (
                  <p className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">
                    즐겨찾기에 맛집을 추가해주세요
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto border rounded-lg p-2">
                    {favorites.map((restaurant) => (
                      <div
                        key={restaurant.id}
                        onClick={() => toggleRestaurantSelection(restaurant)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedRestaurants.find(r => r.id === restaurant.id)
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <p className="text-sm font-medium line-clamp-1">{restaurant.name}</p>
                        <p className="text-xs text-gray-500">{restaurant.category}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={handleCloseDialog}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                onClick={handleCreatePost}
                disabled={!newPostTitle.trim() || !newPostContent.trim() || (!editingPost && selectedRestaurants.length === 0)}
                className="flex-1"
              >
                {editingPost ? "수정 완료" : "작성 완료"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
