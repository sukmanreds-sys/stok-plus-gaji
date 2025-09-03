import { useState } from "react";
import { Button } from "@/components/ui/enhanced-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AddStockFormProps {
  onSuccess?: () => void;
}

const AddStockForm = ({ onSuccess }: AddStockFormProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama_barang: "",
    jenis: "" as "bahan_baku" | "barang_jadi",
    stok: "",
    stok_minimum: "",
    harga: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nama_barang || !formData.jenis || !formData.stok || !formData.stok_minimum || !formData.harga) {
      toast.error("Semua field harus diisi");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('barang').insert([
        {
          nama_barang: formData.nama_barang,
          jenis: formData.jenis,
          stok: parseInt(formData.stok),
          stok_minimum: parseInt(formData.stok_minimum),
          harga: parseFloat(formData.harga)
        }
      ]);

      if (error) throw error;

      toast.success("Barang berhasil ditambahkan");
      setFormData({
        nama_barang: "",
        jenis: "" as "bahan_baku" | "barang_jadi",
        stok: "",
        stok_minimum: "",
        harga: ""
      });
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error("Gagal menambahkan barang");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Barang
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Barang Baru</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama_barang">Nama Barang</Label>
            <Input
              id="nama_barang"
              value={formData.nama_barang}
              onChange={(e) => setFormData({...formData, nama_barang: e.target.value})}
              placeholder="Masukkan nama barang"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="jenis">Jenis Barang</Label>
            <Select value={formData.jenis} onValueChange={(value) => setFormData({...formData, jenis: value as "bahan_baku" | "barang_jadi"})}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis barang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bahan_baku">Bahan Baku</SelectItem>
                <SelectItem value="barang_jadi">Barang Jadi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stok">Stok Awal</Label>
              <Input
                id="stok"
                type="number"
                value={formData.stok}
                onChange={(e) => setFormData({...formData, stok: e.target.value})}
                placeholder="0"
                min="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="stok_minimum">Stok Minimum</Label>
              <Input
                id="stok_minimum"
                type="number"
                value={formData.stok_minimum}
                onChange={(e) => setFormData({...formData, stok_minimum: e.target.value})}
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="harga">Harga (Rp)</Label>
            <Input
              id="harga"
              type="number"
              value={formData.harga}
              onChange={(e) => setFormData({...formData, harga: e.target.value})}
              placeholder="0"
              min="0"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Batal
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              Tambah Barang
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddStockForm;