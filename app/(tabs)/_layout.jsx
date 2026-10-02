import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown:          false,
      tabBarActiveTintColor:   '#2D9596',
      tabBarInactiveTintColor: '#5B7A9D',
      tabBarStyle: {
        backgroundColor: '#FFFFFF',
        borderTopColor:  '#CDEDFF',
        borderTopWidth:   1,
      },
    }}>
      <Tabs.Screen name="home"     options={{ title: '🏠 Home'    }} />
      <Tabs.Screen name="battle"   options={{ title: '⚔️ Battle'  }} />
      <Tabs.Screen name="words"  options={{ title: '📜 Library' }} />
      <Tabs.Screen name="progress" options={{ title: '📊 Progress'}} />
      <Tabs.Screen name="words"    options={{ title: '📚 Words'   }} />
      <Tabs.Screen name="profile"  options={{ title: '👤 Profile' }} />
    </Tabs>
  );
}