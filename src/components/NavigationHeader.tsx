
import React from 'react';
import { GraduationCap } from 'lucide-react';
import UserMenu from '@/components/auth/UserMenu';

const NavigationHeader = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 border-b border-gray-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              Help Study Abroad - Lead Dashboard
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="hidden md:inline text-sm text-gray-600">Welcome back!</span>
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavigationHeader;
