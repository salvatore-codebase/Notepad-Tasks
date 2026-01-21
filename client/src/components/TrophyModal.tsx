import { useEffect, useState } from "react";
import { formatDistanceStrict } from "date-fns";
import { Trophy, Clock, CheckCircle2, RotateCcw } from "lucide-react";
import confetti from "canvas-confetti";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSoundEffects } from "./AudioEffects";

interface TrophyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReset: () => void;
  startTime: string | Date | null;
  endTime: Date;
  taskCount: number;
}

export function TrophyModal({ isOpen, onClose, onReset, startTime, endTime, taskCount }: TrophyModalProps) {
  const { playSuccess } = useSoundEffects();
  const [tier, setTier] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      playSuccess();
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#ff0000', '#2a4c9e'],
        disableForReducedMotion: true
      });

      if (startTime) {
        const start = new Date(startTime);
        const diffHours = (endTime.getTime() - start.getTime()) / (1000 * 60 * 60);
        
        // Determine trophy tier based on hours taken
        // Tier 1 (Best): < 4 hours
        // Then degrades every 3 hours
        let currentTier = 1;
        if (diffHours > 4) {
          const extraHours = diffHours - 4;
          currentTier = 1 + Math.ceil(extraHours / 3);
        }
        // Cap at tier 8
        if (currentTier > 8) currentTier = 8;
        setTier(currentTier);
      }
    }
  }, [isOpen, startTime, endTime, playSuccess]);

  const duration = startTime 
    ? formatDistanceStrict(new Date(startTime), endTime) 
    : "0 minutes";

  const getTrophyColor = (tier: number) => {
    if (tier === 1) return "text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.6)]"; // Diamond/Platinum
    if (tier === 2) return "text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]"; // Gold
    if (tier === 3) return "text-slate-300 drop-shadow-[0_0_10px_rgba(203,213,225,0.5)]"; // Silver
    if (tier === 4) return "text-orange-400"; // Bronze
    return "text-slate-400"; // Iron/Stone
  };

  const getTrophyTitle = (tier: number) => {
    const titles = [
      "Legendary", "Diamond", "Gold", "Silver", "Bronze", "Iron", "Stone", "Wood", "Participation"
    ];
    return titles[tier] || "Participant";
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md font-hand border-4 border-double border-stone-200 bg-[#fefcf5]">
        <DialogHeader className="flex flex-col items-center space-y-4 pt-6">
          <div className={`transform transition-all duration-700 hover:scale-110 ${getTrophyColor(tier)}`}>
            <Trophy size={80} strokeWidth={1.5} />
          </div>
          <DialogTitle className="text-3xl text-center font-bold text-slate-800">
            {getTrophyTitle(tier)} Achiever!
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

        <DialogFooter className="sm:justify-center">
          <Button 
            onClick={onReset}
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
