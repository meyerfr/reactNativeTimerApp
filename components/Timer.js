import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle } from "react-native-svg";

import TimerOptionsModal from "./TimerOptionsModal"

import getColorByType from "../util/timerColors";
import { formatStopwatchTime, formatTime } from "../util/timeFormat";

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const Timer = ({
	timer,
	onEdit,
	onDelete,
	toggleRunning
}) => {
	const { id, type, label, initialTime, color, isRunning, startTime, elapsedTime } = timer;

	const timerBgAnim = useRef(new Animated.Value(isRunning ? 100 : 0)).current; // Animation for background expansion
	const circleRef = useRef(null); // Reference for the circular progress bar
	const radius = 50;
	const circumference = 2 * Math.PI * radius;
	const [localTime, setLocalTime] = useState(elapsedTime); // Local state for managing timer updates

	// Modal specific variables
	const timerContainerRef = useRef(null);
	const [timerPosition, setTimerPosition] = useState({ top: 0, left: 0 });
	const [modalVisible, setModalVisible] = useState(false);

	const animationFrameRef = useRef(null); // Reference to the animation frame

	// Calculate the remaining time dynamically based on the timer's running state (for countdown timers)
	const calculateTime = () => {
		// For countdown timers (non-stopwatch)
		if (!isRunning || !startTime) {
			return Math.max(initialTime - Math.floor(elapsedTime / 1000), 0);
		}

		const now = new Date().getTime();
		const elapsed = Math.floor((now - startTime + elapsedTime) / 1000); // Elapsed time in seconds
		return Math.max(initialTime - elapsed, 0); // Ensure time doesn't go below 0 for countdown timers
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
	const currentTime = type === 'Stopwatch' ? calculateStopwatchTime() : calculateTime();

	// Start the animation loop to update progress (for countdown timers)
	const startTimerAnimation = () => {
		const update = () => {
			const timeLeft = calculateTime();
			setLocalTime(timeLeft); // Update the local time state
			if (circleRef.current && type !== 'Stopwatch') { // Skip progress update for stopwatch
				const progress = ((initialTime - timeLeft) / initialTime) * circumference;
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
		Animated.timing(timerBgAnim, {
			toValue: 100, // Expand the background circle to 100% of its size
			duration: 500,
			useNativeDriver: false,
		}).start();
	};

	// Animate background shrinking when timer pauses or stops
	const handleStopAnimation = () => {
		Animated.timing(timerBgAnim, {
			toValue: 0, // Shrink background to 0
			duration: 500,
			useNativeDriver: false,
		}).start();
	};

	useEffect(() => {
		if (isRunning) {
			handleStartAnimation();
			// Start animation based on timer type
			if (type === 'Stopwatch') {
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

	// Show modal when the user long-presses the timer
	const handleLongPress = () => {
		timerContainerRef.current.measure((fx, fy, width, height, px, py) => {
			// Calculate modal position to center it over the timer
			const modalWidth = 250; // Assume modal has a fixed width
			const modalHeight = 200; // Assume modal has a fixed height

			let top = py + (height / 2) - (modalHeight / 2); // Place modal above the timer
			let left = px + (width / 2) - (modalWidth / 2); // Center the modal horizontally

			// Ensure the modal stays within the SafeAreaView
			if (top < 0) top = 10; // Ensure it doesn't go off the top of the screen
			if (top + modalHeight > screenHeight) top = screenHeight - modalHeight - 10
			if (left < 0) left = 10; // Ensure it doesn't go off the left side
			if (left + modalWidth > screenWidth) left = screenWidth - modalWidth - 10; // Ensure it doesn't go off the right side

			setTimerPosition({ top, left, width, height });
			setModalVisible(true);
		});
	};

	const modalHandlers = {
		onStartPause: () => {
			toggleRunning(id);
			setModalVisible(false);
		},
		onReset: () => {
			toggleRunning(id, true, initialTime, circleRef);
			setModalVisible(false);
		},
		onDelete: () => {
			onDelete();
			setModalVisible(false);
		},
		onEdit: () => {
			// You can implement your edit logic here
			onEdit();
			setModalVisible(false);
		},
	}

	// Determine if reset should be visible (if timer has started)
	const hasStarted = elapsedTime > 0 || isRunning;

	return (
		<View>
			<TouchableOpacity
				onPress={() => toggleRunning(id)} // Toggle running state on simple click
				onLongPress={handleLongPress} // Show options on long press
				activeOpacity={0.7}
				style={styles.timerContainer}
				ref={timerContainerRef}
			>
				{/* Animated background */}
				<Animated.View
					style={[
						styles.backgroundCircle,
						{
							backgroundColor: `${color}1A`,
							width: timerBgAnim,
							height: timerBgAnim,
						},
					]}
				/>

				{/* Circular Progress Bar (hidden for stopwatch) */}
				{type !== 'Stopwatch' && (
					<Svg height='100' width='100' viewBox="0 0 104 104" style={styles.svgContainer}>
						<Circle
							ref={circleRef}
							cx="52"
							cy="52"
							r={radius}
							stroke={color}
							strokeWidth="4"
							strokeDasharray={circumference}
							strokeDashoffset={circumference}
							fill="none"
						/>
					</Svg>
				)}

				{/* Timer Label and Time */}
				<View style={[styles.timerCircle, { borderColor: `${color}26` }]}>
					<Text style={styles.timerText}>
						{type === 'Stopwatch' ? formatStopwatchTime(localTime) : formatTime(currentTime)}
					</Text>
					<View style={styles.timerLabelContainer}>
						<Text style={styles.timerLabel}>{label}</Text>
						{
							!isRunning && initialTime !== currentTime && (
								<Text style={styles.timerLabel}>Paused</Text>
							)
						}
					</View>
				</View>
			</TouchableOpacity>
			{/* Custom Modal for Timer Options */}
			<TimerOptionsModal
				visible={modalVisible}
				onClose={() => setModalVisible(false)}
				modalHandlers={modalHandlers}
				isRunning={isRunning}
				hasStarted={hasStarted} // Pass the flag to show or hide reset
				timerPosition={timerPosition}
			/>
		</View>
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
		textAlign: 'center',
		color: '#555',
	},
});

export default Timer;
