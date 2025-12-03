import { ArrowLeft, Heart, Trash2, Route, MapPin, TrendingUp, Award, Calendar } from "lucide-react";
import { Restaurant } from "../components/RestaurantCard";
import { RestaurantDetail } from "../components/RestaurantDetail";
import { WalkingTracker } from "../components/WalkingTracker";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { useState } from "react";

interface MyPageProps {
  favorites: Restaurant[];
  walkingDistance: number;
  onBack: () => void;
  onRemoveFavorite: (id: string) => void;
  onCreateRoute: () => void;
  onResetWalkingDistance: () => void;
}

export function MyPage({
  favorites,
  walkingDistance,
  onBack,
  onRemoveFavorite,
  onCreateRoute,
  onResetWalkingDistance,
}: MyPageProps) {
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const steps = Math.round(walkingDistance * 1250);
  const dailyGoal = 10000;
  const progress = Math.min((steps / dailyGoal) * 100, 100);

  // 통계 계산
  const totalVisits = Math.floor(walkingDistance / 0.5);
  const avgRating = favorites.length > 0
    ? favorites.reduce((sum, r) => sum + r.rating, 0) / favorites.length
    : 0;

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
          
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Heart className="w-10 h-10 text-white fill-current" />
            </div>
            <div>
              <h1 className="text-2xl mb-1">마이 페이지</h1>
              <p className="text-white/90 text-sm">나만의 맛집 컬렉션</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 활동 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">방문 예상</p>
                <p className="text-2xl text-gray-900">{totalVisits}회</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">평균 평점</p>
                <p className="text-2xl text-gray-900">{avgRating.toFixed(1)}점</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white fill-current" />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">즐겨찾기</p>
                <p className="text-2xl text-gray-900">{favorites.length}곳</p>
              </div>
            </div>
          </Card>
        </div>

        {/* 보행거리 트래커 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg">오늘의 활동</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetWalkingDistance}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              초기화
            </Button>
          </div>
          <WalkingTracker currentDistance={walkingDistance} dailyGoal={dailyGoal} />
        </div>

        {/* 즐겨찾기 목록 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary fill-current" />
              즐겨찾기 맛집
            </h2>
            {favorites.length >= 2 && (
              <Button
                size="sm"
                onClick={onCreateRoute}
                className="rounded-lg"
              >
                <Route className="w-4 h-4 mr-2" />
                코스 만들기
              </Button>
            )}
          </div>

          {favorites.length === 0 ? (
            <Card className="p-12 text-center">
              <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 mb-2">아직 저장한 맛집이 없습니다</p>
              <p className="text-gray-400 text-sm">
                마음에 드는 맛집을 즐겨찾기에 추가해보세요
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favorites.map((restaurant) => (
                <Card
                  key={restaurant.id}
                  className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => {
                    setSelectedRestaurant(restaurant);
                    setIsDetailOpen(true);
                  }}
                >
                  <div className="relative h-40 overflow-hidden bg-gray-100">
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full w-9 h-9 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFavorite(restaurant.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-1">
                      {restaurant.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <span>{restaurant.category}</span>
                      <span className="text-gray-300">•</span>
                      <span>{restaurant.distance.toFixed(1)}km</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <span className="text-primary">⭐</span>
                      <span className="text-gray-900">{restaurant.rating.toFixed(1)}</span>
                      <span className="text-gray-500">({restaurant.reviewCount})</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* 월간 통계 */}
        <Card className="p-6">
          <h2 className="text-lg mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            이달의 활동
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">이달의 걸음 목표</span>
                <span className="text-sm text-gray-900">
                  {Math.min(steps, 300000).toLocaleString()} / 300,000 걸음
                </span>
              </div>
              <Progress value={Math.min((steps / 300000) * 100, 100)} className="h-2" />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">이달의 거리 목표</span>
                <span className="text-sm text-gray-900">
                  {Math.min(walkingDistance, 240).toFixed(1)} / 240 km
                </span>
              </div>
              <Progress value={Math.min((walkingDistance / 240) * 100, 100)} className="h-2" />
            </div>
          </div>
        </Card>

        {/* 달성 배지 */}
        <Card className="p-6">
          <h2 className="text-lg mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            달성 배지
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {[
              { name: "첫 즐겨찾기", icon: "🎯", unlocked: favorites.length >= 1 },
              { name: "맛집 탐험가", icon: "🗺️", unlocked: favorites.length >= 5 },
              { name: "걷기 달인", icon: "🚶", unlocked: steps >= 10000 },
              { name: "거리 정복자", icon: "🏃", unlocked: walkingDistance >= 10 },
              { name: "코스 제작자", icon: "🛣️", unlocked: favorites.length >= 3 },
              { name: "미식가", icon: "🍽️", unlocked: avgRating >= 4.5 },
            ].map((badge) => (
              <div
                key={badge.name}
                className={`text-center p-3 rounded-xl transition-all ${
                  badge.unlocked
                    ? "bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-primary"
                    : "bg-gray-50 border-2 border-gray-200 opacity-50"
                }`}
              >
                <div className="text-3xl mb-2">{badge.icon}</div>
                <p className="text-xs text-gray-700">{badge.name}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 상세 정보 다이얼로그 */}
      <RestaurantDetail
        restaurant={selectedRestaurant}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  );
}
