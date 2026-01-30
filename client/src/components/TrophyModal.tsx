import { useEffect, useState } from "react";
import { formatDistanceStrict, isSameDay, startOfDay } from "date-fns";
import { Trophy, Clock, CheckCircle2, RotateCcw, Award, ArrowLeft } from "lucide-react";
import confetti from "canvas-confetti";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSoundEffects } from "./AudioEffects";
import { useTrophyCounts, useIncrementTrophy } from "@/hooks/use-todos";

interface TrophyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReset: () => void;
  startTime: string | Date | null;
  endTime: Date;
  taskCount: number;
}

const TROPHY_CONFIG = [
  { tier: 1, name: "Diamond", color: "text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]", bgColor: "bg-gradient-to-br from-cyan-100 to-cyan-200" },
  { tier: 2, name: "Gold", color: "text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]", bgColor: "bg-gradient-to-br from-yellow-100 to-yellow-200" },
  { tier: 3, name: "Silver", color: "text-slate-300 drop-shadow-[0_0_10px_rgba(203,213,225,0.5)]", bgColor: "bg-gradient-to-br from-slate-100 to-slate-200" },
  { tier: 4, name: "Bronze", color: "text-orange-400", bgColor: "bg-gradient-to-br from-orange-100 to-orange-200" },
  { tier: 5, name: "Iron", color: "text-slate-500", bgColor: "bg-gradient-to-br from-slate-100 to-slate-300" },
  { tier: 6, name: "Stone", color: "text-stone-500", bgColor: "bg-gradient-to-br from-stone-100 to-stone-300" },
  { tier: 7, name: "Wood", color: "text-amber-700", bgColor: "bg-gradient-to-br from-amber-100 to-amber-200" },
  { tier: 8, name: "Participation", color: "text-slate-400", bgColor: "bg-gradient-to-br from-slate-50 to-slate-100" },
];

function calculateTrophyTier(startTime: Date, endTime: Date): number {
  const diffHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
  
  // Tier 1: Within 4 hours
  if (diffHours <= 4) {
    return 1;
  }
  
  // Tier 2: By end of the same day (before midnight)
  const startDay = startOfDay(startTime);
  const endDay = startOfDay(endTime);
  if (isSameDay(startTime, endTime)) {
    return 2;
  }
  
  // Next day logic: every 3 hours is a lower tier
  const hoursIntoNextDay = (endTime.getTime() - endDay.getTime()) / (1000 * 60 * 60);
  
  // Tier 3: 0-3 hours into next day
  // Tier 4: 3-6 hours into next day
  // Tier 5: 6-9 hours
  // Tier 6: 9-12 hours
  // Tier 7: 12-15 hours
  // Tier 8: 15+ hours
  const tier = Math.min(8, 3 + Math.floor(hoursIntoNextDay / 3));
  return tier;
}

