"use client";

import { useState } from "react";
import { Bell, Lock, Palette } from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { SecuritySettings } from "@/components/settings/security-settings";
import { AppearanceSettings } from "@/components/settings/appearance-settings";
import { cn } from "@/lib/utils";

type TabKey = "notifications" | "security" | "appearance";

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  {
    key: "notifications",
    label: "Notifications",
    icon: <Bell className="h-4 w-4" />,
  },
  {
    key: "security",
    label: "Sécurité",
    icon: <Lock className="h-4 w-4" />,
  },
  {
    key: "appearance",
    label: "Apparence",
    icon: <Palette className="h-4 w-4" />,
  },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("notifications");

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <PageHeader
        title="Paramètres"
        description="Personnalisez votre expérience SUSTPA"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Paramètres" },
        ]}
      />

      {/* Onglets */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === tab.key
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700",
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu */}
      <div className="animate-fade-in">
        {activeTab === "notifications" && <NotificationSettings />}
        {activeTab === "security" && <SecuritySettings />}
        {activeTab === "appearance" && <AppearanceSettings />}
      </div>
    </div>
  );
}
