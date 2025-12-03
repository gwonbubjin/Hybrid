import { useState, useEffect } from "react";
import { Home, Search, User, TrendingUp, Menu, X } from "lucide-react";
import { Restaurant } from "./components/RestaurantCard";
import { RouteOptimizer } from "./components/RouteOptimizer";
import { HomePage } from "./pages/HomePage";
import { SearchPage } from "./pages/SearchPage";
import { MyPage } from "./pages/MyPage";
import { CommunityPage } from "./pages/CommunityPage";
import { InsightsPage } from "./pages/InsightsPage";
import { Button } from "./components/ui/button";
import { addActivityLog } from "./utils/storage";


type Page = "home" | "search" | "mypage" | "community" | "insights";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [favorites, setFavorites] = useState<Restaurant[]>([]);
  const [isRouteOpen, setIsRouteOpen] = useState(false);
  const [routePoints, setRoutePoints] = useState<Restaurant[]>([]);
  const [walkingDistance, setWalkingDistance] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
  // Cordova가 준비될 때까지 대기
  document.addEventListener('deviceready', () => {
    getUserLocation();
  }, false);
}, []);

const getUserLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLoc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(userLoc);
        console.log('위치 가져오기 성공:', userLoc);
      },
      (error) => {
        console.error('위치 가져오기 실패:', error);
        // 기본 위치 사용 (서울)
        setUserLocation({ lat: 37.5665, lng: 126.9780 });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }
};

  // 로컬 스토리지에서 데이터 불러오기
  useEffect(() => {
    const savedFavorites = localStorage.getItem("favorites");
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }

    const savedWalkingDistance = localStorage.getItem("walkingDistance");
    if (savedWalkingDistance) {
      setWalkingDistance(parseFloat(savedWalkingDistance));
    }
  }, []);

  // 즐겨찾기 저장
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  // 보행거리 저장
  useEffect(() => {
    localStorage.setItem("walkingDistance", walkingDistance.toString());
  }, [walkingDistance]);

  // 사용자 위치 가져오기
  useEffect(() => {
    const defaultLocation = { lat: 37.5665, lng: 126.9780 }; // 서울시청
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationLoading(false);
        },
        (error) => {
          console.log("기본 위치를 사용합니다.");
          setUserLocation(defaultLocation);
          setLocationLoading(false);
        }
      );
    } else {
      setUserLocation(defaultLocation);
      setLocationLoading(false);
    }
  }, []);

  const toggleFavorite = (restaurant: Restaurant) => {
    const isFavorite = favorites.some((fav) => fav.id === restaurant.id);
    if (isFavorite) {
      setFavorites(favorites.filter((fav) => fav.id !== restaurant.id));
    } else {
      setFavorites([...favorites, restaurant]);
    }
  };

  const removeFavorite = (id: string) => {
    setFavorites(favorites.filter((fav) => fav.id !== id));
  };

  const handleCreateRoute = () => {
    setIsRouteOpen(true);
  };

  const handleStartNavigation = (route: Restaurant[]) => {
    setRoutePoints(route);
    setIsRouteOpen(false);
    setCurrentPage("home");
    setMobileMenuOpen(false);
  };

  const resetWalkingDistance = () => {
    setWalkingDistance(0);
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
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
  };

  useEffect(() => {
    if (routePoints.length > 0 && userLocation) {
      let totalDistance = 0;
      let prev = userLocation;
      
      for (const point of routePoints) {
        const distance = calculateDistance(prev.lat, prev.lng, point.lat, point.lng);
        totalDistance += distance;
        prev = { lat: point.lat, lng: point.lng };
      }
      
      setWalkingDistance((prevDistance) => prevDistance + totalDistance);
      
      // 활동 로그 저장
      addActivityLog(totalDistance, routePoints.map(p => p.id));
    }
  }, [routePoints]);

  if (locationLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">현재 위치를 가져오는 중...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: "home" as Page, label: "홈", icon: Home },
    { id: "search" as Page, label: "검색", icon: Search },
    { id: "community" as Page, label: "커뮤니티", icon: TrendingUp },
    { id: "insights" as Page, label: "인사이트", icon: TrendingUp },
    { id: "mypage" as Page, label: "마이", icon: User },
  ];

  return (
    <div className="h-screen flex flex-col">
      {/* 모바일 상단 네비게이션 (햄버거 메뉴) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b z-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">🍂</span>
          </div>
          <span className="font-medium text-gray-900">Food Map</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* 모바일 메뉴 */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-white z-40 pt-16">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    currentPage === item.id
                      ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md"
                      : "hover:bg-amber-50 text-gray-700"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* 데스크톱 레이아웃 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 사이드바 (데스크톱만) */}
        <aside className="hidden lg:flex w-64 bg-white border-r flex-col">
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">🍂</span>
              </div>
              <div>
                <h1 className="text-lg text-gray-900">Food Map</h1>
                <p className="text-xs text-gray-500">가을 맛집 여행</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    currentPage === item.id
                      ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md"
                      : "hover:bg-amber-50 text-gray-700"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* 메인 컨텐츠 */}
        <main className="flex-1 overflow-hidden pt-14 lg:pt-0">
          {currentPage === "home" && (
            <HomePage
              userLocation={userLocation}
              favorites={favorites}
              routePoints={routePoints}
              onToggleFavorite={toggleFavorite}
              onNavigateToSearch={() => setCurrentPage("search")}
              onNavigateToMyPage={() => setCurrentPage("mypage")}
              onShowRouteOptimizer={() => setIsRouteOpen(true)}
            />
          )}

          {currentPage === "search" && (
            <SearchPage
              userLocation={userLocation}
              onBack={() => setCurrentPage("home")}
            />
          )}

          {currentPage === "mypage" && (
            <MyPage
              favorites={favorites}
              walkingDistance={walkingDistance}
              onBack={() => setCurrentPage("home")}
              onRemoveFavorite={removeFavorite}
              onCreateRoute={handleCreateRoute}
              onResetWalkingDistance={resetWalkingDistance}
            />
          )}

          {currentPage === "community" && (
            <CommunityPage 
              favorites={favorites}
              onBack={() => setCurrentPage("home")} 
            />
          )}

          {currentPage === "insights" && (
            <InsightsPage
              favorites={favorites}
              walkingDistance={walkingDistance}
              onBack={() => setCurrentPage("home")}
            />
          )}
        </main>
      </div>

      {/* 경로 최적화 다이얼로그 */}
      <RouteOptimizer
        restaurants={favorites}
        userLocation={userLocation}
        open={isRouteOpen}
        onOpenChange={setIsRouteOpen}
        onStartNavigation={handleStartNavigation}
      />
    </div>
  );
}

export default App;
