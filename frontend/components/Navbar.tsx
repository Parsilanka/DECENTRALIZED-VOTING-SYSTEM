"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet } from '@/context/WalletContext';
import { 
  Vote, 
  LayoutDashboard, 
  User, 
  Wallet, 
  Moon, 
  Sun,
  Menu,
  X,
  ShieldCheck,
  LogIn,
  LogOut,
  Trophy
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const { 
    address, 
    isAdmin, 
    isLoggedIn, 
    connect, 
    disconnect, 
    loginSIWE, 
    logout, 
    loading 
  } = useWallet();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const navLinks = [
    { name: 'Home', href: '/', icon: Vote },
    { name: 'Results', href: '/results', icon: Trophy },
  ];

  if (isLoggedIn) {
     navLinks.push({ name: 'Profile', href: '/profile', icon: User });
     if (isAdmin) {
       navLinks.push({ name: 'Admin', href: '/admin', icon: LayoutDashboard });
     }
  }

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition">
              <Vote className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              VoteChain
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${
                    pathname === link.href ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

            <div className="flex items-center gap-4">
              <button 
                onClick={toggleDarkMode}
                className="p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-full transition"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {address ? (
                <div className="flex items-center gap-3">
                   {!isLoggedIn ? (
                     <button
                       onClick={loginSIWE}
                       className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold shadow-lg transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
                       disabled={loading}
                     >
                       <LogIn className="w-4 h-4" />
                       {loading ? 'Verifying...' : 'Sign In'}
                     </button>
                   ) : (
                     <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-bold border border-green-100 dark:border-green-800">
                           <ShieldCheck className="w-4 h-4" />
                           {address.slice(0, 6)}...
                        </div>
                        <button 
                          onClick={logout}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition"
                          title="Logout Session"
                        >
                          <LogOut className="w-5 h-5" />
                        </button>
                     </div>
                   )}
                   <button 
                     onClick={disconnect}
                     className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition"
                     title="Disconnect Wallet"
                   >
                     <X className="w-5 h-5" />
                   </button>
                </div>
              ) : (
                <button
                  onClick={connect}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold shadow-lg hover:shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                  disabled={loading}
                >
                  <Wallet className="w-4 h-4" />
                  {loading ? 'Connecting...' : 'Connect'}
                </button>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
             <button 
                onClick={toggleDarkMode}
                className="p-2 text-gray-500 rounded-full"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-gray-600 dark:text-gray-400"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t dark:border-gray-800 p-4 space-y-4">
           {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center gap-3 p-3 rounded-xl transition ${
                pathname === link.href ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <link.icon className="w-5 h-5" />
              <span className="font-medium">{link.name}</span>
            </Link>
          ))}
          {!address && (
              <button
                onClick={() => {
                  connect();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-xl font-bold"
              >
                <Wallet className="w-5 h-5" />
                Connect Wallet
              </button>
          )}
        </div>
      )}
    </nav>
  );
}
