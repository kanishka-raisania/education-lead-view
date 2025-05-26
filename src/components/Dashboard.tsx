
import React, { useState } from 'react';
import NavigationHeader from './NavigationHeader';
import TabNavigation from './TabNavigation';
import OverallLeads from './tabs/OverallLeads';
import CounselorPerformance from './tabs/CounselorPerformance';
import FacebookAdsAnalysis from './tabs/FacebookAdsAnalysis';
import LostLeads from './tabs/LostLeads';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overall-leads');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overall-leads':
        return <OverallLeads />;
      case 'counselor-performance':
        return <CounselorPerformance />;
      case 'facebook-ads':
        return <FacebookAdsAnalysis />;
      case 'lost-leads':
        return <LostLeads />;
      default:
        return <OverallLeads />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationHeader />
      <div className="pt-16">
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="container mx-auto px-4 py-6">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
