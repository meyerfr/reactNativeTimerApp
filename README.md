### **React Native Timer App**

#### **Overview**
This is a cross-platform timer application built with React Native and Expo, designed to run on both iOS and Android. The app supports multiple types of timers, including standard countdowns, stopwatches, interval timers, and Pomodoro-style timers.

---

#### **Repository Structure**

```
.
├── assets/                 # Image and icon assets used in the app
├── components/             # Reusable components (e.g., Timer, TimerOptionsModal)
├── screens/                # Screen components for main views (HomeScreen, SettingsScreen)
├── util/                   # Utility functions (timerColors, timeFormat helpers)
├── App.js                  # Main application file
├── app.json                # Expo configuration file
├── package.json            # Dependency and script management
└── README.md               # Documentation
```

---

#### **Installation & Setup**

1. **Prerequisites**:
   - Ensure you have [Node.js](https://nodejs.org/en/download/) and [npm](https://www.npmjs.com/get-npm) installed.
   - Install Expo CLI globally:
     ```bash
     npm install -g expo-cli
     ```

2. **Clone the Repository**:
   ```bash
   git clone <repository_url>
   cd react-native-timer-app
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Run the App**:
   ```bash
   expo start
   ```
   - This will open an Expo development server where you can scan the QR code with the Expo Go app on your device or start an emulator.

---

#### **Development Notes**
- **Sensors**: The accelerometer is used to detect a shake gesture that pauses or stops active timers.
- **Notifications**: The app uses `expo-notifications` for handling timer end alerts even if the app is in the background.
- **Data Persistence**: Timer states are stored locally using `AsyncStorage` to restore the state after the app is closed or reopened.

---

#### **Troubleshooting**
- If you encounter issues with Expo Go, make sure both your development machine and the mobile device are on the same network.
- Ensure all required permissions for sensors and notifications are granted in the app settings.
