import React, { useState, useLayoutEffect, useRef, useEffect } from 'react';
import {
	View,
	Text,
	FlatList,
	StyleSheet,
	SafeAreaView,
	Pressable,
	TouchableOpacity,
	AppState,
	Platform
} from 'react-native';
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from '@react-navigation/native';
import Timer from '../components/Timer';
import getColorByType from "../util/timerColors"
import TimerSettingsModal from "../components/TimerSettingsModal"
import IntervalTimer from "../components/IntervalTimer"
import * as Notifications from "expo-notifications"
import AsyncStorage from "@react-native-async-storage/async-storage"

const defaultTimers = [
	{
		id: '1',
		type: 'Pomodoro',
		label: 'Work',
		initialTime: 1500*1000,
		color: 'rgba(106, 52, 57, 0.5)', // Example color
		isRunning: false,
		startTime: null,
		elapsedTime: 0,
	},
	{
		id: '2',
		type: 'Stopwatch',
		label: 'Break',
		initialTime: 0,
		color: 'rgba(129, 208, 101, 1)',
		isRunning: false,
		startTime: null,
		elapsedTime: 0,
	},
	{
		id: '3',
		type: 'Standard',
		label: 'Sleep',
		initialTime: 8*60*60*1000,
		color: 'rgba(101,208,192,1)',
		isRunning: false,
		startTime: null,
		elapsedTime: 0,
	},
	{
		id: '4',
		type: 'Standard',
		label: 'Power Nap',
		initialTime: 5*1000,
		color: 'rgba(101,167,208,1)',
		isRunning: false,
		startTime: null,
		elapsedTime: 0,
	},
	{
		id: '5',
		type: 'Standard',
		label: 'Hours',
		initialTime: 15*60*60*1000,
		color: 'rgba(160,101,208,1)',
		isRunning: false,
		startTime: null,
		elapsedTime: 0,
	},
	{
		id: '6',
		type: 'Standard',
		label: 'Hours',
		initialTime: (15*60*60*4)+(10*60)+45*1000,
		color: 'rgba(205,152,71,1)',
		isRunning: false,
		startTime: null,
		elapsedTime: 0,
	},
	{
		id: '7',
		type: 'Standard',
		label: 'Min',
		initialTime: 600000,
		color: 'rgba(128,208,101,1)',
		isRunning: false,
		startTime: null,
		elapsedTime: 0,
	}
]

const handlePhaseCompletion = (phaseName) => {
	sendNotification("Timer Ended", `${phaseName} phase completed!`);
	handlePhaseTransition();
};

