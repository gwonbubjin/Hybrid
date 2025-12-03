import { useState, useEffect } from "react";
import { Search, ArrowLeft, Filter, MapPin, Star, X } from "lucide-react";
import { Restaurant } from "../components/RestaurantCard";
import { RestaurantDetail } from "../components/RestaurantDetail";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Slider } from "../components/ui/slider";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { searchRestaurantsByKeyword } from "../utils/kakaoApi";

interface SearchPageProps {
  userLocation: { lat: number; lng: number } | null;
  onBack: () => void;
}

export function SearchPage({ userLocation, onBack }: SearchPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // 필터 상태
  const [maxDistance, setMaxDistance] = useState([5]);
  const [minRating, setMinRating] = useState([0]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [openNowOnly, setOpenNowOnly] = useState(false);

  const categories = ["한식", "일식", "중식", "양식", "이탈리안", "카페"];

  const handleSearch = async () => {
    if (!userLocation || !searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const data = await searchRestaurantsByKeyword(
        searchQuery,
        userLocation.lat,
        userLocation.lng
      );
      setSearchResults(data);
    } catch (error) {
      console.error("검색 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const clearFilters = () => {
    setMaxDistance([5]);
    setMinRating([0]);
    setSelectedCategories([]);
    setOpenNowOnly(false);
  };

  const applyFilters = () => {
    let filtered = [...searchResults];

    if (selectedCategories.length > 0) {
      filtered = filtered.filter(r => selectedCategories.includes(r.category));
    }

    if (openNowOnly) {
      filtered = filtered.filter(r => r.openNow);
    }

    filtered = filtered.filter(r => 
      r.distance <= maxDistance[0] && r.rating >= minRating[0]
    );

    return filtered;
  };

  const filteredResults = applyFilters();

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* 헤더 */}
      <header className="bg-white border-b shadow-sm px-4 py-4 flex-shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="rounded-lg -ml-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl">상세 검색</h1>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="맛집 이름, 메뉴, 주소 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-11 h-12 rounded-xl border-gray-200 bg-amber-50/30"
            />
          </div>
          <Button
            onClick={handleSearch}
            className="h-12 px-6 rounded-xl"
          >
            검색
          </Button>
        </div>

        <div className="flex items-center justify-between mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="rounded-lg"
          >
            <Filter className="w-4 h-4 mr-2" />
            필터
            {(selectedCategories.length > 0 || openNowOnly || minRating[0] > 0) && (
              <span className="ml-2 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {selectedCategories.length + (openNowOnly ? 1 : 0) + (minRating[0] > 0 ? 1 : 0)}
              </span>
            )}
          </Button>
          
          <p className="text-sm text-gray-600">
            {filteredResults.length}개의 결과
          </p>
        </div>
      </header>

      {/* 필터 패널 */}
      {showFilters && (
        <div className="bg-white border-b p-4 space-y-6 animate-in slide-in-from-top">
          <div>
            <Label className="text-sm mb-3 block">카테고리</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Badge
                  key={category}
                  variant={selectedCategories.includes(category) ? "default" : "outline"}
                  className="cursor-pointer px-4 py-2"
                  onClick={() => toggleCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm mb-3 block">
              최대 거리: {maxDistance[0]}km
            </Label>
            <Slider
              value={maxDistance}
              onValueChange={setMaxDistance}
              max={10}
              min={0.5}
              step={0.5}
              className="w-full"
            />
          </div>

          <div>
            <Label className="text-sm mb-3 block">
              최소 평점: {minRating[0].toFixed(1)}점
            </Label>
            <Slider
              value={minRating}
              onValueChange={setMinRating}
              max={5}
              min={0}
              step={0.5}
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="open-now" className="text-sm">영업중인 곳만 보기</Label>
            <Switch
              id="open-now"
              checked={openNowOnly}
              onCheckedChange={setOpenNowOnly}
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={clearFilters}
              className="flex-1 rounded-lg"
            >
              초기화
            </Button>
            <Button
              onClick={() => setShowFilters(false)}
              className="flex-1 rounded-lg"
            >
              적용
            </Button>
          </div>
        </div>
      )}

      {/* 검색 결과 */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-600">검색 중...</p>
            </div>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-primary" />
              </div>
              <p className="text-gray-600 mb-2">
                {searchQuery ? "검색 결과가 없습니다" : "검색어를 입력해주세요"}
              </p>
              <p className="text-gray-400 text-sm">
                {searchQuery && "다른 검색어나 필터를 시도해보세요"}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 max-w-2xl mx-auto">
            {filteredResults.map((restaurant) => (
              <div
                key={restaurant.id}
                onClick={() => {
                  setSelectedRestaurant(restaurant);
                  setIsDetailOpen(true);
                }}
                className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="flex gap-4">
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900 line-clamp-1">
                        {restaurant.name}
                      </h3>
                      <Badge variant="outline" className="ml-2 flex-shrink-0">
                        {restaurant.category}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-primary text-primary" />
                        <span className="text-sm text-gray-900">{restaurant.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm text-gray-600">리뷰 {restaurant.reviewCount}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm text-primary">{restaurant.distance.toFixed(1)}km</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="line-clamp-1">{restaurant.address}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
