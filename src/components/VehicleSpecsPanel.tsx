import { motion, AnimatePresence } from "framer-motion";
import { Gauge, Zap, Timer, Weight, Ruler, Cpu, ArrowUp } from "lucide-react";
import type { CarModel } from "./CarConfigurator";

interface VehicleSpecs {
  hp: number;
  torque: string;
  zeroToSixty: string;
  weight: string;
  dimensions: string;
  engine: string;
  topSpeed: string;
}

const VEHICLE_SPECS: Record<CarModel, VehicleSpecs> = {
  sports: { hp: 640, torque: "600 Nm", zeroToSixty: "2.9s", weight: "1,422 kg", dimensions: "4.52 × 1.93 × 1.17 m", engine: "V10 5.2L", topSpeed: "325 km/h" },
  sedan: { hp: 523, torque: "750 Nm", zeroToSixty: "3.6s", weight: "1,950 kg", dimensions: "5.12 × 1.90 × 1.47 m", engine: "V8 4.4L Twin-Turbo", topSpeed: "290 km/h" },
  muscle: { hp: 480, torque: "569 Nm", zeroToSixty: "3.8s", weight: "1,735 kg", dimensions: "4.78 × 1.92 × 1.38 m", engine: "V8 5.0L", topSpeed: "265 km/h" },
  suv: { hp: 395, torque: "550 Nm", zeroToSixty: "4.5s", weight: "2,310 kg", dimensions: "4.93 × 2.00 × 1.74 m", engine: "V6 3.0L Twin-Turbo", topSpeed: "250 km/h" },
  pickup: { hp: 450, torque: "690 Nm", zeroToSixty: "5.1s", weight: "2,680 kg", dimensions: "5.89 × 2.03 × 1.92 m", engine: "V8 6.2L", topSpeed: "210 km/h" },
  convertible: { hp: 455, torque: "530 Nm", zeroToSixty: "3.4s", weight: "1,585 kg", dimensions: "4.38 × 1.86 × 1.26 m", engine: "V8 4.0L Twin-Turbo", topSpeed: "310 km/h" },
  van: { hp: 275, torque: "460 Nm", zeroToSixty: "7.8s", weight: "2,480 kg", dimensions: "5.14 × 1.93 × 1.98 m", engine: "V6 3.5L", topSpeed: "195 km/h" },
};

const SPEC_ITEMS = [
  { key: "hp" as const, label: "Horsepower", icon: Zap, suffix: " HP", isNumber: true },
  { key: "torque" as const, label: "Torque", icon: Gauge },
  { key: "zeroToSixty" as const, label: "0-60 mph", icon: Timer },
  { key: "topSpeed" as const, label: "Top Speed", icon: ArrowUp },
  { key: "weight" as const, label: "Weight", icon: Weight },
  { key: "engine" as const, label: "Engine", icon: Cpu },
  { key: "dimensions" as const, label: "Dimensions", icon: Ruler },
];

export function VehicleSpecsPanel({ model }: { model: CarModel }) {
  const specs = VEHICLE_SPECS[model];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={model}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25 }}
        className="absolute bottom-14 left-4 z-10 w-56 bg-card/85 backdrop-blur-md border border-border rounded-xl p-3 space-y-1.5"
      >
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-2">
          Specifications
        </p>
        {SPEC_ITEMS.map((item) => {
          const val = item.isNumber ? `${specs[item.key]}${item.suffix || ""}` : specs[item.key];
          return (
            <div key={item.key} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <item.icon className="w-3 h-3 text-primary" />
                <span className="text-[10px] text-muted-foreground">{item.label}</span>
              </div>
              <span className="text-[11px] font-mono font-semibold text-foreground">{val}</span>
            </div>
          );
        })}
      </motion.div>
    </AnimatePresence>
  );
}
