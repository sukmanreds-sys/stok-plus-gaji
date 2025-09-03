import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Plus, Search, TrendingDown, TrendingUp, Package2, ShoppingCart, Settings, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AddTransactionForm from "@/components/forms/AddTransactionForm";
import { exportToPDF, formatCurrencyForExport, formatDateForExport } from "@/components/utils/exportToPDF";

interface Transaction {
  id_transaksi: string;
  id_barang: string;
  jumlah: number;
  jenis: 'masuk' | 'keluar_produksi' | 'keluar_penjualan' | 'keluar_lainnya';
  keterangan: string | null;
  tanggal: string;
  created_at: string;
  updated_at: string;
  barang?: {
    nama_barang: string;
    harga: number;
    jenis: string;
  };
}

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredData, setFilteredData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<'all' | 'masuk' | 'keluar_produksi' | 'keluar_penjualan' | 'keluar_lainnya'>('all');

  useEffect(() => {
    fetchTransactions();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('transaction-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transaksi'
        },
        () => {
          fetchTransactions();
          toast.success('Data transaksi diperbarui secara otomatis');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    filterData();
  }, [transactions, searchTerm, filterType]);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transaksi')
        .select(`
          *,
          barang:id_barang (
            nama_barang,
            harga,
            jenis
          )
        `)
        .order('tanggal', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Gagal memuat data transaksi');
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let filtered = transactions;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.barang?.nama_barang.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.keterangan?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.jenis === filterType);
    }

    setFilteredData(filtered);
  };

  const getTransactionTypeIcon = (jenis: string) => {
    switch (jenis) {
      case 'masuk':
        return <TrendingUp className="h-4 w-4" />;
      case 'keluar_produksi':
        return <Package2 className="h-4 w-4" />;
      case 'keluar_penjualan':
        return <ShoppingCart className="h-4 w-4" />;
      case 'keluar_lainnya':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <ArrowUpDown className="h-4 w-4" />;
    }
  };

  const getTransactionTypeLabel = (jenis: string) => {
    switch (jenis) {
      case 'masuk':
        return 'Barang Masuk';
      case 'keluar_produksi':
        return 'Keluar untuk Produksi';
      case 'keluar_penjualan':
        return 'Keluar untuk Penjualan';
      case 'keluar_lainnya':
        return 'Keluar Lainnya';
      default:
        return jenis;
    }
  };

  const getTransactionTypeColor = (jenis: string) => {
    switch (jenis) {
      case 'masuk':
        return 'bg-success/20 text-success border-success/30';
      case 'keluar_produksi':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'keluar_penjualan':
        return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
      case 'keluar_lainnya':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      default:
        return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate stats
  const totalMasuk = transactions.filter(t => t.jenis === 'masuk').reduce((sum, t) => sum + t.jumlah, 0);
  const totalKeluarProduksi = transactions.filter(t => t.jenis === 'keluar_produksi').reduce((sum, t) => sum + t.jumlah, 0);
  const totalKeluarPenjualan = transactions.filter(t => t.jenis === 'keluar_penjualan').reduce((sum, t) => sum + t.jumlah, 0);
  const totalKeluarLainnya = transactions.filter(t => t.jenis === 'keluar_lainnya').reduce((sum, t) => sum + t.jumlah, 0);

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
          <ArrowUpDown className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Transaksi Barang</h1>
            <p className="text-muted-foreground">
              Kelola alur masuk dan keluar barang gudang
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            const exportData = filteredData.map(transaction => ({
              'Tanggal': formatDateForExport(transaction.tanggal),
              'Barang': transaction.barang?.nama_barang || 'Barang Tidak Ditemukan',
              'Jenis Transaksi': getTransactionTypeLabel(transaction.jenis),
              'Jumlah': (transaction.jenis === 'masuk' ? '+' : '-') + transaction.jumlah.toLocaleString(),
              'Nilai': transaction.barang ? formatCurrencyForExport(transaction.jumlah * transaction.barang.harga) : '-',
              'Keterangan': transaction.keterangan || '-'
            }));

            exportToPDF(
              'Laporan Transaksi Barang',
              exportData,
              ['Tanggal', 'Barang', 'Jenis Transaksi', 'Jumlah', 'Nilai', 'Keterangan'],
              'laporan-transaksi'
            );
          }}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <AddTransactionForm onSuccess={() => fetchTransactions()} />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-success/20 bg-gradient-to-br from-success/5 to-success/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Barang Masuk</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{totalMasuk.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total unit masuk</p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Keluar Produksi</CardTitle>
            <Package2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{totalKeluarProduksi.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Unit untuk produksi</p>
          </CardContent>
        </Card>

        <Card className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-orange-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Keluar Penjualan</CardTitle>
            <ShoppingCart className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{totalKeluarPenjualan.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Unit terjual</p>
          </CardContent>
        </Card>

        <Card className="border-destructive/20 bg-gradient-to-br from-destructive/5 to-destructive/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Keluar Lainnya</CardTitle>
            <Settings className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{totalKeluarLainnya.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Unit lainnya</p>
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
                  placeholder="Cari nama barang atau keterangan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select
                value={filterType}
                onValueChange={(value) => setFilterType(value as typeof filterType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter transaksi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Transaksi</SelectItem>
                  <SelectItem value="masuk">Barang Masuk</SelectItem>
                  <SelectItem value="keluar_produksi">Keluar Produksi</SelectItem>
                  <SelectItem value="keluar_penjualan">Keluar Penjualan</SelectItem>
                  <SelectItem value="keluar_lainnya">Keluar Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Table */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Transaksi</CardTitle>
          <p className="text-sm text-muted-foreground">
            Menampilkan {filteredData.length} dari {transactions.length} transaksi
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Tanggal</th>
                  <th className="text-left py-3 px-4 font-medium">Barang</th>
                  <th className="text-left py-3 px-4 font-medium">Jenis Transaksi</th>
                  <th className="text-right py-3 px-4 font-medium">Jumlah</th>
                  <th className="text-right py-3 px-4 font-medium">Nilai</th>
                  <th className="text-left py-3 px-4 font-medium">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((transaction) => (
                  <tr key={transaction.id_transaksi} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 text-sm">
                      {formatDate(transaction.tanggal)}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {transaction.barang?.nama_barang || 'Barang Tidak Ditemukan'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge 
                        variant="outline"
                        className={`${getTransactionTypeColor(transaction.jenis)} gap-1`}
                      >
                        {getTransactionTypeIcon(transaction.jenis)}
                        {getTransactionTypeLabel(transaction.jenis)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold">
                      {transaction.jenis === 'masuk' ? '+' : '-'}{transaction.jumlah.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {transaction.barang ? formatCurrency(transaction.jumlah * transaction.barang.harga) : '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {transaction.keterangan || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <ArrowUpDown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Tidak Ada Transaksi</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterType !== 'all' 
                  ? 'Tidak ada transaksi yang sesuai dengan filter'
                  : 'Belum ada transaksi yang tercatat'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Transactions;