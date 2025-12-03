import { useState, useEffect } from "react";
import { Search, MapPin, Loader2, List, Map, SlidersHorizontal, Heart, Route as RouteIcon } from "lucide-react";
import { RestaurantCard, Restaurant } from "../components/RestaurantCard";
import { RestaurantDetail } from "../components/RestaurantDetail";
import { MapView } from "../components/MapView";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { searchNearbyRestaurants } from "../utils/kakaoApi";

const categories = ["전체", "한식", "일식", "중식", "양식", "이탈리안", "카페"];

interface HomePageProps {
  userLocation: { lat: number; lng: number } | null;
  favorites: Restaurant[];
  routePoints: Restaurant[];
  onToggleFavorite: (restaurant: Restaurant) => void;
  onNavigateToSearch: () => void;
  onNavigateToMyPage: () => void;
  onShowRouteOptimizer: () => void;
}

export function HomePage({
  userLocation,
  favorites,
  routePoints,
  onToggleFavorite,
  onNavigateToSearch,
  onNavigateToMyPage,
  onShowRouteOptimizer,
}: HomePageProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [sortBy, setSortBy] = useState("distance");
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(false);

  useEffect(() => {
    if (userLocation) {
      loadRestaurants();
    }
  }, [userLocation, selectedCategory]);

  const loadRestaurants = async () => {
    if (!userLocation) return;
    
    setIsLoadingRestaurants(true);
    try {
      const category = selectedCategory === "전체" ? undefined : selectedCategory;
      const data = await searchNearbyRestaurants(
        userLocation.lat,
        userLocation.lng,
        3000,
        category
      );
      setRestaurants(data);
      setFilteredRestaurants(data);
    } catch (error) {
      console.error("맛집 데이터 로딩 실패:", error);
    } finally {
      setIsLoadingRestaurants(false);
    }
  };

  useEffect(() => {
    let filtered = [...restaurants];

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "distance":
          return a.distance - b.distance;
        case "rating":
          return b.rating - a.rating;
        case "reviews":
          return b.reviewCount - a.reviewCount;
        default:
          return 0;
      }
    });

    setFilteredRestaurants(filtered);
  }, [restaurants, sortBy]);

  const handleRestaurantClick = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setIsDetailOpen(true);
  };

  const handleRestaurantSelect = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  const isFavorite = (id: string) => {
    return favorites.some((fav) => fav.id === id);
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* 헤더 */}
      <header className="bg-white border-b flex-shrink-0 z-20 shadow-sm">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl text-gray-900">Food Map</h1>
                <p className="text-xs text-gray-500">가을 맛집 여행</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={onNavigateToMyPage}
                className="relative h-10 rounded-lg border-primary/20"
              >
                <Heart className={`w-4 h-4 ${favorites.length > 0 ? 'fill-primary text-primary' : ''}`} />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </Button>

              <div className="flex lg:hidden gap-1 bg-gray-100 rounded-xl p-1">
                <Button
                  size="sm"
                  variant={viewMode === "map" ? "default" : "ghost"}
                  onClick={() => setViewMode("map")}
                  className="h-9 px-4 rounded-lg"
                >
                  <Map className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === "list" ? "default" : "ghost"}
                  onClick={() => setViewMode("list")}
                  className="h-9 px-4 rounded-lg"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* 검색 바 */}
          <div 
            className="relative mb-4 cursor-pointer" 
            onClick={onNavigateToSearch}
          >
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <div className="pl-12 pr-4 h-12 rounded-xl border border-gray-200 bg-amber-50/30 flex items-center text-gray-500">
              맛집 또는 주소를 검색하세요...
            </div>
          </div>

          {/* 필터 및 정렬 */}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex gap-2 flex-wrap flex-1 items-center">
              <SlidersHorizontal className="w-4 h-4 text-gray-500 hidden sm:block" />
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    selectedCategory === category
                      ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md"
                      : "bg-amber-50 text-gray-700 hover:bg-amber-100"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[120px] h-10 rounded-lg border-gray-200 bg-amber-50/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="distance">거리순</SelectItem>
                <SelectItem value="rating">평점순</SelectItem>
                <SelectItem value="reviews">리뷰순</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col lg:flex-row">
          {/* 지도 영역 */}
          <div className={`${viewMode === "map" ? "flex" : "hidden"} lg:flex lg:flex-1 h-full`}>
            <MapView
              restaurants={filteredRestaurants}
              userLocation={userLocation}
              selectedRestaurant={selectedRestaurant}
              onRestaurantSelect={handleRestaurantSelect}
              routePoints={routePoints}
            />
          </div>

          {/* 리스트 영역 */}
          <div
            className={`${
              viewMode === "list" ? "flex" : "hidden"
            } lg:flex flex-col lg:w-[420px] xl:w-[500px] bg-background overflow-y-auto`}
          >
            <div className="px-4 sm:px-6 py-3 bg-white border-b flex-shrink-0 flex items-center justify-between">
              <p className="text-gray-600">
                총 <span className="text-primary">{filteredRestaurants.length}</span>개의 맛집
              </p>
              {routePoints.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onShowRouteOptimizer}
                  className="text-primary border-primary/20"
                >
                  <RouteIcon className="w-4 h-4 mr-1" />
                  경로 보기
                </Button>
              )}
            </div>

            {isLoadingRestaurants ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">맛집을 찾는 중...</p>
                </div>
              </div>
            ) : filteredRestaurants.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-gray-500">검색 결과가 없습니다.</p>
                  <p className="text-gray-400 text-sm mt-2">다른 카테고리를 선택해보세요</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 sm:p-6 space-y-4">
                  {filteredRestaurants.map((restaurant) => (
                    <div
                      key={restaurant.id}
                      className="relative"
                    >
                      <Button
                        size="sm"
                        variant="ghost"
                        className={`absolute top-2 right-2 z-10 rounded-full w-9 h-9 p-0 ${
                          isFavorite(restaurant.id) 
                            ? 'bg-white/90 hover:bg-white' 
                            : 'bg-white/70 hover:bg-white/90'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(restaurant);
                        }}
                      >
                        <Heart
                          className={`w-5 h-5 ${
                            isFavorite(restaurant.id)
                              ? "fill-primary text-primary"
                              : "text-gray-600"
                          }`}
                        />
                      </Button>
                      <RestaurantCard
                        restaurant={restaurant}
                        onClick={() => handleRestaurantClick(restaurant)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 상세 정보 다이얼로그 */}
      <RestaurantDetail
        restaurant={selectedRestaurant}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  );
}
