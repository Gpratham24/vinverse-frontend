/**
 * Main Dashboard Page with tabs: Overview, Insights, Teams
 */
import { useState } from "react";
import { motion } from "framer-motion";
import InsightsTab from "../components/dashboard/InsightsTab";
import OverviewTab from "../components/dashboard/OverviewTab";

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "insights", label: "AI Insights", icon: "🧠" },
    { id: "teams", label: "Teams", icon: "👥" },
  ];

  return (
    <div className="min-h-screen pt-24 px-4 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
            Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-400">
            Your performance hub and gaming center
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="glass rounded-xl p-2 mb-6 border border-neon-purple/30 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[120px] px-2 sm:px-4 py-2 rounded-lg font-medium transition-all text-center text-sm sm:text-base ${
                activeTab === tab.id
                  ? "bg-neon-purple text-white"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <span className="mr-1 sm:mr-2">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "insights" && <InsightsTab />}
          {activeTab === "teams" && (
            <div className="glass rounded-xl p-6 border border-neon-purple/30">
              <h2 className="text-2xl font-semibold text-white mb-4">Teams</h2>
              <p className="text-gray-400">Team management coming soon...</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
