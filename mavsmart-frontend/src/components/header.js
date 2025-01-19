// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-[#0064b1] p-4 text-white">
      <nav className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-semibold"><Link to="/">MavsMart</Link></h1>
        <ul className="flex space-x-4">
          <li><Link to="/" className="hover:text-gray-200">Home</Link></li>
          <li><Link to="/login" className="hover:text-gray-200">Login</Link></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
