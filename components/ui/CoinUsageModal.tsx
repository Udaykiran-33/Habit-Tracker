"use client";

import { Info } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

interface CoinUsageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CoinUsageModal({
  isOpen,
  onClose,
}: CoinUsageModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Habit Created!" size="sm">
      <div className="flex flex-col items-center text-center pb-2">
        <div className="w-16 h-16 bg-olive/20 text-olive-light rounded-full flex items-center justify-center mb-4">
          <Info size={32} />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">
          UrCoin Used
        </h3>
        <p className="text-muted text-sm mb-6 leading-relaxed">
          You have used <strong className="text-foreground">1 U coin</strong> to create a habit. Enjoy tracking your habit and building discipline!
        </p>
        <Button onClick={onClose} className="w-full" size="lg">
          Got it
        </Button>
      </div>
    </Modal>
  );
}
