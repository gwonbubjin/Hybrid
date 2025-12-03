import { MapPin, Star, Clock, Phone, Navigation, X, Send, Trash2, Edit2 } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Restaurant } from "./RestaurantCard";
import { getReviews, createReview, deleteReview, getCurrentUser, Review } from "../utils/storage";

interface RestaurantDetailProps {
  restaurant: Restaurant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RestaurantDetail({ restaurant, open, onOpenChange }: RestaurantDetailProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (restaurant && open) {
      loadReviews();
    }
  }, [restaurant, open]);

  const loadReviews = () => {
    if (restaurant) {
      const restaurantReviews = getReviews(restaurant.id);
      setReviews(restaurantReviews);
    }
  };

  const handleGetDirections = () => {
    if (!restaurant) return;
    window.open(
      `https://map.kakao.com/link/to/${restaurant.name},${restaurant.lat},${restaurant.lng}`,
      '_blank'
    );
  };

  const handleSubmitReview = () => {
    if (restaurant && newReview.trim()) {
      createReview(restaurant.id, newRating, newReview);
      setNewReview("");
      setNewRating(5);
      setShowReviewForm(false);
      loadReviews();
    }
  };

  const handleDeleteReview = (reviewId: string) => {
    if (confirm("리뷰를 삭제하시겠습니까?")) {
      deleteReview(reviewId);
      loadReviews();
    }
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
    if (days < 30) return `${days}일 전`;
    return new Date(timestamp).toLocaleDateString();
  };

  if (!restaurant) {
    return null;
  }

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : restaurant.rating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 hover:bg-white transition-colors shadow-lg"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="relative h-64 overflow-hidden bg-gray-100">
          <img 
            src={restaurant.image} 
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-6 space-y-6">
          <div>
            <DialogHeader>
              <DialogTitle className="text-2xl mb-2">{restaurant.name}</DialogTitle>
              <DialogDescription className="text-base">
                {restaurant.category}
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-3 mt-4">
              <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-lg">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-medium">{avgRating.toFixed(1)}</span>
              </div>
              <span className="text-sm text-gray-600">리뷰 {reviews.length > 0 ? reviews.length : restaurant.reviewCount}개</span>
              <span className="text-sm text-gray-400">•</span>
              <span className="text-sm text-gray-600">{restaurant.priceRange}</span>
              <span className="text-sm text-gray-400">•</span>
              <span className={`text-sm ${restaurant.openNow ? 'text-green-600' : 'text-gray-500'}`}>
                {restaurant.openNow ? "영업중" : "영업종료"}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0 text-gray-700" />
              <div className="flex-1">
                <p className="text-gray-900 mb-1">{restaurant.address}</p>
                <p className="text-sm text-gray-600">현재 위치에서 {restaurant.distance.toFixed(1)}km</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <Phone className="w-5 h-5 flex-shrink-0 text-gray-700" />
              <a href={`tel:${restaurant.phone}`} className="text-gray-900 hover:text-primary transition-colors">
                {restaurant.phone}
              </a>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <Clock className="w-5 h-5 flex-shrink-0 text-gray-700" />
              <span className="text-gray-900">
                {restaurant.openNow ? "오전 10:00 - 오후 10:00" : "영업종료"}
              </span>
            </div>
          </div>

          <Button 
            onClick={handleGetDirections}
            className="w-full h-14 rounded-xl text-base"
          >
            <Navigation className="w-5 h-5 mr-2" />
            길찾기
          </Button>

          <div className="pt-6 border-t">
            <h4 className="mb-4 text-lg">소개</h4>
            <p className="text-gray-700 leading-relaxed">
              {restaurant.category} 전문 레스토랑입니다. 신선한 재료와 정성스러운 요리로 
              고객님께 최상의 맛을 선사합니다.
            </p>
          </div>

          <div className="pt-6 border-t">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg">리뷰 ({reviews.length})</h4>
              <Button
                size="sm"
                onClick={() => setShowReviewForm(!showReviewForm)}
                variant={showReviewForm ? "outline" : "default"}
              >
                {showReviewForm ? "취소" : "리뷰 작성"}
              </Button>
            </div>

            {showReviewForm && (
              <div className="mb-4 p-4 bg-amber-50 rounded-xl space-y-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">평점</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setNewRating(rating)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            rating <= newRating
                              ? "fill-primary text-primary"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">내용</label>
                  <Textarea
                    placeholder="리뷰를 작성해주세요..."
                    value={newReview}
                    onChange={(e) => setNewReview(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button
                  onClick={handleSubmitReview}
                  disabled={!newReview.trim()}
                  className="w-full"
                >
                  <Send className="w-4 h-4 mr-2" />
                  리뷰 등록
                </Button>
              </div>
            )}

            {reviews.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-2">아직 리뷰가 없습니다</p>
                <p className="text-sm">첫 번째 리뷰를 작성해보세요!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-lg">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span className="text-sm font-medium">{review.rating.toFixed(1)}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-900 font-medium">{review.userName}</span>
                          <span className="text-xs text-gray-500 ml-2">{formatTimestamp(review.timestamp)}</span>
                        </div>
                      </div>
                      {review.userId === currentUser.id && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteReview(review.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-gray-700 leading-relaxed">{review.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
