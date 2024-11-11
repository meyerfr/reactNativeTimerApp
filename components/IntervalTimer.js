import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import Svg, { Circle } from "react-native-svg";

import TimerOptionsModal from "./TimerOptionsModal";
import TimerContent from "./TimerContent";
import { rgbaOpacity } from "../util/rgbaOpacity";

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const IntervalTimer = ({
	                       timer,
	                       onEdit,
	                       onDelete,
	                       toggleRunning,
												 intervalSettings = {
		                       workTime: 25*60*1000,       // Default work time (25 minutes in seconds)
		                       shortBreakTime: 5*60*1000,  // Default short break time (5 minutes in seconds)
		                       longBreakTime: 15*60*1000,   // Default long break time (15 minutes in seconds)
		                       intervals: 2,         // Number of cycles
												 }
                       }) => {
	const { id, label, color, isRunning, startTime, elapsedTime } = timer;
	const {workTime, shortBreakTime, longBreakTime, intervals} = intervalSettings;

	const timerBgAnim = useRef(new Animated.Value(isRunning ? 100 : 0)).current;
	const circleRef = useRef(null);
	const radius = 50;
	const circumference = 2 * Math.PI * radius;

	// State to manage phases and intervals
	const [currentPhase, setCurrentPhase] = useState("work");
	const [intervalCount, setIntervalCount] = useState(0); // Tracks current interval cycle
	const [cycleCount, setCycleCount] = useState(0); // Tracks completed cycles
	const [localTime, setLocalTime] = useState(workTime); // Time left in the current phase

	// Modal specific variables
	const timerContainerRef = useRef(null);
	const [timerPosition, setTimerPosition] = useState({ top: 0, left: 0 });
	const [modalVisible, setModalVisible] = useState(false);

	const animationFrameRef = useRef(null);

	// Calculate time left dynamically based on current phase
	const calculateTime = (inMilliseconds = true) => {
		// Determine the total time for the current phase
		let phaseTime;
		switch (currentPhase) {
			case "work":
				phaseTime = workTime;
				break;
			case "shortBreak":
				phaseTime = shortBreakTime;
				break;
			case "longBreak":
				phaseTime = longBreakTime;
				break;
			default:
				phaseTime = workTime;
		}

		// If the timer is paused or not started, return remaining time based on elapsed time
		if (!isRunning || !startTime) {
			return Math.max(phaseTime - Math.floor(elapsedTime), 0);
		}

		// Calculate elapsed time since the timer started
		const now = new Date().getTime();
		let elapsed = now - startTime + elapsedTime;
		if (!inMilliseconds) {
			elapsed = Math.floor(elapsed / 1000); // Convert to seconds if needed
		}

		// Calculate remaining time for the current phase
		const timeLeft = Math.max(phaseTime - elapsed, 0);
		if (timeLeft === 0) {
			// Phase completed, stop the timer and reset progress circle
			handlePhaseCompletion();
		}
		return Math.floor(timeLeft);
	};

// Function to handle phase completion
	const handlePhaseCompletion = () => {
		stopAnimation();

		// Move to the next phase and start timer if auto-start is desired
		handlePhaseTransition();
		toggleRunning(id, true); // Stop the timer
	};

	// Handle transitions between phases
	const handlePhaseTransition = () => {
		let alertText
		if (currentPhase === "work") {
			// Go to short break if intervals left in cycle, else long break
			setCurrentPhase(intervalCount % intervals === 0 ? "shortBreak" : "longBreak");
			setLocalTime(intervalCount % intervals === 0 ? shortBreakTime : longBreakTime);
			// setIntervalCount((prevCount) => (intervalCount < intervals - 1 ? prevCount + 1 : 0));
			// if (intervalCount >= intervals - 1) {
			// 	setCycleCount(cycleCount + 1);
			// }
			alertText = 'Work phase completed'
		} else if (currentPhase === "shortBreak") {
			// Go back to work after short break
			setCurrentPhase("work");
			setLocalTime(workTime);
			setIntervalCount(intervalCount + 1);
			// if (intervalCount % intervals === 0) {
			// 	setCycleCount(cycleCount + 1);
			// }
			alertText = 'ShortBreak phase completed'
		} else if (currentPhase === "longBreak") {
			// Reset or end the full cycle
			setIntervalCount(intervalCount + 1)
			setCurrentPhase("work");
			setLocalTime(workTime);
			alertText = 'Long break phase completed'
		}
		Alert.alert(alertText);
	};

	// Update the timer animation loop to use calculateTime
	const startTimerAnimation = () => {
		const update = () => {
			const timeLeft = calculateTime();
			setLocalTime(timeLeft); // Update the local time state
			// Schedule the next animation frame only if time remains
			if (timeLeft > 0 && isRunning) {
				updateProgressCircle(timeLeft); // Update progress circle display
				animationFrameRef.current = requestAnimationFrame(update);
			}
		};
		animationFrameRef.current = requestAnimationFrame(update);
	};

	// Stop animation loop
	const stopAnimation = () => {
		if (animationFrameRef.current) {
			cancelAnimationFrame(animationFrameRef.current);
		}
	};

	// Animate background on start
	const handleStartBgAnimation = () => {
		Animated.timing(timerBgAnim, {
			toValue: 100,
			duration: 500,
			useNativeDriver: false,
		}).start();
	};

	// Animate background on stop
	const handleStopBgAnimation = () => {
		Animated.timing(timerBgAnim, {
			toValue: 0,
			duration: 500,
			useNativeDriver: false,
		}).start();
	};

	const updateProgressCircle = (timeLeft) => {
		const phaseTime = currentPhase === "work" ? workTime : currentPhase === "shortBreak" ? shortBreakTime : longBreakTime;

		if (circleRef.current) {
			const progress = ((phaseTime - timeLeft) / phaseTime) * circumference;
			return circleRef.current.setNativeProps({ strokeDashoffset: progress });
		}
	};

	useEffect(() => {
		if (isRunning) {
			handleStartBgAnimation();
			startTimerAnimation();
		} else {
			handleStopBgAnimation();
			stopAnimation();
		}
		return () => {
			handleStopBgAnimation();
			stopAnimation();
		};
	}, [isRunning]);

	// changes to timer itself
	useEffect(() => {
		cancelAnimationFrame(animationFrameRef.current);
		const newTime = calculateTime()
		setLocalTime(newTime)
		if (isRunning) {
			startTimerAnimation()
		} else{
			updateProgressCircle(newTime)
		}
	}, [startTime, elapsedTime]);

	// Timer controls
	const handleLongPress = () => {
		timerContainerRef.current.measure((fx, fy, width, height, px, py) => {
			let top = py + (height / 2) - 100;
			let left = px + (width / 2) - 125;

			if (top < 0) top = 10;
			if (top + 200 > screenHeight) top = screenHeight - 200 - 10;
			if (left < 0) left = 10;
			if (left + 250 > screenWidth) left = screenWidth - 250 - 10;

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
			toggleRunning(id, true, workTime, circleRef);
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
	};

	const handleToggleRunning = () => {
		if (isRunning && localTime > 0 && ['shortBreak', 'longBreak'].includes(currentPhase)) {
			setCurrentPhase("work");
			setLocalTime(workTime);
			setIntervalCount(intervalCount + 1);
			// if (intervalCount >= intervals - 1) {
			// 	setCycleCount(cycleCount + 1);
			// }
			return toggleRunning(id, true);
		}
		if (isRunning || localTime > 0) {
			stopAnimation()
			return toggleRunning(id);
		} else{
			return toggleRunning(id, true);
		}
	}


	return (
		<View>
			<TouchableOpacity
				onPress={handleToggleRunning}
				onLongPress={handleLongPress}
				activeOpacity={0.7}
				style={styles.timerContainer}
				ref={timerContainerRef}
			>
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
				<TimerContent timeLeftInMilliseconds={localTime} elapsedTime={elapsedTime} type={currentPhase} color={color} label={label} isRunning={isRunning} phase={currentPhase} intervalCount={intervalCount} />
			</TouchableOpacity>
			<TimerOptionsModal
				visible={modalVisible}
				onClose={() => setModalVisible(false)}
				modalHandlers={modalHandlers}
				isRunning={isRunning}
				hasStarted={elapsedTime > 0 || isRunning}
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
		transform: [{ rotate: '-90deg' }],
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
		includeFontPadding: false,
	},
	timeText: {
		fontSize: 16,
		textAlignVertical: 'top',
		fontWeight: 'bold',
		includeFontPadding: false,
	},
	timeTextMinWrapper: {
		flexDirection: 'column',
	},
	superscript: {
		fontSize: 8,
		lineHeight: 10,
		fontWeight: 400,
		color: '#515151',
		marginRight: 4,
		includeFontPadding: false,
		textAlignVertical: 'bottom',
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

export default IntervalTimer;
