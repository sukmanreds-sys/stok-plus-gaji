import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Plus, UserCheck, Building2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AddEmployeeForm from "@/components/forms/AddEmployeeForm";
import { exportToPDF, formatDateForExport } from "@/components/utils/exportToPDF";

interface Employee {
  id_karyawan: string;
  nama: string;
  divisi: 'tabung' | 'asesoris' | 'packing';
  created_at: string;
  updated_at: string;
}

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('karyawan')
        .select('*')
        .order('nama');

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Gagal memuat data karyawan');
    } finally {
      setLoading(false);
    }
  };

  const getDivisionColor = (divisi: string) => {
    switch (divisi) {
      case 'tabung': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'asesoris': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'packing': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getDivisionIcon = (divisi: string) => {
    switch (divisi) {
      case 'tabung': return '🔧';
      case 'asesoris': return '✨';
      case 'packing': return '📦';
      default: return '👤';
    }
  };

  const divisionStats = {
    tabung: employees.filter(emp => emp.divisi === 'tabung').length,
    asesoris: employees.filter(emp => emp.divisi === 'asesoris').length,
    packing: employees.filter(emp => emp.divisi === 'packing').length,
  };

  const handleExportPDF = () => {
    const exportData = employees.map(emp => ({
      'Nama': emp.nama,
      'Divisi': emp.divisi.charAt(0).toUpperCase() + emp.divisi.slice(1),
      'ID Karyawan': emp.id_karyawan.slice(0, 8),
      'Tanggal Bergabung': formatDateForExport(emp.created_at),
      'Status': 'Aktif'
    }));

    exportToPDF(
      'Daftar Karyawan',
      exportData,
      ['Nama', 'Divisi', 'ID Karyawan', 'Tanggal Bergabung', 'Status'],
      'daftar-karyawan'
    );
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
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Manajemen Karyawan</h1>
            <p className="text-muted-foreground">
              Kelola data karyawan dan divisi kerja
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <AddEmployeeForm onSuccess={() => fetchEmployees()} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-primary/20 bg-gradient-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Karyawan</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{employees.length}</div>
            <p className="text-xs text-muted-foreground">Karyawan aktif</p>
          </CardContent>
        </Card>

        <Card className="border-info/20 bg-gradient-to-br from-info/5 to-info/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Divisi Tabung</CardTitle>
            <Building2 className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">{divisionStats.tabung}</div>
            <p className="text-xs text-muted-foreground">Karyawan divisi tabung</p>
          </CardContent>
        </Card>

        <Card className="border-success/20 bg-gradient-to-br from-success/5 to-success/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Divisi Asesoris</CardTitle>
            <Building2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{divisionStats.asesoris}</div>
            <p className="text-xs text-muted-foreground">Karyawan divisi asesoris</p>
          </CardContent>
        </Card>

        <Card className="border-warning/20 bg-gradient-to-br from-warning/5 to-warning/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Divisi Packing</CardTitle>
            <Building2 className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{divisionStats.packing}</div>
            <p className="text-xs text-muted-foreground">Karyawan divisi packing</p>
          </CardContent>
        </Card>
      </div>

      {/* Employee Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((employee) => (
          <Card key={employee.id_karyawan} className="hover:shadow-medium transition-smooth">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-2xl">
                    {getDivisionIcon(employee.divisi)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{employee.nama}</CardTitle>
                    <p className="text-sm text-muted-foreground">ID: {employee.id_karyawan.slice(0, 8)}</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Divisi:</span>
                <Badge className={getDivisionColor(employee.divisi)}>
                  {employee.divisi.charAt(0).toUpperCase() + employee.divisi.slice(1)}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Bergabung:</span>
                <span>{new Date(employee.created_at).toLocaleDateString('id-ID')}</span>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Detail
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {employees.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Tidak Ada Data Karyawan</h3>
            <p className="text-muted-foreground text-center">
              Belum ada karyawan yang terdaftar dalam sistem
            </p>
            <AddEmployeeForm onSuccess={() => fetchEmployees()} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Employees;