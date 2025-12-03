import { Heart, Trash2, Route, Navigation } from "lucide-react";
import { Restaurant } from "./RestaurantCard";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";

interface FavoritesListProps {
  favorites: Restaurant[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRemoveFavorite: (id: string) => void;
  onCreateRoute: () => void;
  onRestaurantClick: (restaurant: Restaurant) => void;
}

export function FavoritesList({
  favorites,
  open,
  onOpenChange,
  onRemoveFavorite,
  onCreateRoute,
  onRestaurantClick,
}: FavoritesListProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary fill-current" />
            즐겨찾기
          </SheetTitle>
          <SheetDescription>
            저장한 맛집 {favorites.length}곳
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-3">
          {favorites.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500 text-sm">
                아직 저장한 맛집이 없습니다
              </p>
            </div>
          ) : (
            <>
              {favorites.map((restaurant) => (
                <div
                  key={restaurant.id}
                  className="bg-accent/50 rounded-xl p-4 hover:bg-accent transition-colors cursor-pointer group"
                  onClick={() => onRestaurantClick(restaurant)}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 mb-1 line-clamp-1">
                        {restaurant.name}
                      </h4>
                      <p className="text-sm text-gray-600 mb-1">
                        {restaurant.category} • {restaurant.distance.toFixed(1)}km
                      </p>
                      <div className="flex items-center gap-1 text-xs text-primary">
                        ⭐ {restaurant.rating.toFixed(1)}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFavorite(restaurant.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}

              {favorites.length >= 2 && (
                <Button
                  onClick={onCreateRoute}
                  className="w-full mt-4 h-12 rounded-xl"
                  size="lg"
                >
                  <Route className="w-5 h-5 mr-2" />
                  최적 경로로 코스 만들기
                </Button>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
