import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Book, 
  User, 
  BellRing, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import Footer from "@/components/common/Footer";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import { useAuth } from "../../hooks/useAuth";
import { t } from "@/lib/i18n";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Create navigation links based on user type
  const getNavLinks = () => {
    const baseLinks = [
      { 
        href: "/dashboard", 
        label: t("dashboard"), 
        icon: <LayoutDashboard className="h-5 w-5" />,
        showFor: ["student", "school", "authority"]
      },
      { 
        href: "/complaints", 
        label: t("complaints"), 
        icon: <FileText className="h-5 w-5" />,
        showFor: ["student", "school", "authority"]
      },
      { 
        href: "/alumni-connect", 
        label: t("alumniConnect"), 
        icon: <Users className="h-5 w-5" />,
        showFor: ["student"] // Only show for students
      },
      { 
        href: "/resources", 
        label: t("resources"), 
        icon: <Book className="h-5 w-5" />,
        showFor: ["student", "school", "authority"]
      },
    ];
    
    return baseLinks.filter(link => link.showFor.includes(user?.userType || ""));
  };
  
  const navLinks = getNavLinks();

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/dashboard">
                  <h1 className="text-xl font-bold cursor-pointer font-poppins">
                    <span className="text-primary-500">Edu</span>
                    <span className="text-secondary-500">Audit</span>
                  </h1>
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <a className={`
                      inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium
                      ${location === link.href 
                        ? 'border-accent-500 text-neutral-900' 
                        : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700'}
                    `}>
                      {link.label}
                    </a>
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <BellRing className="h-5 w-5" />
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-secondary-500 ring-2 ring-white"></span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuItem>
                    Your complaint has been reviewed
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    New response to your alumni query
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative rounded-full">
                    <Avatar>
                      <AvatarImage 
                        src={user?.profilePicture} 
                        alt={user?.name || "User profile"} 
                      />
                      <AvatarFallback>
                        {user?.name ? getInitials(user.name) : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {user?.name}
                    <p className="text-xs text-muted-foreground mt-1">
                      {user?.userType === "student" 
                        ? t("student") 
                        : user?.userType === "school" 
                          ? t("schoolAdmin") 
                          : t("authority")}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <a className="flex cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>{t("profile")}</span>
                      </a>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-500 focus:text-red-500" 
                    onClick={() => logout()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t("logout")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile menu button */}
              <div className="sm:hidden">
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[80%] sm:w-[385px]">
                    <div className="flex flex-col h-full">
                      <div className="flex items-center justify-between py-4">
                        <div className="flex-shrink-0 flex items-center">
                          <h1 className="text-xl font-bold cursor-pointer font-poppins">
                            <span className="text-primary-500">Edu</span>
                            <span className="text-secondary-500">Audit</span>
                          </h1>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                      
                      <div className="flex flex-col space-y-1 mt-4">
                        {navLinks.map((link) => (
                          <Link key={link.href} href={link.href}>
                            <a 
                              className={`
                                flex items-center px-4 py-3 text-base font-medium rounded-md
                                ${location === link.href 
                                  ? 'bg-accent-50 text-accent-500' 
                                  : 'text-neutral-700 hover:bg-neutral-100'}
                              `}
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {link.icon}
                              <span className="ml-3">{link.label}</span>
                            </a>
                          </Link>
                        ))}

                        <Link href="/profile">
                          <a 
                            className="flex items-center px-4 py-3 text-base font-medium rounded-md text-neutral-700 hover:bg-neutral-100"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <User className="h-5 w-5" />
                            <span className="ml-3">{t("profile")}</span>
                          </a>
                        </Link>
                      </div>

                      <div className="mt-auto pt-4 border-t border-neutral-200">
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => {
                            logout();
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <LogOut className="mr-2 h-5 w-5" />
                          <span>{t("logout")}</span>
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 bg-neutral-50">
        {children}
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile bottom navigation */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 bg-white border-t border-neutral-200 z-10">
        <div className="grid grid-cols-4 h-16">
          {navLinks.map((link, index) => (
            <Link key={index} href={link.href}>
              <a className={`
                flex flex-col items-center justify-center
                ${location === link.href ? 'text-accent-500' : 'text-neutral-400 hover:text-neutral-500'}
              `}>
                {link.icon}
                <span className="text-xs mt-1">{link.label}</span>
              </a>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