export function TrophyModal({ isOpen, onClose, onReset, startTime, endTime, taskCount }: TrophyModalProps) {
  const { playSuccess } = useSoundEffects();
  const [tier, setTier] = useState<number>(1);
  const [showCollection, setShowCollection] = useState(false);
  const [hasSavedTrophy, setHasSavedTrophy] = useState(false);
  
  const { data: trophyCounts } = useTrophyCounts();
  const incrementTrophy = useIncrementTrophy();

  useEffect(() => {
    if (isOpen && !hasSavedTrophy) {
      playSuccess();
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#ff0000', '#2a4c9e'],
        disableForReducedMotion: true
      });

      if (startTime) {
        const calculatedTier = calculateTrophyTier(new Date(startTime), endTime);
        setTier(calculatedTier);
        
        // Save the trophy to the collection
        incrementTrophy.mutate(calculatedTier);
        setHasSavedTrophy(true);
      }
    }
  }, [isOpen, startTime, endTime, playSuccess, hasSavedTrophy, incrementTrophy]);

  useEffect(() => {
    if (!isOpen) {
      setHasSavedTrophy(false);
      setShowCollection(false);
    }
  }, [isOpen]);

  const duration = startTime 
    ? formatDistanceStrict(new Date(startTime), endTime) 
    : "0 minutes";

  const trophyConfig = TROPHY_CONFIG.find(t => t.tier === tier) || TROPHY_CONFIG[7];

  const handleReset = () => {
    setShowCollection(false);
    onReset();
  };

  const getTotalTrophies = () => {
    if (!trophyCounts) return 0;
    return trophyCounts.tier1 + trophyCounts.tier2 + trophyCounts.tier3 + 
           trophyCounts.tier4 + trophyCounts.tier5 + trophyCounts.tier6 + 
           trophyCounts.tier7 + trophyCounts.tier8;
  };

  const getMaxCount = () => {
    if (!trophyCounts) return 1;
    return Math.max(1, 
      trophyCounts.tier1, trophyCounts.tier2, trophyCounts.tier3,
      trophyCounts.tier4, trophyCounts.tier5, trophyCounts.tier6,
      trophyCounts.tier7, trophyCounts.tier8
    );
  };

  if (showCollection) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-lg font-hand border-4 border-double border-stone-200 bg-[#fefcf5] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-col items-center space-y-2 pt-4">
            <DialogTitle className="text-2xl text-center font-bold text-slate-800 flex items-center gap-2">
              <Award className="w-6 h-6 text-yellow-500" />
              Trophy Collection
            </DialogTitle>
            <p className="text-center text-slate-500 text-sm font-sans">
              Total: {getTotalTrophies()} trophies earned
            </p>
          </DialogHeader>

          <div className="py-4 space-y-3">
            {TROPHY_CONFIG.map((config) => {
              const tierKey = `tier${config.tier}` as keyof typeof trophyCounts;
              const count = trophyCounts ? (trophyCounts[tierKey] as number) : 0;
              const maxCount = getMaxCount();
              const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
              
              return (
                <div key={config.tier} className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <Trophy className={`w-5 h-5 ${config.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-bold text-slate-700">{config.name}</span>
                      <span className="text-sm font-sans font-bold text-slate-500">{count}</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${config.bgColor} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <DialogFooter className="sm:justify-center gap-2 flex-col sm:flex-row">
            <Button 
              variant="outline"
              onClick={() => setShowCollection(false)}
              className="w-full sm:w-auto font-sans font-bold py-5 px-6 rounded-xl"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button 
              onClick={handleReset}
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white font-sans font-bold py-5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Start New List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md font-hand border-4 border-double border-stone-200 bg-[#fefcf5]">
        <DialogHeader className="flex flex-col items-center space-y-4 pt-6">
          <div className={`transform transition-all duration-700 hover:scale-110 ${trophyConfig.color}`}>
            <Trophy size={80} strokeWidth={1.5} />
          </div>
          <DialogTitle className="text-3xl text-center font-bold text-slate-800">
            {trophyConfig.name} Achiever!
          </DialogTitle>
          <p className="text-center text-slate-600 text-lg">
            You crushed your to-do list with style.
          </p>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-6">
          <div className="flex flex-col items-center p-4 bg-slate-50 rounded-xl border border-slate-100 shadow-sm">
            <Clock className="mb-2 text-blue-500" />
            <span className="text-sm text-slate-500 uppercase tracking-wider font-sans font-bold">Time</span>
            <span className="text-xl font-bold text-slate-700">{duration}</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-slate-50 rounded-xl border border-slate-100 shadow-sm">
            <CheckCircle2 className="mb-2 text-green-500" />
            <span className="text-sm text-slate-500 uppercase tracking-wider font-sans font-bold">Tasks</span>
            <span className="text-xl font-bold text-slate-700">{taskCount} Done</span>
          </div>
        </div>

        <DialogFooter className="sm:justify-center gap-2 flex-col sm:flex-row">
          <Button 
            variant="outline"
            onClick={() => setShowCollection(true)}
            className="w-full sm:w-auto font-sans font-bold py-6 px-8 rounded-xl"
          >
            <Award className="mr-2 h-5 w-5" />
            Trophies
          </Button>
          <Button 
            onClick={handleReset}
            className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white font-sans font-bold py-6 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            Start New List
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
