import { Link, useLocation } from "react-router-dom";
import { Package, Users, TrendingUp, BarChart3, Coins } from "lucide-react";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: BarChart3,
    },
    {
      name: "Stok Barang",
      href: "/stock",
      icon: Package,
    },
    {
      name: "Rekap Produksi",
      href: "/production",
      icon: TrendingUp,
    },
    {
      name: "Karyawan",
      href: "/employees",
      icon: Users,
    },
    {
      name: "Nilai Aset",
      href: "/assets",
      icon: Coins,
    },
  ];

  return (
    <nav className="bg-card border-r border-border min-h-screen w-64 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Stok Plus Gaji
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Sistem Manajemen Inventori
        </p>
      </div>
      
      <div className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-smooth text-sm font-medium",
                isActive
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;