import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProcessingStatusProps {
  accuracyRate?: number;
  period?: string;
}

const ProcessingStatus: React.FC<ProcessingStatusProps> = ({
  accuracyRate = 95,
  period = "Last 30 days",
}) => {
  const circumference = 2 * Math.PI * 36;
  const strokeDasharray = `${(accuracyRate / 100) * circumference} ${circumference}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Processing Status</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <div className="relative inline-flex items-center justify-center mb-4">
          <svg className="w-20 h-20 transform -rotate-90">
            <circle
              cx="40"
              cy="40"
              r="36"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-slate-200 dark:text-slate-700"
            />
            <circle
              cx="40"
              cy="40"
              r="36"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={strokeDasharray}
              className="text-blue-500 dark:text-blue-400"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {accuracyRate}%
            </span>
          </div>
        </div>
        <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">
          Accuracy Rate
        </div>
        <div className="text-xs text-muted-foreground">
          {period}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcessingStatus;
