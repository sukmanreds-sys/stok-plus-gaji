import { Link, useLocation } from "react-router-dom";
import { Package, Users, TrendingUp, BarChart3, Coins, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/enhanced-button";

const Navigation = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

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
      name: "Transaksi",
      href: "/transactions",
      icon: ArrowUpDown,
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
    <nav className={cn(
      "bg-card border-r border-border min-h-screen flex flex-col transition-smooth relative",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className={cn("p-6 border-b border-border", isCollapsed && "p-4")}>
        {!isCollapsed && (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Stok Plus Gaji
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Sistem Manajemen Inventori
            </p>
          </div>
        )}
        {isCollapsed && (
          <div className="animate-fade-in">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-white" />
            </div>
          </div>
        )}
      </div>
      
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 h-6 w-6 rounded-full border shadow-medium bg-background hover:shadow-glow z-10"
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>
      
      {/* Navigation Items */}
      <div className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-smooth text-sm font-medium group relative overflow-hidden",
                "hover:scale-[1.02] active:scale-[0.98]",
                isActive
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
              style={{ 
                animationDelay: `${index * 100}ms`,
                animation: 'fade-in-up 0.6s ease-out both'
              }}
            >
              <Icon className={cn(
                "h-5 w-5 transition-smooth",
                isActive && "animate-pulse-glow"
              )} />
              {!isCollapsed && (
                <span className="transition-smooth">{item.name}</span>
              )}
              
              {/* Hover effect */}
              <div className={cn(
                "absolute inset-0 bg-gradient-primary opacity-0 transition-smooth rounded-lg",
                "group-hover:opacity-10"
              )} />
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className={cn("p-4 border-t border-border", isCollapsed && "px-2")}>
        {!isCollapsed && (
          <div className="text-xs text-muted-foreground text-center animate-fade-in">
            v1.0.0 • Made with ❤️
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;