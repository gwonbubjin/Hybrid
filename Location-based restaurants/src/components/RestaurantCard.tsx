import { MapPin, Star } from "lucide-react";

export interface Restaurant {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  distance: number;
  address: string;
  phone: string;
  image: string;
  priceRange: string;
  openNow: boolean;
  lat: number;
  lng: number;
}

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: () => void;
}

export function RestaurantCard({ restaurant, onClick }: RestaurantCardProps) {
  return (
    <div 
      className="bg-white rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-border"
      onClick={onClick}
    >
      <div className="relative h-40 overflow-hidden bg-gray-100">
        <img 
          src={restaurant.image} 
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        {!restaurant.openNow && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white/90 px-3 py-1 rounded-full text-sm text-gray-900">영업종료</span>
          </div>
        )}
      </div>
      
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-lg flex-1 text-gray-900 line-clamp-1">{restaurant.name}</h3>
          <span className="text-xs text-gray-500 flex-shrink-0 mt-1">{restaurant.distance.toFixed(1)}km</span>
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-primary text-primary" />
            <span className="text-sm text-gray-900">{restaurant.rating.toFixed(1)}</span>
          </div>
          <span className="text-gray-300">•</span>
          <span className="text-sm text-gray-600">리뷰 {restaurant.reviewCount}</span>
          <span className="text-gray-300">•</span>
          <span className="text-sm text-gray-600">{restaurant.category}</span>
        </div>
        
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="line-clamp-1">{restaurant.address}</span>
        </div>
      </div>
    </div>
  );
}
