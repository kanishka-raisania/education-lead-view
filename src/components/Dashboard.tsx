
import React, { useState } from 'react';
import NavigationHeader from './NavigationHeader';
import TabNavigation from './TabNavigation';
import OverallLeads from './tabs/OverallLeads';
import CounselorPerformance from './tabs/CounselorPerformance';
import FacebookAdsAnalysis from './tabs/FacebookAdsAnalysis';
import LostLeads from './tabs/LostLeads';

interface LeadData {
  status: string;
  'Lost Reason': string;
  'Assignee Name': string;
  'Assignee Email': string;
  Name: string;
  Phone: string;
  Email: string;
  City: string;
  'Fb Campaign': string;
  'Fb Lead ID': string;
  'Facebook Ad': string;
  'Student Preference': string;
  'Created On': string;
  'Modified On': string;
  'Batch Names': string;
  parsedDate?: Date;
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overall-leads');
  const [sharedLeadsData, setSharedLeadsData] = useState<LeadData[]>([]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overall-leads':
        return <OverallLeads sharedLeadsData={sharedLeadsData} setSharedLeadsData={setSharedLeadsData} />;
      case 'counselor-performance':
        return <CounselorPerformance sharedLeadsData={sharedLeadsData} />;
      case 'facebook-ads':
        return <FacebookAdsAnalysis sharedLeadsData={sharedLeadsData} />;
      case 'lost-leads':
        return <LostLeads sharedLeadsData={sharedLeadsData} />;
      default:
        return <OverallLeads sharedLeadsData={sharedLeadsData} setSharedLeadsData={setSharedLeadsData} />;
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
