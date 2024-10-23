import React, { useState } from 'react';
import { View, Button, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import Timer from '../components/Timer';
import getInitialTime from "../util/initialTimes";

const HomeScreen = () => {
	const [timers, setTimers] = useState([]);

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
		<SafeAreaView style={styles.container}>
			<View style={styles.buttonsContainer}>
				<Button title="Add Standard Timer" onPress={() => addTimer('standard')} />
				<Button title="Add Pomodoro Timer" onPress={() => addTimer('pomodoro')} />
				<Button title="Add Stopwatch Timer" onPress={() => addTimer('stopwatch')} />
				<Button title="Add Interval Timer" onPress={() => addTimer('interval')} />
			</View>

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
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 10,
	},
	buttonsContainer: {
		marginBottom: 20,
		justifyContent: 'space-around',
	},
	timersGrid: {
		alignItems: 'center',
		justifyContent: 'center',
	},
});

export default HomeScreen;
