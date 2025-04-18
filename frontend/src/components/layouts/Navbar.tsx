import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiMoon, FiSun, FiUser } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext'; 

interface NavbarProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Navbar = ({ darkMode, toggleDarkMode }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { state } = useAuth();
  const user = state.user;
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 60) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

 return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white dark:bg-gray-900 shadow-md py-4' : `bg-transparent ${user ? 'lg:py-1' : 'lg:py-3'} py-4`}`}>
      <div className="container flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <span className="text-xl font-bold text-primary">Varad Vinayak <span className="text-accent">Chinese</span></span>
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8 ">
          <Link 
            to="/" 
            className={`${isActive('/') ? 'text-primary font-medium' : 'text-gray-700 dark:text-gray-300'} hover:text-primary transition-colors`}
          >
            Home
          </Link>
          <Link 
            to="/menu" 
            className={`${isActive('/menu') ? 'text-primary font-medium' : 'text-gray-700 dark:text-gray-300'} hover:text-primary transition-colors`}
          >
            Menu
          </Link>
          <Link 
            to="/about" 
            className={`${isActive('/about') ? 'text-primary font-medium' : 'text-gray-700 dark:text-gray-300'} hover:text-primary transition-colors`}
          >
            About
          </Link>
          <Link 
            to="/contact" 
            className={`${isActive('/contact') ? 'text-primary font-medium' : 'text-gray-700 dark:text-gray-300'} hover:text-primary transition-colors`}
          >
            Contact
          </Link>
        </div>
        
        {/* Right Menu for Desktop */}
       <div className="hidden md:flex items-center space-x-4">
          {/* Conditionally show admin panel button if the user is an admin */}
          {user && user.isAdmin && (
            <Link 
              to="/admin" 
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="text-gray-700 dark:text-gray-300">Admin Panel</span>
            </Link>
          )}
          <button 
            onClick={toggleDarkMode} 
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {darkMode ? <FiSun className="text-yellow-400" /> : <FiMoon />}
          </button>
          
          {user && user.profilePicture ? (
            <Link 
              to="/profile" 
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <img
                src={user.profilePicture}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover"
              />
            </Link>
          ) : (
            <Link 
              to="/login" 
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <FiUser size={24} />
              <span className="text-gray-700 dark:text-gray-300">Log in</span>
            </Link>
          )}
          
          <Link 
            to="/payment" 
            className="btn btn-primary"
          >
           Pay your bill
          </Link>
        </div>
        
        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center space-x-4">
          <button 
            onClick={toggleDarkMode} 
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {darkMode ? <FiSun className="text-yellow-400" /> : <FiMoon />}
          </button>
          
          <button
            onClick={toggleMenu}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {isOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div 
        className={`fixed inset-0 bg-white dark:bg-gray-900 z-40 transition-transform duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } md:hidden flex flex-col pt-20 px-6`}
      >
        {/* Close Button at Top Right */}
        <button 
         title='Close Menu'
          onClick={toggleMenu}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <FiX size={24} />
        </button>
        <Link 
          to="/" 
          className={`py-4 text-lg ${isActive('/') ? 'text-primary font-medium' : 'text-gray-700 dark:text-gray-300'} border-b border-gray-100 dark:border-gray-800`}
          onClick={toggleMenu}
        >
          Home
        </Link>
        <Link 
          to="/menu" 
          className={`py-4 text-lg ${isActive('/menu') ? 'text-primary font-medium' : 'text-gray-700 dark:text-gray-300'} border-b border-gray-100 dark:border-gray-800`}
          onClick={toggleMenu}
        >
          Menu
        </Link>
        <Link 
          to="/about" 
          className={`py-4 text-lg ${isActive('/about') ? 'text-primary font-medium' : 'text-gray-700 dark:text-gray-300'} border-b border-gray-100 dark:border-gray-800`}
          onClick={toggleMenu}
        >
          About
        </Link>
        <Link 
          to="/contact" 
          className={`py-4 text-lg ${isActive('/contact') ? 'text-primary font-medium' : 'text-gray-700 dark:text-gray-300'} border-b border-gray-100 dark:border-gray-800`}
          onClick={toggleMenu}
        >
          Contact
        </Link>
        <div className="navbar-profile my-4">
          {user && user.profilePicture ? (
          <Link 
            to="/profile" 
            onClick={toggleMenu}
            className="flex items-center gap-4 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
           >
            <span className="text-gray-700 text-lg dark:text-gray-300">Profile</span>
            <img
              src={user.profilePicture}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover"
            />

          </Link>
          ) : (
            <Link 
              to="/login" 
              onClick={toggleMenu}
              className="flex items-center gap-4 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
             >
              <span className="text-gray-700 text-lg dark:text-gray-300">Log in/ Sign in</span>
              <FiUser size={24} />
            </Link>
          )}
       </div>
        {user && user.isAdmin && (
          <Link 
            to="/admin" 
            onClick={toggleMenu}
            className="w-full mt-6 text-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
          >
            Admin Panel
          </Link>
        )}
        <Link 
          to="/payment" 
          className="btn btn-primary mt-6 text-center"
          onClick={toggleMenu}
        >
          Pay your bill
       </Link>
        {user && (
          <button 
            onClick={() => {
              // Add your logout logic here
              // For example, clear auth tokens and navigate to login page
              localStorage.removeItem('auth_token');
              toggleMenu();
              window.location.reload();
            }}
            className="w-full mt-6 text-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;