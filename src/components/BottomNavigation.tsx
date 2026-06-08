/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, Soup, Calendar, Flame, Settings, LineChart, Sparkles } from 'lucide-react';

interface NavigationProps {
  currentTab: string;
  onChangeTab: (tab: string) => void;
  streak: number;
}

export const BottomNavigation: React.FC<NavigationProps> = ({ currentTab, onChangeTab, streak }) => {
  const tabs = [
    { id: 'dashboard', label: 'Core', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'diet', label: 'Diet', icon: <Soup className="w-5 h-5" /> },
    { id: 'calendar', label: 'Habit', icon: <Calendar className="w-5 h-5" /> },
    { id: 'copilot', label: 'AI Coach', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'hair', label: 'Scalp', icon: <Flame className="w-5 h-5" /> },
    { id: 'insights', label: 'Trends', icon: <LineChart className="w-5 h-5" /> },
    { id: 'settings', label: 'Setup', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div id="nav-container" className="fixed bottom-0 left-0 right-0 py-2.5 px-3 bg-[#FFFDF7] dark:bg-[#0F172A] border-t-4 border-[#1E293B] dark:border-[#475569] z-40 shadow-[0_-6px_0_0_#1E293B] dark:shadow-[0_-6px_0_0_#0A0F1C]">
      <div className="max-w-2xl mx-auto flex justify-around items-center bg-white dark:bg-[#1E293B] border-4 border-[#1E293B] dark:border-[#475569] p-1.5 rounded-2xl shadow-[4px_4px_0px_0px_#1E293B] dark:shadow-[4px_4px_0px_0px_#0A0F1C]">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex items-center justify-center p-2.5 rounded-xl transition-all cursor-pointer ${
                isActive 
                  ? 'text-[#0057FF] dark:text-[#4D8DFF] scale-110 font-black' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-[#16213E] dark:hover:text-[#F8FAFC]'
              }`}
              title={tab.label}
            >
              <div className="absolute -top-1 -right-1" />
              {isActive && (
                <motion.div
                  layoutId="activeNavIndicator"
                  className="absolute inset-0 bg-[#E0DCFF] dark:bg-[#202E5C] border-2 border-[#1E293B] dark:border-[#475569] rounded-xl -z-10"
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                />
              )}
              {tab.id === 'hair' && streak > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FB7185]" />
              )}
              {tab.icon}
            </button>
          );
        })}
      </div>
    </div>
  );
};
