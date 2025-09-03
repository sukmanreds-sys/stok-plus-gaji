import { useState } from "react";
import { Button } from "@/components/ui/enhanced-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/enhanced-card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database, Loader2, RefreshCw } from "lucide-react";

const DataSeeder = () => {
  const [seeding, setSeeding] = useState(false);

  const sampleData = {
    barang: [
      {
        nama_barang: "Tabung Gas 3kg",
        jenis: 'barang_jadi' as const,
        stok: 25,
        stok_minimum: 10,
        harga: 150000
      },
      {
        nama_barang: "Tabung Gas 12kg",
        jenis: 'barang_jadi' as const,
        stok: 8,
        stok_minimum: 15,
        harga: 350000
      },
      {
        nama_barang: "Regulator Gas",
        jenis: 'barang_jadi' as const,
        stok: 50,
        stok_minimum: 20,
        harga: 45000
      },
      {
        nama_barang: "Selang Gas",
        jenis: 'barang_jadi' as const,
        stok: 120,
        stok_minimum: 50,
        harga: 25000
      },
      {
        nama_barang: "Besi Plat",
        jenis: 'bahan_baku' as const,
        stok: 200,
        stok_minimum: 100,
        harga: 12000
      },
      {
        nama_barang: "Cat Primer",
        jenis: 'bahan_baku' as const,
        stok: 15,
        stok_minimum: 25,
        harga: 85000
      }
    ],
    karyawan: [
      {
        nama: "Ahmad Surya",
        divisi: 'tabung' as const
      },
      {
        nama: "Siti Rahayu",
        divisi: 'asesoris' as const
      },
      {
        nama: "Budi Santoso",
        divisi: 'packing' as const
      },
      {
        nama: "Dewi Kartika",
        divisi: 'tabung' as const
      },
      {
        nama: "Rizky Pratama",
        divisi: 'asesoris' as const
      }
    ]
  };

  const seedDatabase = async () => {
    try {
      setSeeding(true);
      toast.success('Memulai pengisian data demo...', {
        description: 'Mohon tunggu sebentar'
      });

      // Insert sample products
      const { error: barangError } = await supabase
        .from('barang')
        .insert(sampleData.barang);

      if (barangError) {
        console.error('Error inserting barang:', barangError);
        throw new Error('Gagal menambahkan data barang');
      }

      // Insert sample employees
      const { error: karyawanError } = await supabase
        .from('karyawan')
        .insert(sampleData.karyawan);

      if (karyawanError) {
        console.error('Error inserting karyawan:', karyawanError);
        throw new Error('Gagal menambahkan data karyawan');
      }

      // Add some sample production data
      const { data: barangData } = await supabase
        .from('barang')
        .select('id_barang')
        .limit(3);

      const { data: karyawanData } = await supabase
        .from('karyawan')
        .select('id_karyawan')
        .limit(3);

      if (barangData && karyawanData && barangData.length > 0 && karyawanData.length > 0) {
        // Add sample transactions
        const sampleTransactions = [
          {
            id_barang: barangData[0].id_barang,
            jumlah: 50,
            jenis: 'masuk' as const,
            keterangan: 'Pembelian stock awal'
          },
          {
            id_barang: barangData[1].id_barang,
            jumlah: 30,
            jenis: 'masuk' as const,
            keterangan: 'Pembelian stock tambahan'
          },
          {
            id_barang: barangData[0].id_barang,
            jumlah: 10,
            jenis: 'keluar_penjualan' as const,
            keterangan: 'Penjualan ke customer'
          },
          {
            id_barang: barangData[2].id_barang,
            jumlah: 25,
            jenis: 'keluar_produksi' as const,
            keterangan: 'Digunakan untuk produksi tabung'
          },
          {
            id_barang: barangData[1].id_barang,
            jumlah: 5,
            jenis: 'keluar_lainnya' as const,
            keterangan: 'Barang rusak/hilang'
          }
        ];

        const { error: transaksiError } = await supabase
          .from('transaksi')
          .insert(sampleTransactions);

        if (transaksiError) {
          console.error('Error inserting transaksi:', transaksiError);
        }

        // Add sample production data
        const sampleProduction = [
          {
            id_barang: barangData[0].id_barang,
            id_karyawan: karyawanData[0].id_karyawan,
            jumlah: 15,
            tanggal: new Date().toISOString()
          },
          {
            id_barang: barangData[1].id_barang,
            id_karyawan: karyawanData[1].id_karyawan,
            jumlah: 8,
            tanggal: new Date(Date.now() - 86400000).toISOString() // Yesterday
          }
        ];

        const { error: produksiError } = await supabase
          .from('produksi')
          .insert(sampleProduction);

        if (produksiError) {
          console.error('Error inserting produksi:', produksiError);
        }
      }

      toast.success('Data demo berhasil ditambahkan!', {
        description: 'Sistem siap digunakan dengan data contoh',
      });

    } catch (error) {
      console.error('Seeding error:', error);
      toast.error('Gagal menambahkan data demo', {
        description: error instanceof Error ? error.message : 'Terjadi kesalahan tak terduga'
      });
    } finally {
      setSeeding(false);
    }
  };

  const clearDatabase = async () => {
    try {
      setSeeding(true);
      toast.info('Menghapus semua data...', {
        description: 'Proses pembersihan database'
      });

      // Delete in order due to foreign key constraints
      await supabase.from('produksi').delete().neq('id_produksi', '');
      await supabase.from('transaksi').delete().neq('id_transaksi', '');
      await supabase.from('barang').delete().neq('id_barang', '');
      await supabase.from('karyawan').delete().neq('id_karyawan', '');

      toast.success('Database berhasil dibersihkan', {
        description: 'Semua data demo telah dihapus'
      });

    } catch (error) {
      console.error('Clear error:', error);
      toast.error('Gagal membersihkan database');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <Card variant="elevated" className="animate-fade-in-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          Data Demo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Tambahkan data contoh untuk melihat sistem bekerja dengan baik. 
          Data ini mencakup barang, karyawan, dan beberapa record produksi.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            variant="gradient"
            onClick={seedDatabase}
            loading={seeding}
            disabled={seeding}
            className="h-11"
          >
            {seeding ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Database className="h-4 w-4 mr-2" />
            )}
            Isi Data Demo
          </Button>
          
          <Button
            variant="outline"
            onClick={clearDatabase}
            loading={seeding}
            disabled={seeding}
            className="h-11"
          >
            {seeding ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Reset Database
          </Button>
        </div>

        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <strong>Data yang akan ditambahkan:</strong>
          <ul className="mt-1 space-y-1">
            <li>• 6 jenis barang (tabung gas, asesoris, bahan baku)</li>
            <li>• 5 karyawan dari berbagai divisi</li>
            <li>• 5 transaksi contoh (masuk/keluar)</li>
            <li>• 2 record produksi contoh</li>
            <li>• Beberapa item dengan stok menipis untuk demo peringatan</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataSeeder;