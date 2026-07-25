import React from 'react';
import { Tabs } from 'expo-router';
import BottomBar, { BottomBarTab } from '../../components/ui/bottom-bar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => {
        // Map current route name to BottomBarTab
        const routeName = props.state.routes[props.state.index].name;
        let activeTab: BottomBarTab = 'explore';
        if (routeName === 'explore') activeTab = 'explore';
        else if (routeName === 'map') activeTab = 'map';
        else if (routeName === 'generator') activeTab = 'ai';
        else if (routeName === 'community') activeTab = 'community';
        else if (routeName === 'profile') activeTab = 'profile';

        const handleTabPress = (tab: BottomBarTab) => {
          let targetRoute = 'explore';
          if (tab === 'explore') targetRoute = 'explore';
          else if (tab === 'map') targetRoute = 'map';
          else if (tab === 'ai') targetRoute = 'generator';
          else if (tab === 'community') targetRoute = 'community';
          else if (tab === 'profile') targetRoute = 'profile';

          props.navigation.navigate(targetRoute);
        };

        return (
          <BottomBar activeTab={activeTab} onTabPress={handleTabPress} />
        );
      }}
      screenOptions={{ 
        headerShown: false,
        // Disable default tab bar
      }}
    >
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="map" />
      <Tabs.Screen name="generator" />
      <Tabs.Screen name="community" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
