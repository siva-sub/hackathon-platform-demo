
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';
import { Icons } from '../../constants';
import Button from '../ui/Button';

const Navbar: React.FC = () => {
  const { currentUser, setCurrentUser, theme, toggleTheme } = useAppContext();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    setCurrentUser(null, null);
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const NavLink: React.FC<{
    to: string;
    children: React.ReactNode;
    className?: string;
    isMobile?: boolean;
    isDesktop?: boolean;
    icon?: React.ReactNode;
  }> = ({ to, children, className, isMobile, isDesktop, icon }) => (
    <Link
      to={to}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150
                  ${isMobile ? 'block w-full text-left text-base py-3' : ''}
                  ${isDesktop ? 'inline-flex items-center' : ''}
                  text-neutral-100 hover:bg-primary-600 dark:text-neutral-200 dark:hover:bg-primary-700 ${className}`}
      onClick={() => setIsMobileMenuOpen(false)}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </Link>
  );

  return (
    <nav className="bg-primary-700 dark:bg-primary-800 shadow-lg sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left Zone: Logo and Title */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-white text-xl sm:text-2xl font-bold flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
              <Icons.Trophy />
              <span className="ml-2 hidden sm:inline">Hackathon Platform</span>
              <span className="ml-2 sm:hidden">HP</span>
            </Link>
          </div>

          {/* Center Zone: Desktop Navigation Links */}
          <div className="hidden md:flex flex-grow justify-center items-center space-x-1 lg:space-x-2">
            {!currentUser?.role && (
              <NavLink to="/public-events" isDesktop icon={<Icons.GlobeAlt />}>
                Public Events
              </NavLink>
            )}
            {currentUser?.role === 'admin' && <NavLink to="/admin" isDesktop icon={<Icons.Cog/>}>Admin Home</NavLink>}
            {currentUser?.role === 'participant' && <NavLink to="/participant" isDesktop icon={<Icons.UserGroup/>}>Participant Hub</NavLink>}
            {currentUser?.role === 'judge' && <NavLink to="/judge" isDesktop icon={<Icons.AcademicCap/>}>Judge Home</NavLink>}
            {currentUser?.role === 'superadmin' && <NavLink to="/superadmin" isDesktop icon={<Icons.ShieldCheck/>}>Super Admin</NavLink>}
          </div>

          {/* Right Zone: Actions (User Info, Logout, Theme Toggle, Mobile Menu Button) */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {currentUser?.email && currentUser.role !== 'superadmin' && (
              <span className="hidden lg:inline text-xs text-primary-300 dark:text-primary-400 truncate max-w-[120px] xl:max-w-[180px]">
                ({currentUser.email})
              </span>
            )}
            {currentUser?.role && (
              <Button onClick={handleLogout} variant="secondary" size="sm" className="hidden md:inline-flex">
                Logout
              </Button>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-neutral-100 dark:text-neutral-200 hover:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Icons.Sun /> : <Icons.Moon />}
            </button>
            <div className="md:hidden"> {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-md text-neutral-100 dark:text-neutral-200 hover:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? <Icons.X /> : <Icons.Menu />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'} absolute top-16 left-0 right-0 bg-primary-700 dark:bg-primary-800 shadow-lg z-30 pb-3 border-t border-primary-600 dark:border-primary-700`} id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {!currentUser?.role && (
            <NavLink to="/public-events" isMobile icon={<Icons.GlobeAlt />}>
              Public Events
            </NavLink>
          )}
          {currentUser?.role === 'admin' && <NavLink to="/admin" isMobile icon={<Icons.Cog/>}>Admin Home</NavLink>}
          {currentUser?.role === 'participant' && <NavLink to="/participant" isMobile icon={<Icons.UserGroup/>}>Participant Hub</NavLink>}
          {currentUser?.role === 'judge' && <NavLink to="/judge" isMobile icon={<Icons.AcademicCap/>}>Judge Home</NavLink>}
          {currentUser?.role === 'superadmin' && <NavLink to="/superadmin" isMobile icon={<Icons.ShieldCheck/>}>Super Admin</NavLink>}

          {currentUser?.email && (
            <div className="px-3 py-3 border-t border-primary-600 dark:border-primary-700 mt-2 pt-3 space-y-2">
              {currentUser.role !== 'superadmin' && (
                <p className="text-xs text-primary-300 dark:text-primary-400 truncate">
                    Logged in as: {currentUser.email}
                </p>
              )}
              <Button onClick={handleLogout} variant="secondary" size="sm" className="w-full">
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
