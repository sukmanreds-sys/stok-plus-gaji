import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/enhanced-card";
import StockOverview from "@/components/dashboard/StockOverview";
import { BarChart3, Sparkles, Package, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/enhanced-button";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-primary rounded-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Ringkasan sistem manajemen inventori dan produksi
            </p>
          </div>
        </div>
        <Button variant="gradient" size="sm" className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <Sparkles className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      <StockOverview />

      {/* Quick Actions Card */}
      <Card 
        variant="interactive" 
        className="animate-fade-in-up" 
        style={{ animationDelay: '500ms' }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Aksi Cepat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-12 justify-start" onClick={() => navigate('/production')}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Lihat Laporan
            </Button>
            <Button variant="outline" className="h-12 justify-start" onClick={() => navigate('/stock')}>
              <Package className="h-4 w-4 mr-2" />
              Tambah Barang
            </Button>
            <Button variant="outline" className="h-12 justify-start" onClick={() => navigate('/employees')}>
              <Users className="h-4 w-4 mr-2" />
              Input Produksi
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card 
        variant="glass" 
        className="animate-fade-in-up" 
        style={{ animationDelay: '600ms' }}
      >
        <CardHeader>
          <CardTitle>Status Sistem</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
              <span className="text-sm">Semua sistem berjalan normal</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Terakhir diperbarui: {new Date().toLocaleTimeString('id-ID')}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;