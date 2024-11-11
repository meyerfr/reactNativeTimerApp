import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, AppState, Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import Svg, { Circle } from "react-native-svg";

import TimerOptionsModal from "./TimerOptionsModal"
import TimerContent from "./TimerContent"
import { rgbaOpacity } from "../util/rgbaOpacity"
import * as Notifications from "expo-notifications"

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const sendImmediateNotification = async (title, body) => {
	await Notifications.scheduleNotificationAsync({
		content: {
			title: title,
			body: body,
		},
		trigger: null, // Immediate notification
	});
};

const Timer = ({
	timer,
	onEdit,
	onDelete,
	toggleRunning,
	appState
}) => {
	const { id, type, label, initialTime, color, isRunning, startTime, elapsedTime } = timer;

	const timerBgAnim = useRef(new Animated.Value(isRunning ? 100 : 0)).current; // Animation for background expansion
	const circleRef = useRef(null); // Reference for the circular progress bar
	const radius = 50;
	const circumference = 2 * Math.PI * radius;


	const calculateTime = (inMilliseconds=true) => {
		// For countdown timers (non-stopwatch)
		if (!isRunning || !startTime) {
			return Math.max((initialTime) - Math.floor(elapsedTime), 0);
		}

		const now = new Date().getTime();
		let elapsed;
		if (inMilliseconds) {
			elapsed = Math.floor((now - startTime + elapsedTime)); // Elapsed time in seconds
		} else{
			elapsed = Math.floor((now - startTime + elapsedTime) / 1000); // Elapsed time in seconds
		}
		return Math.max(initialTime - elapsed, 0); // Ensure time doesn't go below 0 for countdown timers
	};

	const [localTime, setLocalTime] = useState(type === 'Stopwatch' ? elapsedTime : calculateTime()); // Local state for managing timer updates

	// Modal specific variables
	const timerContainerRef = useRef(null);
	const [timerPosition, setTimerPosition] = useState({ top: 0, left: 0 });
	const [modalVisible, setModalVisible] = useState(false);

	const animationFrameRef = useRef(null); // Reference to the animation frame

	// Calculate the remaining time dynamically based on the timer's running state (for countdown timers)
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
	// Start the animation loop to update progress (for countdown timers)
	const startTimerAnimation = () => {
		const update = () => {
			const timeLeft = calculateTime();
			setLocalTime(timeLeft); // Update the local time state
			updateProgressCircle(timeLeft)
			// Schedule the next animation frame
			animationFrameRef.current = requestAnimationFrame(update);
			// if (timeLeft > 0 && isRunning) {
			if(timeLeft === 0 && isRunning) {
				toggleRunning(id)
				// sendImmediateNotification("Timer Ended", `${label} timer ended.`);
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
		if (type !== 'Stopwatch' && localTime === 0 && circleRef.current) {
			circleRef.current.setNativeProps({ strokeDashoffset: 2 * Math.PI * radius });
		}

		if (animationFrameRef.current) {
			cancelAnimationFrame(animationFrameRef.current);
		}
	};

	// Animate background expansion when timer starts
	const handleStartBgAnimation = () => {
		Animated.timing(timerBgAnim, {
			toValue: 100, // Expand the background circle to 100% of its size
			duration: 500,
			useNativeDriver: false,
		}).start();
	};

	// Animate background shrinking when timer pauses or stops
	const handleStopBgAnimation = () => {
		Animated.timing(timerBgAnim, {
			toValue: 0, // Shrink background to 0
			duration: 500,
			useNativeDriver: false,
		}).start();
	};

	const updateProgressCircle = (timeLeft) => {
		if (circleRef.current && type !== 'Stopwatch') { // Skip progress update for stopwatch
			const progress = ((initialTime - timeLeft) / initialTime) * circumference;
			circleRef.current.setNativeProps({ strokeDashoffset: progress });
		}
	}

	useEffect(() => {
		if (isRunning) {
			handleStartBgAnimation();
			// Start animation based on timer type
			if (type === 'Stopwatch') {
				startStopwatchAnimation();
			} else {
				startTimerAnimation();
			}
		} else {
			handleStopBgAnimation();
			stopAnimation();
		}
		return () => {
			handleStopBgAnimation();
			stopAnimation();
		} // Cleanup the animation on unmount
	}, [isRunning]);

	// useEffect(() => {
	// 	if (appState === 'background') {
	// 		handleStopBgAnimation();
	// 		stopAnimation()
	// 	}
	// 	if (appState === 'foreground') {
	// 		handleStartBgAnimation();
	// 		// Start animation based on timer type
	// 		if (type === 'Stopwatch') {
	// 			startStopwatchAnimation();
	// 		} else {
	// 			startTimerAnimation();
	// 		}
	// 	}
	// }, [appState]);

	// changes to timer itself
	useEffect(() => {
		cancelAnimationFrame(animationFrameRef.current);
		const newTime = type === 'Stopwatch' ? elapsedTime : calculateTime(initialTime)
		setLocalTime(newTime)
		if (isRunning) {
			if (type === 'Stopwatch') {
				startStopwatchAnimation()
			} else{
				startTimerAnimation()
			}
		} else{
			updateProgressCircle(newTime)
		}
	}, [startTime, initialTime, elapsedTime, type]);

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
			handleToggleRunning(id)
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
			onEdit();
			setModalVisible(false);
		},
	}

	const handleToggleRunning = () => {
		if (type === 'Stopwatch') {
			return toggleRunning(id)
		}
		if (isRunning || localTime > 0) {
			stopAnimation()
			return toggleRunning(id);
		} else{
			return toggleRunning(id, true);
		}
	}

	// Determine if reset should be visible (if timer has started)
	const hasStarted = elapsedTime > 0 || isRunning;

	return (
		<View>
			<TouchableOpacity
				onPress={handleToggleRunning} // Toggle running state on simple click
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
							backgroundColor: `${rgbaOpacity(color, '0.25')}`,
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
							stroke={rgbaOpacity(color, '1')}
							strokeWidth="4"
							strokeDasharray={circumference}
							strokeDashoffset={circumference}
							fill="none"
						/>
					</Svg>
				)}

				{/* Timer Label and Time */}
				<TimerContent timeLeftInMilliseconds={localTime} elapsedTime={elapsedTime} type={type} color={color} label={label} isRunning={isRunning}/>
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
	timeTextWrapper: {
		flexDirection: 'row',
		alignItems: 'flex-start',
	},
	timeTextSmall: {
		fontSize: 8,
		lineHeight: 8,
		fontWeight: 400,
		color: '#515151',
		includeFontPadding: false
	},
	timeText: {
		fontSize: 16,
		textAlignVertical: 'top',
		fontWeight: 'bold',
		includeFontPadding: false
	},
	timeTextMinWrapper: {
		flexDirection: 'column'
	},
	superscript: {
		fontSize: 8,
		lineHeight: 10,
		fontWeight: 400,
		color: '#515151',
		marginRight: 4,
		includeFontPadding: false,
		textAlignVertical: 'bottom'
	},
	timerLabelContainer: {
		alignItems: 'center',
	},
	timerLabel: {
		fontSize: 14,
		textAlign: 'center',
		color: '#434343',
	},
	smallTimerLabel: {
		fontSize: 12,
	},
});

export default Timer;