const HomeScreen = () => {
	const [appState, setAppState] = useState(AppState.currentState);
	const [timers, setTimers] = useState(defaultTimers);

	const [dropdownVisible, setDropdownVisible] = useState(false);
	const dropdownRef = useRef(null);
	const navigation = useNavigation()

	const [settingsModalVisible, setSettingsModalVisible] = useState(false);
	const [currentTimer, setCurrentTimer] = useState(null);

	useEffect(() => {
		const handleAppStateChange = (nextAppState) => {
			if (appState.match(/inactive|background/) && nextAppState === "active") {
				console.log("App has come to the foreground!");
				cancelScheduledNotifications();
				restoreTimers();
			} else if (nextAppState.match(/inactive|background/)) {
				console.log("App has gone to the background!");
				saveTimerState(timers);
				scheduleNotificationsForRunningTimers();
			}
			setAppState(nextAppState);
		};

		const subscription = AppState.addEventListener('change', handleAppStateChange);

		return () => {
			subscription.remove();
		};
	}, [appState]);

	const scheduleNotificationsForRunningTimers = () => {
		timers.forEach((timer) => {
			if (timer.isRunning) {
				const timeLeft = calculateTimeLeft(timer);
				console.log("Scheduling notifications for running timers", timer.id)
				scheduleNotification(timer.id, timeLeft);
			}
		});
	};

	const calculateTimeLeft = (timer) => {
		const now = new Date().getTime();
		const elapsedTime = now - timer.startTime + timer.elapsedTime;
		return Math.max(timer.initialTime - elapsedTime, 0); // Remaining time in ms
	};

	const scheduleNotification = async (timerId, timeLeft) => {
		await Notifications.scheduleNotificationAsync({
			content: {
				title: "Timer Ended",
				body: "Your timer has completed!",
			},
			trigger: { seconds: timeLeft / 1000 },
		});
	};

	const cancelScheduledNotifications = () => {
		Notifications.cancelAllScheduledNotificationsAsync();
	};

	const saveTimerState = async (timers) => {
		try {
			const timerData = JSON.stringify(timers);
			await AsyncStorage.setItem("timers", timerData);
			setTimers(timers.map(timer => ({...timer, isRunning: false}))); // Stop all timers
		} catch (error) {
			console.log("Error saving timer state:", error);
		}
	};

	const restoreTimers = async () => {
		try {
			const timerData = await AsyncStorage.getItem("timers");
			if (timerData) {
				setTimers(JSON.parse(timerData));
			}
		} catch (error) {
			console.log("Error loading timer state:", error);
		}
	};

	// Set the header with the "plus" button
	useLayoutEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<Ionicons
					name="add"
					size={28}
					color="black"
					style={{ marginRight: 15 }}
					onPress={() => setDropdownVisible(!dropdownVisible)} // Open the modal on press
				/>
			),
		});
	}, [navigation, dropdownVisible]);

	// Handle closing dropdown if clicked outside (if necessary)
	const handleOutsideDropdownPress = () => {
		setDropdownVisible(false);
	};

	// Function to add a new timer
	const addTimer = (type) => {
		// Define default values for each type of timer
		let defaultLabel = 'New Timer';
		let defaultTime = 0;
		let defaultColor = '#000000'; // Default black color

		// Define specific attributes based on the timer type
		switch (type) {
			case 'Pomodoro':
				defaultLabel = 'Pomodoro';
				defaultTime = 1500*1000; // 25 minutes in seconds
				defaultColor = 'rgba(255,99,71, 1)'; // Tomato red
				break;
			case 'Standard':
				defaultLabel = 'Standard';
				defaultTime = 600*1000; // 10 minutes in seconds
				defaultColor = 'rgba(255,215,0,1)'; // Gold
				break;
			case 'Stopwatch':
				defaultLabel = 'Stopwatch';
				defaultTime = 0; // Stopwatch starts at 0
				defaultColor = 'rgba(70,130,180,1)'; // Steel blue
				break;
			case 'Interval':
				defaultLabel = 'Interval';
				defaultTime = 300*1000; // 5 minutes in seconds
				defaultColor = 'rgba(50,205,50,1)'; // Lime green
				break;
			default:
				defaultLabel = 'Custom';
				defaultTime = 0;
				defaultColor = 'rgba(0,0,0,1)'; // Default black color
				break;
		}

		// Create a new timer object
		const newTimer = {
			id: Date.now().toString(), // Generate a unique ID based on timestamp
			type: type,
			label: defaultLabel,
			initialTime: defaultTime,
			color: defaultColor,
			isRunning: false, // Initially, the timer is not running
			startTime: null,
			elapsedTime: 0, // No elapsed time initially
		};

		// Add the new timer to the existing list of timers
		setTimers((prevTimers) => [...prevTimers, newTimer]);

		setDropdownVisible(false)
	};

	const openSettings = (timer) => {
		setCurrentTimer(timer);
		setSettingsModalVisible(true);
	};

	// Handle saving timer changes
	const handleSaveTimer = (updatedTimer) => {
		const updatedTimers = timers.map((timer) => {
			if (timer.id === updatedTimer.id) {
				return {
					...timer,
					label: updatedTimer.label,
					initialTime: updatedTimer.initialTime,
					color: updatedTimer.color,
					type: updatedTimer.type
				};
			}
			return timer;
		});



		setTimers(updatedTimers);
		setSettingsModalVisible(false); // Close the settings modal after saving
	};

	// Toggle running state for a specific timer
	const toggleRunning = (timerId, reset = false) => {
		setTimers((prevTimers) =>
			prevTimers.map((timer) => {
				if (timer.id === timerId) {
					if (reset) {
						// Reset the timer's elapsed time and set it to not running
						return {
							...timer,
							isRunning: false,
							startTime: null,
							elapsedTime: 0,
						};
					} else if (timer.isRunning) {
						// Pause the timer and save elapsed time
						const now = new Date().getTime();
						const elapsed = now - timer.startTime;
						return {
							...timer,
							isRunning: false,
							elapsedTime: timer.elapsedTime + elapsed,
							startTime: null,
						};
					} else {
						// Start or resume the timer
						return {
							...timer,
							isRunning: true,
							startTime: new Date().getTime(),
						};
					}
				}
				return timer;
			})
		);
	};

	// Handle deleting the timer
	const handleDeleteTimer = (timerId) => {
		const updatedTimers = timers.filter((timer) => timer.id !== timerId);
		setTimers(updatedTimers);
		setSettingsModalVisible(false);
	};

	return (
		<View style={{flex: 1}}>
			<SafeAreaView style={styles.container}>
				<FlatList
					data={timers}
					keyExtractor={(item) => item.id}
					numColumns={3} // Display 3 timers per row
					contentContainerStyle={styles.timersGrid}
					renderItem={({ item }) => {
						switch (item.type) {
							case 'Pomodoro':
								return (
									<IntervalTimer
										key={item.id}
										timer={item}
										onEdit={() => openSettings(item)}
										onDelete={() => handleDeleteTimer(item.id)}
										onSave={handleSaveTimer}
										toggleRunning={toggleRunning}
									/>
								)
							default:
								return (
									<Timer
										key={item.id}
										timer={item}
										onEdit={() => openSettings(item)}
										onDelete={() => handleDeleteTimer(item.id)}
										onSave={handleSaveTimer}
										toggleRunning={toggleRunning}
										appState={appState}
									/>
								)
						}
					}}
				/>
			</SafeAreaView>
			{dropdownVisible && (
				<Pressable style={styles.dropdownOverlay} onPress={handleOutsideDropdownPress}>
					<View ref={dropdownRef} style={styles.dropdownContainer}>
						<FlatList
							data={['Standard', 'Pomodoro', 'Stopwatch', 'Interval']}
							keyExtractor={(item) => item}
							numColumns={1}
							renderItem={({ item }) => (
								<TouchableOpacity style={[styles.customButton, {backgroundColor: `${getColorByType(item.toLowerCase())}1A`}]} onPress={() => addTimer(item)}>
									<Text style={styles.buttonText}>Add {item} Timer</Text>
								</TouchableOpacity>
							)}
						/>
					</View>
				</Pressable>
			)}

			{currentTimer && (
				<TimerSettingsModal
					visible={settingsModalVisible}
					onClose={() => setSettingsModalVisible(false)}
					onSave={handleSaveTimer}
					timer={currentTimer}
					onDelete={() => handleDeleteTimer(currentTimer.id)}
				/>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 10,
	},
	timersGrid: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	dropdownOverlay: {
		position: 'absolute',
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: 'transparent',
	},
	dropdownContainer: {
		position: 'absolute',
		top: 5, // Adjust this to position the dropdown below the header
		right: 10, // Align with the "plus" button
		width: 200,
		backgroundColor: 'white',
		padding: 10,
		borderRadius: 10,
		shadowColor: '#000',
		shadowOpacity: 0.3,
		shadowRadius: 5,
		elevation: 10,
		alignItems: 'flex-start',
	},
	customButton: {
		width: '100%',
		paddingVertical: 10,
		paddingHorizontal: 20,
		marginBottom: 10,
		backgroundColor: '#f0f0f0',
		borderRadius: 5,
	},
	buttonText: {
		fontSize: 14,
	},
});

export default HomeScreen;
