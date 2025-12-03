import { KAKAO_CONFIG } from "../config";
import { Restaurant } from "../components/RestaurantCard";

// 카카오 로컬 API를 사용하여 주변 맛집 검색
export async function searchNearbyRestaurants(
  lat: number,
  lng: number,
  radius: number = 2000,
  category?: string
): Promise<Restaurant[]> {
  try {
    // 카테고리별 검색 키워드 매핑
    const categoryKeywords: { [key: string]: string } = {
      "한식": "한식",
      "일식": "일식",
      "중식": "중식",
      "양식": "양식",
      "이탈리안": "이탈리안",
      "카페": "카페",
    };

    const keyword = category && category !== "전체" 
      ? categoryKeywords[category] || "맛집"
      : "맛집";

    const response = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(
        keyword
      )}&x=${lng}&y=${lat}&radius=${radius}&sort=distance&size=15`,
      {
        headers: {
          Authorization: `KakaoAK ${KAKAO_CONFIG.REST_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch restaurants");
    }

    const data = await response.json();

    // 카카오 API 응답을 Restaurant 형식으로 변환
    const restaurants: Restaurant[] = data.documents.map((place: any, index: number) => {
      // 거리 계산 (미터를 킬로미터로 변환)
      const distance = place.distance ? parseFloat(place.distance) / 1000 : 0;
      
      // 카테고리 추출 (카카오 API의 카테고리는 "음식점 > 한식 > ..." 형식)
      const categoryParts = place.category_name.split(" > ");
      const restaurantCategory = categoryParts.length > 1 
        ? categoryParts[1] 
        : categoryParts[0];

      // 이미지는 Unsplash에서 카테고리별로 가져오기
      const categoryImages: { [key: string]: string } = {
        "한식": "https://images.unsplash.com/photo-1629642621587-9947ce328799?w=400",
        "일식": "https://images.unsplash.com/photo-1725122194872-ace87e5a1a8d?w=400",
        "중식": "https://images.unsplash.com/photo-1670518045382-b68878eebecc?w=400",
        "양식": "https://images.unsplash.com/photo-1644447381290-85358ae625cb?w=400",
        "이탈리안": "https://images.unsplash.com/photo-1662197480393-2a82030b7b83?w=400",
        "카페": "https://images.unsplash.com/photo-1659474312903-3a0ab87697ac?w=400",
      };

      const defaultImage = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400";
      const image = Object.keys(categoryImages).find(key => 
        restaurantCategory.includes(key)
      ) ? categoryImages[Object.keys(categoryImages).find(key => restaurantCategory.includes(key))!] : defaultImage;

      return {
        id: place.id,
        name: place.place_name,
        category: restaurantCategory,
        rating: 4.0 + Math.random() * 0.9, // 카카오 API는 평점을 제공하지 않으므로 임의 생성
        reviewCount: Math.floor(Math.random() * 200) + 50,
        distance: distance,
        address: place.road_address_name || place.address_name,
        phone: place.phone || "정보 없음",
        image: image,
        priceRange: "₩₩",
        openNow: Math.random() > 0.3, // 임의로 생성 (실제로는 영업시간 정보가 필요)
        lat: parseFloat(place.y),
        lng: parseFloat(place.x),
      };
    });

    return restaurants;
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    // API 오류 시 빈 배열 반환
    return [];
  }
}

// 특정 키워드로 맛집 검색
export async function searchRestaurantsByKeyword(
  keyword: string,
  lat: number,
  lng: number
): Promise<Restaurant[]> {
  try {
    const response = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(
        keyword
      )}&x=${lng}&y=${lat}&sort=distance&size=15`,
      {
        headers: {
          Authorization: `KakaoAK ${KAKAO_CONFIG.REST_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to search restaurants");
    }

    const data = await response.json();

    const restaurants: Restaurant[] = data.documents.map((place: any) => {
      const distance = place.distance ? parseFloat(place.distance) / 1000 : 0;
      const categoryParts = place.category_name.split(" > ");
      const restaurantCategory = categoryParts.length > 1 
        ? categoryParts[1] 
        : categoryParts[0];

      return {
        id: place.id,
        name: place.place_name,
        category: restaurantCategory,
        rating: 4.0 + Math.random() * 0.9,
        reviewCount: Math.floor(Math.random() * 200) + 50,
        distance: distance,
        address: place.road_address_name || place.address_name,
        phone: place.phone || "정보 없음",
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
        priceRange: "₩₩",
        openNow: Math.random() > 0.3,
        lat: parseFloat(place.y),
        lng: parseFloat(place.x),
      };
    });

    return restaurants;
  } catch (error) {
    console.error("Error searching restaurants:", error);
    return [];
  }
}
