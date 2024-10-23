import React, { useEffect, useRef } from 'react';
import { Alert, Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Timer = ({ id, type, initialTime, isRunning, startTime, elapsedTime, toggleRunning, onDelete, resetTime }) => {
	const scaleAnim = useRef(new Animated.Value(isRunning ? 100 : 0)).current; // Animation for background expansion

	// Calculate the time dynamically based on whether the timer is running
	const calculateTime = () => {
		if (isRunning) {
			const now = new Date().getTime();
			const elapsed = Math.floor((now - startTime + elapsedTime) / 1000); // Elapsed time in seconds
			return Math.max(resetTime - elapsed, 0); // Ensure time doesn't go below 0 for countdown timers
		}
		return Math.max(resetTime - Math.floor(elapsedTime / 1000), 0); // Use elapsedTime when paused
	};

	// Calculate the stopwatch time dynamically
	const calculateStopwatchTime = () => {
		if (isRunning) {
			const now = new Date().getTime();
			 // Elapsed time in milliseconds
			return now - startTime + elapsedTime;
		}
		return elapsedTime; // Use elapsedTime when paused
	};

	// Format time to MM:SS for non-stopwatch timers
	const formatTime = (timeInSeconds) => {
		const minutes = Math.floor(timeInSeconds / 60);
		const seconds = timeInSeconds % 60;
		return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	};

	// Format time to SS.SSS for stopwatch
	const formatStopwatchTime = (timeInMilliseconds) => {
		const seconds = Math.floor(timeInMilliseconds / 1000);
		const milliseconds = timeInMilliseconds % 1000;
		return `${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
	};

	// Set color based on timer type
	const getColorByType = () => {
		switch (type) {
			case 'pomodoro':
				return '#FF6347'; // Tomato red
			case 'stopwatch':
				return '#4682B4'; // Steel blue
			case 'interval':
				return '#32CD32'; // Lime green
			case 'standard':
			default:
				return '#FFD700'; // Gold
		}
	};

	// Animate background expansion when timer starts
	const handleStartAnimation = () => {
		Animated.timing(scaleAnim, {
			toValue: 100, // Expand the background circle to 100% of its size
			duration: 500,
			useNativeDriver: false,
		}).start();
	};

	// Animate background shrinking when timer pauses or stops
	const handleStopAnimation = () => {
		Animated.timing(scaleAnim, {
			toValue: 0, // Shrink background to 0
			duration: 500,
			useNativeDriver: false,
		}).start();
	};

	useEffect(() => {
		if (isRunning) {
			handleStartAnimation();
		} else {
			handleStopAnimation();
		}
	}, [isRunning]);


	const currentTime = type === 'stopwatch' ? calculateStopwatchTime() : calculateTime();

	// Handle long press actions (Start, Reset, Delete)
	const handleLongPress = () => {
		const options = [
			{
				text: isRunning ? 'Pause' : 'Start',
				onPress: () => toggleRunning(id),
			},
		];

		if (initialTime !== resetTime) {
			options.push({
				text: 'Reset',
				onPress: () => toggleRunning(id, true, resetTime),
			});
		}

		options.push({
			text: 'Delete',
			onPress: () => onDelete(id),
		});

		options.push({
			text: 'Cancel',
			style: 'cancel',
		});

		Alert.alert('Timer Options', 'Select an action', options);
	};

	const timerColor = getColorByType();
	const brighterColor = `${timerColor}AA`; // Lighter version of the color for background

	return (
		<TouchableOpacity
			onPress={() => toggleRunning(id)} // Toggle running state on simple click
			onLongPress={handleLongPress} // Show options on long press
			activeOpacity={0.7}
			style={styles.timerContainer}
		>
			{/* Animated background */}
			<Animated.View
				style={[
					styles.backgroundCircle,
					{
						backgroundColor: brighterColor,
						width: scaleAnim,
						height: scaleAnim,
					},
				]}
			/>

			{/* Static content with border */}
			<View style={[styles.timerCircle, { borderColor: timerColor }]}>
				<Text style={styles.timerText}>
					{type === 'stopwatch' ? formatStopwatchTime(currentTime) : formatTime(currentTime)}
				</Text>
				<View>
					{
						// Show the timer type if it's not running
						!isRunning && (
							<Text style={styles.timerLabel}>
								{type.charAt(0).toUpperCase() + type.slice(1)}
							</Text>
						)
					}
					{
						!isRunning && initialTime !== currentTime && (
							<Text style={styles.timerLabel}>Paused</Text>
						)
					}
				</View>
			</View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	timerContainer: {
		// flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		padding: 10,
	},
	backgroundCircle: {
		position: 'absolute',
		borderRadius: 50,
	},
	timerCircle: {
		width: 100,
		height: 100,
		borderRadius: 50,
		borderWidth: 4,
		alignItems: 'center',
		justifyContent: 'center',
		zIndex: 1, // Ensure the border and text appear above the background
	},
	timerText: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#000',
	},
	timerLabel: {
		fontSize: 14,
		color: '#555',
	},
});

export default Timer;
