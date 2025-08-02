import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Tab {
  label: string;
  value: string;
  count?: number;
}

interface TabBarProps {
  tabs: Tab[];
  activeValue: string;
  onChange: (value: string) => void;
}

export default function TabBar({ tabs, activeValue, onChange }: TabBarProps) {
  return (
    <Tabs value={activeValue} onValueChange={onChange}>
      <TabsList className="grid w-full grid-cols-2" role="tablist">
        {tabs.map((tab) => (
          <TabsTrigger 
            key={tab.value} 
            value={tab.value}
            role="tab"
            aria-selected={activeValue === tab.value}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-2 text-xs text-muted-foreground">
                ({tab.count})
              </span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}