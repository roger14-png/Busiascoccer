import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TeamsScreen from '../screens/TeamsScreen';

const Tab = createBottomTabNavigator();

const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Teams" component={TeamsScreen} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
