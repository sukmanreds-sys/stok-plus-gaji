import { useState } from "react";
import { Button } from "@/components/ui/enhanced-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AddEmployeeFormProps {
  onSuccess?: () => void;
}

const AddEmployeeForm = ({ onSuccess }: AddEmployeeFormProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    divisi: "" as "tabung" | "asesoris" | "packing"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nama || !formData.divisi) {
      toast.error("Semua field harus diisi");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('karyawan').insert([
        {
          nama: formData.nama,
          divisi: formData.divisi
        }
      ]);

      if (error) throw error;

      toast.success("Karyawan berhasil ditambahkan");
      setFormData({
        nama: "",
        divisi: "" as "tabung" | "asesoris" | "packing"
      });
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error adding employee:', error);
      toast.error("Gagal menambahkan karyawan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Karyawan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Karyawan Baru</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama">Nama Lengkap</Label>
            <Input
              id="nama"
              value={formData.nama}
              onChange={(e) => setFormData({...formData, nama: e.target.value})}
              placeholder="Masukkan nama lengkap"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="divisi">Divisi</Label>
            <Select value={formData.divisi} onValueChange={(value) => setFormData({...formData, divisi: value as "tabung" | "asesoris" | "packing"})}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih divisi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tabung">Divisi Tabung</SelectItem>
                <SelectItem value="asesoris">Divisi Asesoris</SelectItem>
                <SelectItem value="packing">Divisi Packing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Batal
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              Tambah Karyawan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployeeForm;