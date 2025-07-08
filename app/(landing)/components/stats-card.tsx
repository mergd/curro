interface StatsCardProps {
  number: string;
  label: string;
  color: "blue" | "purple" | "green";
}

export function StatsCard({ number, label, color }: StatsCardProps) {
  const colorClasses = {
    blue: "text-blue-600",
    purple: "text-purple-600",
    green: "text-green-600",
  };

  return (
    <div>
      <div
        className={`text-2xl md:text-3xl font-bold ${colorClasses[color]} font-display`}
      >
        {number}
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
