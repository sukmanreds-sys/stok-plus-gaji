import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Download, Users, Coins } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { exportToPDF, formatCurrencyForExport, formatDateForExport } from "@/components/utils/exportToPDF";

interface ProductionData {
  id_karyawan: string;
  nama: string;
  divisi: string;
  total_produksi: number;
  total_gaji: number;
  productions: {
    nama_barang: string;
    jumlah: number;
    tanggal: string;
  }[];
}

const ProductionRecap = () => {
  const [productionData, setProductionData] = useState<ProductionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // Per-piece payment rates based on division
  const paymentRates = {
    tabung: 8000,
    asesoris: 500,
    packing: 4000,
  };

  useEffect(() => {
    fetchProductionData();
  }, [selectedMonth]);

  const fetchProductionData = async () => {
    try {
      setLoading(true);
      const startOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
      const endOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);

      // Fetch production data with employee and item details
      const { data: productionRaw, error: prodError } = await supabase
        .from('produksi')
        .select(`
          *,
          karyawan:id_karyawan (
            id_karyawan,
            nama,
            divisi
          ),
          barang:id_barang (
            nama_barang
          )
        `)
        .gte('tanggal', startOfMonth.toISOString())
        .lte('tanggal', endOfMonth.toISOString())
        .order('tanggal', { ascending: false });

      if (prodError) throw prodError;

      // Group by employee and calculate totals
      const groupedData: { [key: string]: ProductionData } = {};

      productionRaw?.forEach((item: any) => {
        const employeeId = item.karyawan.id_karyawan;
        const divisi = item.karyawan.divisi as keyof typeof paymentRates;
        
        if (!groupedData[employeeId]) {
          groupedData[employeeId] = {
            id_karyawan: employeeId,
            nama: item.karyawan.nama,
            divisi: item.karyawan.divisi,
            total_produksi: 0,
            total_gaji: 0,
            productions: []
          };
        }

        groupedData[employeeId].total_produksi += item.jumlah;
        groupedData[employeeId].productions.push({
          nama_barang: item.barang.nama_barang,
          jumlah: item.jumlah,
          tanggal: item.tanggal
        });
      });

      // Calculate total salaries based on per-piece rates
      Object.values(groupedData).forEach((employee) => {
        const rate = paymentRates[employee.divisi as keyof typeof paymentRates];
        employee.total_gaji = employee.total_produksi * rate;
      });

      setProductionData(Object.values(groupedData));
    } catch (error) {
      console.error('Error fetching production data:', error);
      toast.error('Gagal memuat data produksi');
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

  const getDivisionColor = (divisi: string) => {
    switch (divisi) {
      case 'tabung': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'asesoris': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'packing': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const totalGajiKeseluruhan = productionData.reduce((sum, emp) => sum + emp.total_gaji, 0);
  const totalProduksiKeseluruhan = productionData.reduce((sum, emp) => sum + emp.total_produksi, 0);

  const handleExportPDF = () => {
    const exportData = productionData.map(emp => ({
      'Nama Karyawan': emp.nama,
      'Divisi': emp.divisi.charAt(0).toUpperCase() + emp.divisi.slice(1),
      'Total Produksi': emp.total_produksi.toString(),
      'Rate per Pcs': formatCurrencyForExport(paymentRates[emp.divisi as keyof typeof paymentRates]),
      'Total Gaji': formatCurrencyForExport(emp.total_gaji)
    }));

    exportToPDF(
      `Rekap Produksi & Gaji - ${format(selectedMonth, 'MMMM yyyy', { locale: id })}`,
      exportData,
      ['Nama Karyawan', 'Divisi', 'Total Produksi', 'Rate per Pcs', 'Total Gaji'],
      `rekap-produksi-gaji-${format(selectedMonth, 'yyyy-MM')}`
    );
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedMonth(date);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
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
        <div>
          <h1 className="text-3xl font-bold">Rekap Produksi & Gaji</h1>
          <p className="text-muted-foreground">
            Periode: {format(selectedMonth, 'MMMM yyyy', { locale: id })}
          </p>
        </div>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Pilih Periode
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedMonth}
                onSelect={handleDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-primary/20 bg-gradient-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Karyawan</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{productionData.length}</div>
            <p className="text-xs text-muted-foreground">Karyawan aktif bulan ini</p>
          </CardContent>
        </Card>

        <Card className="border-success/20 bg-gradient-to-br from-success/5 to-success/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produksi</CardTitle>
            <Users className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{totalProduksiKeseluruhan}</div>
            <p className="text-xs text-muted-foreground">Unit diproduksi</p>
          </CardContent>
        </Card>

        <Card className="border-warning/20 bg-gradient-to-br from-warning/5 to-warning/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gaji</CardTitle>
            <Coins className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {formatCurrency(totalGajiKeseluruhan)}
            </div>
            <p className="text-xs text-muted-foreground">Gaji + bonus produksi</p>
          </CardContent>
        </Card>
      </div>

      {/* Employee Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productionData.map((employee) => (
          <Card key={employee.id_karyawan} className="hover:shadow-medium transition-smooth">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{employee.nama}</CardTitle>
                <Badge className={getDivisionColor(employee.divisi)}>
                  {employee.divisi.charAt(0).toUpperCase() + employee.divisi.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Production Summary */}
              <div className="bg-muted/30 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Total Produksi</span>
                  <span className="text-lg font-bold text-primary">{employee.total_produksi} unit</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {employee.productions.length} item berbeda
                </div>
              </div>

              {/* Salary Calculation */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Rate per Pcs</span>
                  <span>{formatCurrency(paymentRates[employee.divisi as keyof typeof paymentRates])}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Pcs</span>
                  <span>{employee.total_produksi} unit</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total Gaji</span>
                    <span className="text-primary">{formatCurrency(employee.total_gaji)}</span>
                  </div>
                </div>
              </div>

              {/* Production Details */}
              <div className="space-y-1">
                <p className="text-sm font-medium">Detail Produksi:</p>
                <div className="max-h-24 overflow-y-auto text-xs space-y-1">
                  {employee.productions.slice(0, 5).map((prod, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="truncate">{prod.nama_barang}</span>
                      <span className="font-medium">{prod.jumlah}</span>
                    </div>
                  ))}
                  {employee.productions.length > 5 && (
                    <p className="text-muted-foreground">+{employee.productions.length - 5} lainnya</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {productionData.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Tidak Ada Data Produksi</h3>
            <p className="text-muted-foreground text-center">
              Belum ada data produksi untuk periode {format(selectedMonth, 'MMMM yyyy', { locale: id })}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductionRecap;