-- Fix RLS policies to allow data insertion without authentication for demo purposes
-- This will allow the application to work immediately

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "All authenticated can manage barang" ON public.barang;
DROP POLICY IF EXISTS "All authenticated can manage karyawan" ON public.karyawan;
DROP POLICY IF EXISTS "All authenticated can manage produksi" ON public.produksi;
DROP POLICY IF EXISTS "All authenticated can manage transaksi" ON public.transaksi;

-- Create permissive policies that allow all operations
CREATE POLICY "Allow all operations on barang" 
ON public.barang 
FOR ALL 
TO public
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations on karyawan" 
ON public.karyawan 
FOR ALL 
TO public
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations on produksi" 
ON public.produksi 
FOR ALL 
TO public
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations on transaksi" 
ON public.transaksi 
FOR ALL 
TO public
USING (true) 
WITH CHECK (true);