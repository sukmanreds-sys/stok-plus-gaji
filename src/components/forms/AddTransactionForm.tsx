import { useState, useEffect } from "react";
import { Button } from "@/components/ui/enhanced-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Item {
  id_barang: string;
  nama_barang: string;
  stok: number;
}

interface AddTransactionFormProps {
  onSuccess?: () => void;
}

const AddTransactionForm = ({ onSuccess }: AddTransactionFormProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [formData, setFormData] = useState({
    id_barang: "",
    jenis: "" as "masuk" | "keluar_produksi" | "keluar_penjualan" | "keluar_lainnya",
    jumlah: "",
    keterangan: ""
  });

  useEffect(() => {
    if (open) {
      fetchItems();
    }
  }, [open]);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('barang')
        .select('id_barang, nama_barang, stok')
        .order('nama_barang');

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error('Gagal memuat daftar barang');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.id_barang || !formData.jenis || !formData.jumlah) {
      toast.error("Field wajib harus diisi");
      return;
    }

    const jumlah = parseInt(formData.jumlah);
    if (jumlah <= 0) {
      toast.error("Jumlah harus lebih dari 0");
      return;
    }

    // Check stock for outgoing transactions
    if (formData.jenis !== 'masuk') {
      const selectedItem = items.find(item => item.id_barang === formData.id_barang);
      if (selectedItem && selectedItem.stok < jumlah) {
        toast.error(`Stok tidak mencukupi. Stok tersedia: ${selectedItem.stok}`);
        return;
      }
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('transaksi').insert([
        {
          id_barang: formData.id_barang,
          jenis: formData.jenis,
          jumlah: jumlah,
          keterangan: formData.keterangan || null,
          tanggal: new Date().toISOString()
        }
      ]);

      if (error) throw error;

      toast.success("Transaksi berhasil ditambahkan");
      setFormData({
        id_barang: "",
        jenis: "" as "masuk" | "keluar_produksi" | "keluar_penjualan" | "keluar_lainnya",
        jumlah: "",
        keterangan: ""
      });
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error("Gagal menambahkan transaksi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Transaksi
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Transaksi Baru</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="id_barang">Pilih Barang</Label>
            <Select value={formData.id_barang} onValueChange={(value) => setFormData({...formData, id_barang: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih barang" />
              </SelectTrigger>
              <SelectContent>
                {items.map((item) => (
                  <SelectItem key={item.id_barang} value={item.id_barang}>
                    {item.nama_barang} (Stok: {item.stok})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="jenis">Jenis Transaksi</Label>
            <Select value={formData.jenis} onValueChange={(value) => setFormData({...formData, jenis: value as typeof formData.jenis})}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis transaksi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="masuk">Barang Masuk</SelectItem>
                <SelectItem value="keluar_produksi">Keluar untuk Produksi</SelectItem>
                <SelectItem value="keluar_penjualan">Keluar untuk Penjualan</SelectItem>
                <SelectItem value="keluar_lainnya">Keluar Lainnya</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="jumlah">Jumlah</Label>
            <Input
              id="jumlah"
              type="number"
              value={formData.jumlah}
              onChange={(e) => setFormData({...formData, jumlah: e.target.value})}
              placeholder="0"
              min="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keterangan">Keterangan (Opsional)</Label>
            <Textarea
              id="keterangan"
              value={formData.keterangan}
              onChange={(e) => setFormData({...formData, keterangan: e.target.value})}
              placeholder="Masukkan keterangan transaksi"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Batal
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              Tambah Transaksi
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTransactionForm;