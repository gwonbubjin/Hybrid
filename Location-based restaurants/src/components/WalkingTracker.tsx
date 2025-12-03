import { useEffect, useState } from "react";
import { Footprints, TrendingUp, Target } from "lucide-react";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";

interface WalkingTrackerProps {
  currentDistance: number;
  dailyGoal?: number;
}

export function WalkingTracker({ currentDistance, dailyGoal = 10000 }: WalkingTrackerProps) {
  const [steps, setSteps] = useState(0);

  useEffect(() => {
    // 1km ≈ 1,250 걸음으로 계산
    const calculatedSteps = Math.round(currentDistance * 1250);
    setSteps(calculatedSteps);
  }, [currentDistance]);

  const progress = Math.min((steps / dailyGoal) * 100, 100);
  const remainingSteps = Math.max(dailyGoal - steps, 0);

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Footprints className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600">오늘의 걸음</p>
            <p className="text-xl text-gray-900">{steps.toLocaleString()} 걸음</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">거리</p>
          <p className="text-lg text-primary">{currentDistance.toFixed(2)}km</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-gray-600">
            <Target className="w-4 h-4" />
            목표까지
          </div>
          <span className="text-gray-900 font-medium">
            {remainingSteps.toLocaleString()} 걸음
          </span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{progress.toFixed(0)}% 달성</span>
          <span>목표: {dailyGoal.toLocaleString()} 걸음</span>
        </div>
      </div>

      {progress >= 100 && (
        <div className="mt-3 bg-primary/10 text-primary rounded-lg p-2 text-center text-sm flex items-center justify-center gap-2">
          <TrendingUp className="w-4 h-4" />
          <span>오늘의 목표를 달성했어요! 🎉</span>
        </div>
      )}
    </Card>
  );
}
