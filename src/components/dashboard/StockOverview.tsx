import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/enhanced-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/enhanced-button";
import { AlertTriangle, Package, TrendingDown, TrendingUp, RefreshCw, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SkeletonCard } from "@/components/ui/loading-skeleton";

interface StockItem {
  id_barang: string;
  nama_barang: string;
  stok: number;
  stok_minimum: number;
  harga: number;
  jenis: 'bahan_baku' | 'barang_jadi';
}

const StockOverview = () => {
  const [stockData, setStockData] = useState<StockItem[]>([]);
  const [lowStockItems, setLowStockItems] = useState<StockItem[]>([]);
  const [totalAssets, setTotalAssets] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStockData();
    
    // Set up real-time subscription for stock updates
    const channel = supabase
      .channel('stock-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'barang'
        },
        (payload) => {
          console.log('Stock update received:', payload);
          fetchStockData();
          toast.success('Data stok diperbarui secara real-time', {
            description: 'Perubahan stok terdeteksi dan data telah disinkronkan',
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchStockData = async () => {
    try {
      setRefreshing(true);
      const { data, error } = await supabase
        .from('barang')
        .select('*')
        .order('nama_barang');

      if (error) throw error;

      setStockData(data || []);
      
      // Filter low stock items
      const lowStock = (data || []).filter(item => item.stok <= item.stok_minimum);
      setLowStockItems(lowStock);
      
      // Calculate total assets
      const totalValue = (data || []).reduce((sum, item) => sum + (item.stok * item.harga), 0);
      setTotalAssets(totalValue);
      
    } catch (error) {
      console.error('Error fetching stock data:', error);
      toast.error('Gagal memuat data stok');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-muted animate-shimmer rounded"></div>
          <Button loading variant="outline" disabled>
            <RefreshCw className="h-4 w-4 mr-2" />
            Memuat...
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} className="animate-fade-in" style={{ 
              animationDelay: `${i * 100}ms` 
            }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold animate-fade-in">Ringkasan Stok</h2>
          <p className="text-muted-foreground animate-fade-in" style={{ animationDelay: '100ms' }}>
            Data real-time dengan sinkronisasi otomatis
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchStockData}
          loading={refreshing}
          className="animate-fade-in"
          style={{ animationDelay: '200ms' }}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {refreshing ? 'Menyinkronkan...' : 'Refresh'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          variant="interactive" 
          className="border-success/20 bg-gradient-to-br from-success/5 to-success/10 animate-fade-in-up"
          style={{ animationDelay: '0ms' }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Barang</CardTitle>
            <Package className="h-4 w-4 text-success animate-pulse-glow" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stockData.length}</div>
            <p className="text-xs text-muted-foreground">
              {stockData.filter(item => item.jenis === 'bahan_baku').length} bahan baku, {' '}
              {stockData.filter(item => item.jenis === 'barang_jadi').length} barang jadi
            </p>
          </CardContent>
        </Card>

        <Card 
          variant="interactive" 
          className={`border-warning/20 bg-gradient-to-br from-warning/5 to-warning/10 animate-fade-in-up ${
            lowStockItems.length > 0 ? 'animate-pulse-glow' : ''
          }`}
          style={{ animationDelay: '100ms' }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stok Menipis</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">
              {lowStockItems.length > 0 ? 'Perlu segera diisi ulang!' : 'Semua stok aman'}
            </p>
          </CardContent>
        </Card>

        <Card 
          variant="interactive" 
          className="border-info/20 bg-gradient-to-br from-info/5 to-info/10 animate-fade-in-up"
          style={{ animationDelay: '200ms' }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stok</CardTitle>
            <TrendingUp className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">
              {stockData.reduce((sum, item) => sum + item.stok, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Unit keseluruhan</p>
          </CardContent>
        </Card>

        <Card 
          variant="glow" 
          className="bg-gradient-primary/10 animate-fade-in-up"
          style={{ animationDelay: '300ms' }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nilai Aset Total</CardTitle>
            <Zap className="h-4 w-4 text-primary animate-pulse-glow" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(totalAssets)}
            </div>
            <p className="text-xs text-muted-foreground">
              HPP keseluruhan stok
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card 
          variant="elevated" 
          className="border-destructive/20 bg-gradient-to-r from-destructive/5 to-destructive/10 animate-fade-in-up"
          style={{ animationDelay: '400ms' }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5 animate-pulse" />
              Peringatan Stok Menipis
              <Badge variant="destructive" className="ml-auto">
                {lowStockItems.length} Item
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockItems.map((item, index) => (
                <div 
                  key={item.id_barang} 
                  className="flex items-center justify-between bg-card/80 p-3 rounded-lg border hover:shadow-medium transition-smooth animate-scale-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div>
                    <p className="font-medium">{item.nama_barang}</p>
                    <p className="text-sm text-muted-foreground">
                      Stok: <span className="font-semibold text-destructive">{item.stok}</span> / 
                      Min: <span className="font-semibold">{item.stok_minimum}</span>
                    </p>
                  </div>
                  <Badge variant={item.stok === 0 ? "destructive" : "outline"}>
                    {item.jenis === 'bahan_baku' ? 'Bahan Baku' : 'Barang Jadi'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real-time indicator */}
      <div className="flex items-center justify-center text-xs text-muted-foreground animate-fade-in">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          Sinkronisasi real-time aktif
        </div>
      </div>
    </div>
  );
};

export default StockOverview;