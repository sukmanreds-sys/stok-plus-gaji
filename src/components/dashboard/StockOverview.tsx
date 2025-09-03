import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Package, TrendingDown, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
        () => {
          fetchStockData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchStockData = async () => {
    try {
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-success/20 bg-gradient-to-br from-success/5 to-success/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Barang</CardTitle>
            <Package className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stockData.length}</div>
            <p className="text-xs text-muted-foreground">
              {stockData.filter(item => item.jenis === 'bahan_baku').length} bahan baku, {' '}
              {stockData.filter(item => item.jenis === 'barang_jadi').length} barang jadi
            </p>
          </CardContent>
        </Card>

        <Card className="border-warning/20 bg-gradient-to-br from-warning/5 to-warning/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stok Menipis</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">
              Perlu segera diisi ulang
            </p>
          </CardContent>
        </Card>

        <Card className="border-info/20 bg-gradient-to-br from-info/5 to-info/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stok</CardTitle>
            <TrendingUp className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">
              {stockData.reduce((sum, item) => sum + item.stok, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Unit keseluruhan</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-gradient-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nilai Aset Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
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
        <Card className="border-destructive/20 bg-gradient-to-r from-destructive/5 to-destructive/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Peringatan Stok Menipis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockItems.map((item) => (
                <div key={item.id_barang} className="flex items-center justify-between bg-card p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">{item.nama_barang}</p>
                    <p className="text-sm text-muted-foreground">
                      Stok: {item.stok} / Min: {item.stok_minimum}
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
    </div>
  );
};

export default StockOverview;