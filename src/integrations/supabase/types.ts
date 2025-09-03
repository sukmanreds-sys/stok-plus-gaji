export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      barang: {
        Row: {
          created_at: string
          harga: number
          id_barang: string
          jenis: Database["public"]["Enums"]["jenis_barang"]
          nama_barang: string
          stok: number
          stok_minimum: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          harga?: number
          id_barang?: string
          jenis: Database["public"]["Enums"]["jenis_barang"]
          nama_barang: string
          stok?: number
          stok_minimum?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          harga?: number
          id_barang?: string
          jenis?: Database["public"]["Enums"]["jenis_barang"]
          nama_barang?: string
          stok?: number
          stok_minimum?: number
          updated_at?: string
        }
        Relationships: []
      }
      karyawan: {
        Row: {
          created_at: string
          divisi: Database["public"]["Enums"]["divisi_karyawan"]
          id_karyawan: string
          nama: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          divisi: Database["public"]["Enums"]["divisi_karyawan"]
          id_karyawan?: string
          nama: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          divisi?: Database["public"]["Enums"]["divisi_karyawan"]
          id_karyawan?: string
          nama?: string
          updated_at?: string
        }
        Relationships: []
      }
      produksi: {
        Row: {
          created_at: string
          id_barang: string
          id_karyawan: string
          id_produksi: string
          jumlah: number
          tanggal: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id_barang: string
          id_karyawan: string
          id_produksi?: string
          jumlah: number
          tanggal?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id_barang?: string
          id_karyawan?: string
          id_produksi?: string
          jumlah?: number
          tanggal?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "produksi_id_barang_fkey"
            columns: ["id_barang"]
            isOneToOne: false
            referencedRelation: "barang"
            referencedColumns: ["id_barang"]
          },
          {
            foreignKeyName: "produksi_id_karyawan_fkey"
            columns: ["id_karyawan"]
            isOneToOne: false
            referencedRelation: "karyawan"
            referencedColumns: ["id_karyawan"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          divisi: Database["public"]["Enums"]["divisi_karyawan"] | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          divisi?: Database["public"]["Enums"]["divisi_karyawan"] | null
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          divisi?: Database["public"]["Enums"]["divisi_karyawan"] | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      transaksi: {
        Row: {
          created_at: string
          id_barang: string
          id_transaksi: string
          jenis: Database["public"]["Enums"]["jenis_transaksi"] | null
          jumlah: number
          keterangan: string | null
          tanggal: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id_barang: string
          id_transaksi?: string
          jenis?: Database["public"]["Enums"]["jenis_transaksi"] | null
          jumlah: number
          keterangan?: string | null
          tanggal?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id_barang?: string
          id_transaksi?: string
          jenis?: Database["public"]["Enums"]["jenis_transaksi"] | null
          jumlah?: number
          keterangan?: string | null
          tanggal?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaksi_id_barang_fkey"
            columns: ["id_barang"]
            isOneToOne: false
            referencedRelation: "barang"
            referencedColumns: ["id_barang"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_divisi: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["divisi_karyawan"]
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_manager_or_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      divisi_karyawan: "tabung" | "asesoris" | "packing"
      jenis_barang: "bahan_baku" | "barang_jadi"
      jenis_transaksi:
        | "masuk"
        | "keluar_produksi"
        | "keluar_penjualan"
        | "keluar_lainnya"
      user_role: "admin" | "manager" | "employee"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      divisi_karyawan: ["tabung", "asesoris", "packing"],
      jenis_barang: ["bahan_baku", "barang_jadi"],
      jenis_transaksi: [
        "masuk",
        "keluar_produksi",
        "keluar_penjualan",
        "keluar_lainnya",
      ],
      user_role: ["admin", "manager", "employee"],
    },
  },
} as const
