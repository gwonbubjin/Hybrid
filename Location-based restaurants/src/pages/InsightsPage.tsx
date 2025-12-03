import { useState, useEffect } from "react";
import { ArrowLeft, TrendingUp, MapPin, Star, Clock, Calendar, Award, BarChart3 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Restaurant } from "../components/RestaurantCard";
import { getWeeklyActivityLogs, getActivityLogs } from "../utils/storage";

interface InsightsPageProps {
  favorites: Restaurant[];
  walkingDistance: number;
  onBack: () => void;
}

export function InsightsPage({ favorites, walkingDistance, onBack }: InsightsPageProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [weeklyLogs, setWeeklyLogs] = useState(getWeeklyActivityLogs());
  const [allLogs, setAllLogs] = useState(getActivityLogs());

  useEffect(() => {
    setWeeklyLogs(getWeeklyActivityLogs());
    setAllLogs(getActivityLogs());
  }, [walkingDistance, favorites]);

  // 통계 계산
  const totalVisits = allLogs.reduce((sum, log) => sum + log.visits, 0);
  const avgRating = favorites.length > 0
    ? favorites.reduce((sum, r) => sum + r.rating, 0) / favorites.length
    : 0;
  const steps = Math.round(walkingDistance * 1250);

  // 카테고리별 통계
  const categoryStats = favorites.reduce((acc, restaurant) => {
    acc[restaurant.category] = (acc[restaurant.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(categoryStats).sort((a, b) => b[1] - a[1])[0];

  // 주간 활동 데이터
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  const weeklyData = weeklyLogs.map(log => {
    const date = new Date(log.date);
    return {
      day: weekDays[date.getDay()],
      distance: log.distance,
      visits: log.visits,
    };
  });

  const maxDistance = Math.max(...weeklyData.map(d => d.distance), 1);

  // 이달의 통계
  const monthlyDistance = allLogs
    .filter(log => {
      const logDate = new Date(log.date);
      const now = new Date();
      return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, log) => sum + log.distance, 0);

  const monthlyVisits = allLogs
    .filter(log => {
      const logDate = new Date(log.date);
      const now = new Date();
      return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, log) => sum + log.visits, 0);

  const monthlySteps = Math.round(monthlyDistance * 1250);

  // 가장 활동적인 날
  const mostActiveDay = weeklyData.reduce((max, day) => 
    day.distance > max.distance ? day : max
  , weeklyData[0]);

  // 최다 방문일
  const mostVisitedDay = weeklyData.reduce((max, day) => 
    day.visits > max.visits ? day : max
  , weeklyData[0]);

  // 평점 분포
  const getRatingDistribution = () => {
    const distribution = [
      { range: "5.0", min: 4.5, count: 0 },
      { range: "4.0-4.4", min: 4.0, count: 0 },
      { range: "3.0-3.9", min: 3.0, count: 0 },
    ];

    favorites.forEach(f => {
      if (f.rating >= 4.5) distribution[0].count++;
      else if (f.rating >= 4.0) distribution[1].count++;
      else if (f.rating >= 3.0) distribution[2].count++;
    });

    return distribution;
  };

  const ratingDistribution = getRatingDistribution();

  // 최근 30일 추세
  const last30DaysLogs = allLogs.slice(-30);
  const totalLast30Days = last30DaysLogs.reduce((sum, log) => sum + log.distance, 0);
  const avgDailyDistance = last30DaysLogs.length > 0 ? totalLast30Days / last30DaysLogs.length : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="bg-gradient-to-br from-amber-500 to-orange-600 text-white px-4 py-6">
        <div className="max-w-6xl mx-auto">
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
              <BarChart3 className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-2xl mb-1">인사이트</h1>
              <p className="text-white/90 text-sm">나의 맛집 탐험 통계</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full max-w-md mx-auto grid grid-cols-3 bg-white rounded-xl mb-6">
            <TabsTrigger value="overview" className="rounded-lg">개요</TabsTrigger>
            <TabsTrigger value="weekly" className="rounded-lg">주간</TabsTrigger>
            <TabsTrigger value="categories" className="rounded-lg">카테고리</TabsTrigger>
          </TabsList>

          {/* 개요 탭 */}
          <TabsContent value="overview" className="space-y-6">
            {/* 핵심 지표 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-5 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-2xl text-gray-900 mb-1">{totalVisits}</p>
                <p className="text-sm text-gray-600">총 방문</p>
              </Card>

              <Card className="p-5 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-2xl text-gray-900 mb-1">{walkingDistance.toFixed(1)}km</p>
                <p className="text-sm text-gray-600">총 거리</p>
              </Card>

              <Card className="p-5 text-center">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 text-amber-600" />
                </div>
                <p className="text-2xl text-gray-900 mb-1">{avgRating.toFixed(1)}</p>
                <p className="text-sm text-gray-600">평균 평점</p>
              </Card>

              <Card className="p-5 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-2xl text-gray-900 mb-1">{favorites.length}</p>
                <p className="text-sm text-gray-600">즐겨찾기</p>
              </Card>
            </div>

            {/* 이달의 목표 */}
            <Card className="p-6">
              <h3 className="text-lg mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                이달의 목표
              </h3>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm text-gray-600">월간 걸음 수</p>
                      <p className="text-2xl text-gray-900 mt-1">
                        {monthlySteps.toLocaleString()} 걸음
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">목표</p>
                      <p className="text-lg text-primary mt-1">300,000 걸음</p>
                    </div>
                  </div>
                  <Progress value={Math.min((monthlySteps / 300000) * 100, 100)} className="h-3" />
                  <p className="text-xs text-gray-500 mt-2">
                    {Math.min((monthlySteps / 300000) * 100, 100).toFixed(1)}% 달성
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm text-gray-600">월간 탐험 거리</p>
                      <p className="text-2xl text-gray-900 mt-1">
                        {monthlyDistance.toFixed(1)} km
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">목표</p>
                      <p className="text-lg text-primary mt-1">100 km</p>
                    </div>
                  </div>
                  <Progress value={Math.min((monthlyDistance / 100) * 100, 100)} className="h-3" />
                  <p className="text-xs text-gray-500 mt-2">
                    {Math.min((monthlyDistance / 100) * 100, 100).toFixed(1)}% 달성
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm text-gray-600">월간 방문 횟수</p>
                      <p className="text-2xl text-gray-900 mt-1">
                        {monthlyVisits} 곳
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">목표</p>
                      <p className="text-lg text-primary mt-1">50 곳</p>
                    </div>
                  </div>
                  <Progress value={Math.min((monthlyVisits / 50) * 100, 100)} className="h-3" />
                  <p className="text-xs text-gray-500 mt-2">
                    {Math.min((monthlyVisits / 50) * 100, 100).toFixed(1)}% 달성
                  </p>
                </div>
              </div>
            </Card>

            {/* 최근 활동 */}
            <Card className="p-6">
              <h3 className="text-lg mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                최근 즐겨찾기
              </h3>
              {favorites.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  아직 즐겨찾기한 맛집이 없습니다
                </p>
              ) : (
                <div className="space-y-3">
                  {favorites.slice(0, 5).map((restaurant, index) => (
                    <div key={restaurant.id} className="flex items-center gap-3 p-3 bg-amber-50/50 rounded-lg">
                      <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center text-sm">
                        {index + 1}
                      </div>
                      <img
                        src={restaurant.image}
                        alt={restaurant.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 line-clamp-1">
                          {restaurant.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {restaurant.category} • {restaurant.distance.toFixed(1)}km
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-primary text-primary" />
                          <span className="text-sm text-gray-900">{restaurant.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* 30일 추세 */}
            <Card className="p-6">
              <h3 className="text-lg mb-4">최근 30일 추세</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-2">평균 일일 거리</p>
                  <p className="text-2xl text-blue-600">{avgDailyDistance.toFixed(2)}km</p>
                </div>
                <div className="p-4 bg-green-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-2">총 활동 일수</p>
                  <p className="text-2xl text-green-600">{last30DaysLogs.length}일</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-2">총 누적 거리</p>
                  <p className="text-2xl text-amber-600">{totalLast30Days.toFixed(1)}km</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* 주간 탭 */}
          <TabsContent value="weekly" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg mb-6">주간 활동 그래프</h3>
              <div className="space-y-4">
                {weeklyData.map((data) => (
                  <div key={data.day}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 w-8">{data.day}</span>
                      <div className="flex-1 mx-4">
                        <div className="bg-gray-100 rounded-full h-8 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-amber-500 to-orange-600 h-full rounded-full flex items-center px-3 text-white text-sm"
                            style={{ width: `${Math.max((data.distance / maxDistance) * 100, 3)}%` }}
                          >
                            {data.distance > 0 && `${data.distance.toFixed(1)}km`}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-600 w-20 text-right">
                        {data.visits}곳 방문
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg mb-4">주간 총계</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                    <span className="text-gray-700">총 거리</span>
                    <span className="text-xl text-blue-600">
                      {weeklyData.reduce((sum, d) => sum + d.distance, 0).toFixed(1)}km
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                    <span className="text-gray-700">총 방문</span>
                    <span className="text-xl text-green-600">
                      {weeklyData.reduce((sum, d) => sum + d.visits, 0)}곳
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl">
                    <span className="text-gray-700">일평균 거리</span>
                    <span className="text-xl text-amber-600">
                      {(weeklyData.reduce((sum, d) => sum + d.distance, 0) / 7).toFixed(1)}km
                    </span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg mb-4">주간 기록</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">가장 활동적인 날</p>
                    <p className="text-xl text-gray-900">
                      {mostActiveDay.day}요일 • {mostActiveDay.distance.toFixed(1)}km
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">최다 방문일</p>
                    <p className="text-xl text-gray-900">
                      {mostVisitedDay.day}요일 • {mostVisitedDay.visits}곳
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* 카테고리 탭 */}
          <TabsContent value="categories" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg mb-6">카테고리별 선호도</h3>
              {Object.keys(categoryStats).length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  아직 즐겨찾기한 맛집이 없습니다
                </p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(categoryStats)
                    .sort((a, b) => b[1] - a[1])
                    .map(([category, count]) => {
                      const percentage = (count / favorites.length) * 100;
                      return (
                        <div key={category}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">{category}</span>
                            <span className="text-sm text-gray-600">{count}곳 ({percentage.toFixed(0)}%)</span>
                          </div>
                          <Progress value={percentage} className="h-3" />
                        </div>
                      );
                    })}
                </div>
              )}
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg mb-4">최애 카테고리</h3>
                {topCategory ? (
                  <div className="text-center py-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-4xl">
                      {topCategory[0] === "한식" && "🍚"}
                      {topCategory[0] === "일식" && "🍱"}
                      {topCategory[0] === "중식" && "🥟"}
                      {topCategory[0] === "양식" && "🍔"}
                      {topCategory[0] === "이탈리안" && "🍝"}
                      {topCategory[0] === "카페" && "☕"}
                      {!["한식", "일식", "중식", "양식", "이탈리안", "카페"].includes(topCategory[0]) && "🍽️"}
                    </div>
                    <p className="text-2xl text-gray-900 mb-2">{topCategory[0]}</p>
                    <p className="text-gray-600">{topCategory[1]}곳 방문</p>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-6">데이터가 충분하지 않습니다</p>
                )}
              </Card>

              <Card className="p-6">
                <h3 className="text-lg mb-4">평점 분포</h3>
                {favorites.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    아직 데이터가 없습니다
                  </p>
                ) : (
                  <div className="space-y-3">
                    {ratingDistribution.map((item) => {
                      const percentage = favorites.length > 0 ? (item.count / favorites.length) * 100 : 0;
                      return (
                        <div key={item.range} className="flex items-center gap-3">
                          <div className="flex items-center gap-1 w-20">
                            <Star className="w-4 h-4 fill-primary text-primary" />
                            <span className="text-sm text-gray-700">{item.range}</span>
                          </div>
                          <div className="flex-1">
                            <div className="bg-gray-100 rounded-full h-6 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full"
                                style={{ width: `${Math.max(percentage, 0)}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-sm text-gray-600 w-12 text-right">{item.count}곳</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
