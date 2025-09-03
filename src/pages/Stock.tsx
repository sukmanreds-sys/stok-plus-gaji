import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, AlertTriangle, Plus, Search, Filter, Download, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AddStockForm from "@/components/forms/AddStockForm";
import { exportToPDF, formatCurrencyForExport } from "@/components/utils/exportToPDF";

interface StockItem {
  id_barang: string;
  nama_barang: string;
  stok: number;
  stok_minimum: number;
  harga: number;
  jenis: 'bahan_baku' | 'barang_jadi';
  created_at: string;
  updated_at: string;
}

const Stock = () => {
  const [stockData, setStockData] = useState<StockItem[]>([]);
  const [filteredData, setFilteredData] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<'all' | 'bahan_baku' | 'barang_jadi' | 'low_stock'>('all');

  useEffect(() => {
    fetchStockData();
    
    // Set up real-time subscription for stock updates
    const channel = supabase
      .channel('stock-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'barang'
        },
        () => {
          fetchStockData();
          toast.success('Data stok diperbarui secara otomatis');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    filterData();
  }, [stockData, searchTerm, filterType]);

  const fetchStockData = async () => {
    try {
      const { data, error } = await supabase
        .from('barang')
        .select('*')
        .order('nama_barang');

      if (error) throw error;
      setStockData(data || []);
    } catch (error) {
      console.error('Error fetching stock data:', error);
      toast.error('Gagal memuat data stok');
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let filtered = stockData;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.nama_barang.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    switch (filterType) {
      case 'bahan_baku':
        filtered = filtered.filter(item => item.jenis === 'bahan_baku');
        break;
      case 'barang_jadi':
        filtered = filtered.filter(item => item.jenis === 'barang_jadi');
        break;
      case 'low_stock':
        filtered = filtered.filter(item => item.stok <= item.stok_minimum);
        break;
    }

    setFilteredData(filtered);
  };

  const getStockStatus = (stok: number, stokMinimum: number) => {
    if (stok === 0) return { status: 'Habis', color: 'destructive' as const };
    if (stok <= stokMinimum) return { status: 'Menipis', color: 'warning' as const };
    return { status: 'Aman', color: 'success' as const };
  };

  const getStockStatusColor = (stok: number, stokMinimum: number) => {
    if (stok === 0) return 'bg-destructive/20 text-destructive border-destructive/30';
    if (stok <= stokMinimum) return 'bg-warning/20 text-warning border-warning/30';
    return 'bg-success/20 text-success border-success/30';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleDeleteItem = async (itemId: string, itemName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus barang "${itemName}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('barang')
        .delete()
        .eq('id_barang', itemId);

      if (error) throw error;
      
      toast.success(`Barang "${itemName}" berhasil dihapus`);
      fetchStockData();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Gagal menghapus barang');
    }
  };

  const handleExportPDF = () => {
    const exportData = filteredData.map(item => ({
      'Nama Barang': item.nama_barang,
      'Jenis': item.jenis === 'bahan_baku' ? 'Bahan Baku' : 'Barang Jadi',
      'Stok': item.stok.toString(),
      'Min. Stok': item.stok_minimum.toString(),
      'Status': getStockStatus(item.stok, item.stok_minimum),
      'Harga': formatCurrencyForExport(item.harga),
      'Total Nilai': formatCurrencyForExport(item.stok * item.harga)
    }));

    exportToPDF(
      'Laporan Stok Barang',
      exportData,
      ['Nama Barang', 'Jenis', 'Stok', 'Min. Stok', 'Status', 'Harga', 'Total Nilai'],
      'laporan-stok'
    );
  };

  const lowStockCount = stockData.filter(item => item.stok <= item.stok_minimum).length;
  const outOfStockCount = stockData.filter(item => item.stok === 0).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded"></div>
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Package className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Manajemen Stok</h1>
            <p className="text-muted-foreground">
              Kelola stok barang dengan sinkronisasi real-time
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <AddStockForm onSuccess={() => fetchStockData()} />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-primary/20 bg-gradient-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Barang</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stockData.length}</div>
            <p className="text-xs text-muted-foreground">Jenis barang terdaftar</p>
          </CardContent>
        </Card>

        <Card className="border-warning/20 bg-gradient-to-br from-warning/5 to-warning/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stok Menipis</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground">Perlu restok segera</p>
          </CardContent>
        </Card>

        <Card className="border-destructive/20 bg-gradient-to-br from-destructive/5 to-destructive/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stok Habis</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{outOfStockCount}</div>
            <p className="text-xs text-muted-foreground">Barang kosong</p>
          </CardContent>
        </Card>

        <Card className="border-success/20 bg-gradient-to-br from-success/5 to-success/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stok Aman</CardTitle>
            <Package className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {stockData.length - lowStockCount}
            </div>
            <p className="text-xs text-muted-foreground">Stok mencukupi</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Pencarian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama barang..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('all')}
              >
                Semua
              </Button>
              <Button
                variant={filterType === 'bahan_baku' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('bahan_baku')}
              >
                Bahan Baku
              </Button>
              <Button
                variant={filterType === 'barang_jadi' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('barang_jadi')}
              >
                Barang Jadi
              </Button>
              <Button
                variant={filterType === 'low_stock' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('low_stock')}
              >
                <AlertTriangle className="h-4 w-4 mr-1" />
                Menipis
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Stok Barang</CardTitle>
          <p className="text-sm text-muted-foreground">
            Menampilkan {filteredData.length} dari {stockData.length} barang
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Nama Barang</th>
                  <th className="text-left py-3 px-4 font-medium">Jenis</th>
                  <th className="text-right py-3 px-4 font-medium">Stok</th>
                  <th className="text-right py-3 px-4 font-medium">Min</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-right py-3 px-4 font-medium">HPP</th>
                  <th className="text-right py-3 px-4 font-medium">Nilai</th>
                  <th className="text-center py-3 px-4 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => {
                  const stockStatus = getStockStatus(item.stok, item.stok_minimum);
                  return (
                    <tr key={item.id_barang} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-medium">{item.nama_barang}</td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant="outline"
                          className={
                            item.jenis === 'bahan_baku' 
                              ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                              : 'bg-green-500/10 text-green-500 border-green-500/20'
                          }
                        >
                          {item.jenis === 'bahan_baku' ? 'Bahan Baku' : 'Barang Jadi'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold">
                        {item.stok.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-muted-foreground">
                        {item.stok_minimum.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant="outline"
                          className={getStockStatusColor(item.stok, item.stok_minimum)}
                        >
                          {stockStatus.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-mono">
                        {formatCurrency(item.harga)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold">
                        {formatCurrency(item.stok * item.harga)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteItem(item.id_barang, item.nama_barang)}
                          className="hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Tidak Ada Data</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterType !== 'all' 
                  ? 'Tidak ada barang yang sesuai dengan filter'
                  : 'Belum ada barang yang terdaftar'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Stock;