import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Coins, TrendingUp, Package, Download, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AssetItem {
  id_barang: string;
  nama_barang: string;
  stok: number;
  harga: number;
  jenis: 'bahan_baku' | 'barang_jadi';
  nilai_total: number;
}

interface AssetSummary {
  total_aset: number;
  aset_bahan_baku: number;
  aset_barang_jadi: number;
  total_items: number;
}

const Assets = () => {
  const [assetData, setAssetData] = useState<AssetItem[]>([]);
  const [summary, setSummary] = useState<AssetSummary>({
    total_aset: 0,
    aset_bahan_baku: 0,
    aset_barang_jadi: 0,
    total_items: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAssetData();
    
    // Set up real-time subscription for asset updates
    const channel = supabase
      .channel('asset-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'barang'
        },
        () => {
          fetchAssetData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAssetData = async () => {
    try {
      setRefreshing(true);
      const { data, error } = await supabase
        .from('barang')
        .select('*')
        .order('harga', { ascending: false });

      if (error) throw error;

      // Calculate asset values
      const processedData: AssetItem[] = (data || []).map(item => ({
        ...item,
        nilai_total: item.stok * item.harga
      }));

      setAssetData(processedData);

      // Calculate summary
      const totalAset = processedData.reduce((sum, item) => sum + item.nilai_total, 0);
      const asetBahanBaku = processedData
        .filter(item => item.jenis === 'bahan_baku')
        .reduce((sum, item) => sum + item.nilai_total, 0);
      const asetBarangJadi = processedData
        .filter(item => item.jenis === 'barang_jadi')
        .reduce((sum, item) => sum + item.nilai_total, 0);

      setSummary({
        total_aset: totalAset,
        aset_bahan_baku: asetBahanBaku,
        aset_barang_jadi: asetBarangJadi,
        total_items: processedData.length
      });

    } catch (error) {
      console.error('Error fetching asset data:', error);
      toast.error('Gagal memuat data aset');
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

  const getAssetPercentage = (value: number) => {
    return summary.total_aset > 0 ? ((value / summary.total_aset) * 100).toFixed(1) : '0';
  };

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
          <Coins className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Nilai Aset</h1>
            <p className="text-muted-foreground">
              Total nilai aset berdasarkan HPP dan stok
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAssetData}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-primary/20 bg-gradient-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Aset</CardTitle>
            <Coins className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(summary.total_aset)}
            </div>
            <p className="text-xs text-muted-foreground">
              Nilai seluruh inventori
            </p>
          </CardContent>
        </Card>

        <Card className="border-info/20 bg-gradient-to-br from-info/5 to-info/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aset Bahan Baku</CardTitle>
            <Package className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">
              {formatCurrency(summary.aset_bahan_baku)}
            </div>
            <p className="text-xs text-muted-foreground">
              {getAssetPercentage(summary.aset_bahan_baku)}% dari total aset
            </p>
          </CardContent>
        </Card>

        <Card className="border-success/20 bg-gradient-to-br from-success/5 to-success/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aset Barang Jadi</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {formatCurrency(summary.aset_barang_jadi)}
            </div>
            <p className="text-xs text-muted-foreground">
              {getAssetPercentage(summary.aset_barang_jadi)}% dari total aset
            </p>
          </CardContent>
        </Card>

        <Card className="border-warning/20 bg-gradient-to-br from-warning/5 to-warning/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Item</CardTitle>
            <Package className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {summary.total_items}
            </div>
            <p className="text-xs text-muted-foreground">
              Jenis barang berbeda
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Asset Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detail Nilai Aset per Barang</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Nama Barang</th>
                  <th className="text-left py-3 px-4 font-medium">Jenis</th>
                  <th className="text-right py-3 px-4 font-medium">Stok</th>
                  <th className="text-right py-3 px-4 font-medium">HPP</th>
                  <th className="text-right py-3 px-4 font-medium">Nilai Total</th>
                  <th className="text-right py-3 px-4 font-medium">% dari Total</th>
                </tr>
              </thead>
              <tbody>
                {assetData.map((item) => (
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
                    <td className="py-3 px-4 text-right font-mono">{item.stok.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-mono">{formatCurrency(item.harga)}</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold">
                      {formatCurrency(item.nilai_total)}
                    </td>
                    <td className="py-3 px-4 text-right text-muted-foreground">
                      {getAssetPercentage(item.nilai_total)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {assetData.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Tidak Ada Data Barang</h3>
              <p className="text-muted-foreground">
                Belum ada barang yang terdaftar dalam sistem
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Assets;