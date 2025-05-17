import { useState, useEffect } from "react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { setLanguage, getLanguage } from "@/lib/i18n";

export default function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState<'en' | 'kn'>(getLanguage());
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLanguageChange = (lang: 'en' | 'kn') => {
    setLanguage(lang);
    setCurrentLang(lang);
    
    // Force a re-render of the app to update all translations
    window.location.reload();
  };

  if (!mounted) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="h-5 w-5" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => handleLanguageChange('en')}
          className={currentLang === 'en' ? 'bg-accent-50 text-accent-500' : ''}
        >
          <span className="mr-2">🇬🇧</span>
          <span>English</span>
          {currentLang === 'en' && (
            <svg className="ml-2 h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12L10 17L19 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleLanguageChange('kn')}
          className={currentLang === 'kn' ? 'bg-accent-50 text-accent-500' : ''}
        >
          <span className="mr-2">🇮🇳</span>
          <span className="font-kannada">ಕನ್ನಡ</span>
          {currentLang === 'kn' && (
            <svg className="ml-2 h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12L10 17L19 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
