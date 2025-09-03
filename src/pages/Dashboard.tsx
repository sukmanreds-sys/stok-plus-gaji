import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StockOverview from "@/components/dashboard/StockOverview";
import { BarChart3 } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Ringkasan sistem manajemen inventori dan produksi
          </p>
        </div>
      </div>

      <StockOverview />

      {/* Additional widgets can be added here */}
      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Fitur aktivitas terbaru akan segera hadir...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;