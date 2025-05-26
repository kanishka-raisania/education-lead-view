
import React from 'react';
import { BarChart3, Users, TrendingUp, XCircle } from 'lucide-react';

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabNavigation = ({ activeTab, setActiveTab }: TabNavigationProps) => {
  const tabs = [
    {
      id: 'overall-leads',
      label: 'Overall Leads',
      icon: BarChart3,
    },
    {
      id: 'counselor-performance',
      label: 'Counselor Performance',
      icon: Users,
    },
    {
      id: 'facebook-ads',
      label: 'Facebook Ads Analysis',
      icon: TrendingUp,
    },
    {
      id: 'lost-leads',
      label: 'Lost Leads',
      icon: XCircle,
    },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex space-x-0 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 px-4 py-4 text-sm font-medium whitespace-nowrap
                  border-b-2 transition-all duration-200 min-w-fit
                  ${
                    isActive
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">
                  {tab.label.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default TabNavigation;
