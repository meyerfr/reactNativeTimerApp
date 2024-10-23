import React, { useState, useLayoutEffect, useRef } from 'react';
import {
	View,
	Text,
	FlatList,
	StyleSheet,
	SafeAreaView,
	Pressable,
	TouchableOpacity,
} from 'react-native';
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from '@react-navigation/native';
import Timer from '../components/Timer';
import getInitialTime from "../util/initialTimes";
import getColorByType from "../util/timerColors"

const HomeScreen = () => {
	const [timers, setTimers] = useState([]);

	const [dropdownVisible, setDropdownVisible] = useState(false);
	const dropdownRef = useRef(null);
	const navigation = useNavigation()

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
		const newTimer = {
			id: Date.now().toString(),
			type,
			initialTime: getInitialTime(type),
			isRunning: false, // Initialize the running state
			startTime: null,  // Start time will be recorded when the timer starts
			elapsedTime: 0, // Elapsed time when paused
		};
		setTimers([...timers, newTimer]);
		setDropdownVisible(false)
	};

	// Toggle running state for a specific timer
	const toggleRunning = (timerId, reset = false, resetTime = null, circleRef=null) => {
		setTimers((prevTimers) =>
			prevTimers.map((timer) => {
				if (timer.id === timerId) {
					if (reset) {
						// Reset the progress indicator
						if (circleRef && circleRef.current) {
							circleRef.current.setNativeProps({ strokeDashoffset: 2 * Math.PI * 50 }); // Reset the progress circle
						}

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

	// Delete a timer
	const deleteTimer = (timerId) => {
		setTimers(timers.filter((timer) => timer.id !== timerId));
	};

	return (
		<View style={{flex: 1}}>
			<SafeAreaView style={styles.container}>
				<FlatList
					data={timers}
					keyExtractor={(item) => item.id}
					numColumns={3} // Display 3 timers per row
					contentContainerStyle={styles.timersGrid}
					renderItem={({ item }) => (
						<Timer
							id={item.id}
							type={item.type}
							initialTime={item.initialTime}
							isRunning={item.isRunning}
							startTime={item.startTime}
							elapsedTime={item.elapsedTime}
							toggleRunning={toggleRunning}
							onDelete={deleteTimer}
							resetTime={item.initialTime}
						/>
					)}
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
								<TouchableOpacity style={[styles.customButton, {backgroundColor: `${getColorByType(item.toLowerCase())}1A`}]} onPress={() => addTimer(item.toLowerCase())}>
									<Text style={styles.buttonText}>Add {item} Timer</Text>
								</TouchableOpacity>
							)}
						/>
					</View>
				</Pressable>
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
