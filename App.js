import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import * as Notifications from "expo-notifications"
import { Platform } from "react-native"
import { useEffect } from "react"

const Stack = createStackNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const requestPermissions = async () => {
  if (Platform.OS === 'ios') {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('Notification permissions are required for timer alerts!');
    }
  }
};


export default function App() {
  useEffect(() => {
    requestPermissions();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Timers" component={HomeScreen} />
        {/* Add more screens like Settings here */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
