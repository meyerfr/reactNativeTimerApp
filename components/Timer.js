import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle } from "react-native-svg";

import getColorByType from "../util/timerColors";
import { formatStopwatchTime, formatTime } from "../util/timeFormat";

const Timer = ({ id, type, initialTime, isRunning, startTime, elapsedTime, toggleRunning, onDelete, resetTime }) => {
	const scaleAnim = useRef(new Animated.Value(isRunning ? 100 : 0)).current; // Animation for background expansion
	const circleRef = useRef(null); // Reference for the circular progress bar
	const radius = 50;
	const circumference = 2 * Math.PI * radius;
	const [localTime, setLocalTime] = useState(elapsedTime); // Local state for managing timer updates

	const animationFrameRef = useRef(null); // Reference to the animation frame

	// Calculate the remaining time dynamically based on the timer's running state (for countdown timers)
	const calculateTime = () => {
		// For countdown timers (non-stopwatch)
		if (!isRunning || !startTime) {
			return Math.max(resetTime - Math.floor(elapsedTime / 1000), 0);
		}

		const now = new Date().getTime();
		const elapsed = Math.floor((now - startTime + elapsedTime) / 1000); // Elapsed time in seconds
		return Math.max(resetTime - elapsed, 0); // Ensure time doesn't go below 0 for countdown timers
	};

	// Calculate the stopwatch time dynamically (counts up)
	const calculateStopwatchTime = () => {
		// If the stopwatch is paused, return elapsedTime
		if (!isRunning || !startTime) {
			return elapsedTime;
		}

		// If the stopwatch is running, calculate time upwards
		const now = new Date().getTime();
		return now - startTime + elapsedTime; // Elapsed time in milliseconds
	};

	// Determine the time to display
	const currentTime = type === 'stopwatch' ? calculateStopwatchTime() : calculateTime();

	// Start the animation loop to update progress (for countdown timers)
	const startTimerAnimation = () => {
		const update = () => {
			const timeLeft = calculateTime();
			setLocalTime(timeLeft); // Update the local time state
			if (circleRef.current && type !== 'stopwatch') { // Skip progress update for stopwatch
				const progress = ((resetTime - timeLeft) / resetTime) * circumference;
				circleRef.current.setNativeProps({ strokeDashoffset: progress });
			}
			// Schedule the next animation frame
			if (timeLeft > 0 && isRunning) {
				animationFrameRef.current = requestAnimationFrame(update);
			}
		};
		animationFrameRef.current = requestAnimationFrame(update);
	};

	// Start the animation loop for the stopwatch (updating time)
	const startStopwatchAnimation = () => {
		const update = () => {
			const newElapsedTime = calculateStopwatchTime();
			setLocalTime(newElapsedTime); // Update the local time state
			// Schedule the next animation frame
			if (isRunning) {
				animationFrameRef.current = requestAnimationFrame(update);
			}
		};
		animationFrameRef.current = requestAnimationFrame(update);
	};

	// Stop the animation loop
	const stopAnimation = () => {
		if (animationFrameRef.current) {
			cancelAnimationFrame(animationFrameRef.current);
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
			// Start animation based on timer type
			if (type === 'stopwatch') {
				startStopwatchAnimation();
			} else {
				startTimerAnimation();
			}
		} else {
			handleStopAnimation();
			stopAnimation();
		}
		return () => stopAnimation(); // Cleanup the animation on unmount
	}, [isRunning]);

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

	const timerColor = getColorByType(type);
	const brighterColor = `${timerColor}1A`; // Lighter version of the color for background

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

			{/* Circular Progress Bar (hidden for stopwatch) */}
			{type !== 'stopwatch' && (
				<Svg height='100' width='100' viewBox="0 0 104 104" style={styles.svgContainer}>
					<Circle
						ref={circleRef}
						cx="52"
						cy="52"
						r={radius}
						stroke={timerColor}
						strokeWidth="4"
						strokeDasharray={circumference}
						strokeDashoffset={circumference}
						fill="none"
					/>
				</Svg>
			)}

			{/* Static content with border */}
			<View style={[styles.timerCircle, { borderColor: `${timerColor}26` }]}>
				<Text style={styles.timerText}>
					{type === 'stopwatch' ? formatStopwatchTime(localTime) : formatTime(currentTime)}
				</Text>
				<View style={styles.timerLabelContainer}>
					<Text style={styles.timerLabel}>
						{type.charAt(0).toUpperCase() + type.slice(1)}
					</Text>
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
		alignItems: 'center',
		justifyContent: 'center',
		padding: 10,
	},
	backgroundCircle: {
		position: 'absolute',
		borderRadius: 50,
	},
	svgContainer: {
		position: 'absolute',
		transform: [{ rotate: '-90deg' }], // Rotate to start the circle from the top
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
	timerLabelContainer: {
		alignItems: 'center',
	},
	timerLabel: {
		fontSize: 14,
		color: '#555',
	},
});

export default Timer;
