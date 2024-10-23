import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Timers" component={HomeScreen} />
        {/* Add more screens like Settings here */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
