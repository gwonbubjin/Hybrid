import { useState, useEffect } from "react";
import { Route, Clock, Navigation, X, MapPin, ArrowRight } from "lucide-react";
import { Restaurant } from "./RestaurantCard";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Progress } from "./ui/progress";

interface RouteOptimizerProps {
  restaurants: Restaurant[];
  userLocation: { lat: number; lng: number } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartNavigation: (route: Restaurant[]) => void;
}

// 두 지점 간 거리 계산
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 최근접 이웃 알고리즘으로 경로 최적화
function optimizeRoute(
  start: { lat: number; lng: number },
  restaurants: Restaurant[]
): Restaurant[] {
  if (restaurants.length === 0) return [];
  if (restaurants.length === 1) return restaurants;

  const visited = new Set<string>();
  const route: Restaurant[] = [];
  let current = start;

  while (route.length < restaurants.length) {
    let nearest: Restaurant | null = null;
    let minDistance = Infinity;

    for (const restaurant of restaurants) {
      if (!visited.has(restaurant.id)) {
        const distance = calculateDistance(
          current.lat,
          current.lng,
          restaurant.lat,
          restaurant.lng
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearest = restaurant;
        }
      }
    }

    if (nearest) {
      route.push(nearest);
      visited.add(nearest.id);
      current = { lat: nearest.lat, lng: nearest.lng };
    }
  }

  return route;
}

export function RouteOptimizer({
  restaurants,
  userLocation,
  open,
  onOpenChange,
  onStartNavigation,
}: RouteOptimizerProps) {
  const [optimizedRoute, setOptimizedRoute] = useState<Restaurant[]>([]);
  const [totalDistance, setTotalDistance] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (open && userLocation && restaurants.length > 0) {
      const route = optimizeRoute(userLocation, restaurants);
      setOptimizedRoute(route);

      // 총 거리 계산
      let distance = 0;
      let prev = userLocation;
      for (const restaurant of route) {
        distance += calculateDistance(prev.lat, prev.lng, restaurant.lat, restaurant.lng);
        prev = { lat: restaurant.lat, lng: restaurant.lng };
      }
      setTotalDistance(distance);

      // 예상 시간 계산 (평균 도보 속도 4km/h, 각 맛집에서 30분 소요)
      const walkingTimeMinutes = (distance / 4) * 60;
      const visitTimeMinutes = route.length * 30;
      setEstimatedTime(Math.round(walkingTimeMinutes + visitTimeMinutes));
    }
  }, [open, userLocation, restaurants]);

  const handleStartNavigation = () => {
    setIsNavigating(true);
    setCurrentStep(0);
    onStartNavigation(optimizedRoute);
  };

  const handleNextStop = () => {
    if (currentStep < optimizedRoute.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsNavigating(false);
      setCurrentStep(0);
    }
  };

  const remainingDistance = optimizedRoute
    .slice(currentStep)
    .reduce((sum, restaurant, index, arr) => {
      if (index === 0) {
        const prev = currentStep === 0 && userLocation 
          ? userLocation 
          : optimizedRoute[currentStep - 1];
        return sum + calculateDistance(prev.lat, prev.lng, restaurant.lat, restaurant.lng);
      }
      const prev = arr[index - 1];
      return sum + calculateDistance(prev.lat, prev.lng, restaurant.lat, restaurant.lng);
    }, 0);

  const progress = optimizedRoute.length > 0 
    ? (currentStep / optimizedRoute.length) * 100 
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Route className="w-6 h-6 text-primary" />
            {isNavigating ? "경로 안내 중" : "최적 경로"}
          </DialogTitle>
          <DialogDescription>
            {isNavigating
              ? `${currentStep + 1}/${optimizedRoute.length}번째 목적지`
              : `총 ${optimizedRoute.length}곳의 맛집을 방문합니다`}
          </DialogDescription>
        </DialogHeader>

        {isNavigating && (
          <div className="space-y-4">
            <div className="bg-primary/10 rounded-xl p-4">
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">남은 거리</p>
                  <p className="text-lg text-gray-900">
                    {remainingDistance.toFixed(1)}km
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">남은 시간</p>
                  <p className="text-lg text-gray-900">
                    {Math.round((remainingDistance / 4) * 60 + (optimizedRoute.length - currentStep) * 30)}분
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">진행률</p>
                  <p className="text-lg text-primary">{progress.toFixed(0)}%</p>
                </div>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {optimizedRoute[currentStep] && (
              <div className="bg-white border-2 border-primary rounded-xl p-6">
                <div className="flex items-center gap-2 mb-3 text-primary">
                  <Navigation className="w-5 h-5" />
                  <span className="text-sm">현재 목적지</span>
                </div>
                <h3 className="text-xl mb-2">{optimizedRoute[currentStep].name}</h3>
                <p className="text-gray-600 mb-4">
                  {optimizedRoute[currentStep].category} • {optimizedRoute[currentStep].address}
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      window.open(
                        `https://map.kakao.com/link/to/${optimizedRoute[currentStep].name},${optimizedRoute[currentStep].lat},${optimizedRoute[currentStep].lng}`,
                        '_blank'
                      );
                    }}
                    className="flex-1 h-12 rounded-xl"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    길찾기
                  </Button>
                  <Button
                    onClick={handleNextStop}
                    variant="outline"
                    className="flex-1 h-12 rounded-xl"
                  >
                    {currentStep < optimizedRoute.length - 1 ? "다음 장소" : "종료"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {!isNavigating && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-accent/50 rounded-xl p-4 text-center">
                <MapPin className="w-5 h-5 mx-auto mb-2 text-primary" />
                <p className="text-sm text-gray-600 mb-1">방문 장소</p>
                <p className="text-lg text-gray-900">{optimizedRoute.length}곳</p>
              </div>
              <div className="bg-accent/50 rounded-xl p-4 text-center">
                <Route className="w-5 h-5 mx-auto mb-2 text-primary" />
                <p className="text-sm text-gray-600 mb-1">총 거리</p>
                <p className="text-lg text-gray-900">{totalDistance.toFixed(1)}km</p>
              </div>
              <div className="bg-accent/50 rounded-xl p-4 text-center">
                <Clock className="w-5 h-5 mx-auto mb-2 text-primary" />
                <p className="text-sm text-gray-600 mb-1">예상 시간</p>
                <p className="text-lg text-gray-900">{estimatedTime}분</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm text-gray-600 mb-3">방문 순서</h4>
              {optimizedRoute.map((restaurant, index) => (
                <div
                  key={restaurant.id}
                  className="flex items-center gap-3 bg-accent/30 rounded-xl p-3"
                >
                  <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </div>
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-gray-900 line-clamp-1">
                      {restaurant.name}
                    </h5>
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {restaurant.category} • {restaurant.distance.toFixed(1)}km
                    </p>
                  </div>
                  {index < optimizedRoute.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              ))}
            </div>

            <Button
              onClick={handleStartNavigation}
              className="w-full h-14 rounded-xl text-base"
              size="lg"
            >
              <Navigation className="w-5 h-5 mr-2" />
              경로 안내 시작
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
