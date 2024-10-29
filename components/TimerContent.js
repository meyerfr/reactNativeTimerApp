import React from "react"
import { StyleSheet, Text, View } from "react-native"
import { rgbaOpacity } from "../util/rgbaOpacity"

const TimerContent = ({timeLeftInMilliseconds, type, isRunning, elapsedTime, color, label}) => {
	const timeInSeconds = Math.floor(timeLeftInMilliseconds / 1000);
	// Calculate days, hours, minutes, and seconds
	const days = Math.floor(timeInSeconds / 86400);
	const hours = Math.floor((timeInSeconds % 86400) / 3600);
	const minutes = Math.floor((timeInSeconds % 3600) / 60);
	const seconds = Math.floor(timeInSeconds % 60);

	const TimeDisplay = () => {
		if (type === 'Stopwatch' || (days === 0 && hours === 0 && minutes === 0)) {
			const milliseconds = timeLeftInMilliseconds % 1000;
			return (
				<Text style={styles.timeText}>
					{`${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`}
				</Text>
			);
		}

		if (days > 0) {
			return (
				<View style={styles.timeTextWrapper}>
					<Text style={styles.timeText}>{`${days.toString().padStart(2, '0')}`}</Text>
					<Text style={[styles.superscript]}>D</Text>
					<Text style={styles.timeText}>{`${hours.toString().padStart(2, '0')}`}</Text>
					<View style={styles.timeTextMinWrapper}>
						<Text style={[styles.superscript]}>H</Text>
						<Text style={[styles.timeText, styles.timeTextSmall]}>{`${minutes.toString().padStart(2, '0')}`}</Text>
					</View>
				</View>
			);
		} else if (hours > 0) {
			return (
				<View style={styles.timeTextWrapper}>
					<Text style={styles.timeText}>{`${hours.toString().padStart(2, '0')}`}</Text>
					<Text style={[styles.superscript]}>H</Text>
					<Text style={styles.timeText}>{`${minutes.toString().padStart(2, '0')}`}</Text>
					<View style={styles.timeTextMinWrapper}>
						<Text style={[styles.superscript]}>M</Text>
						<Text style={[styles.timeText, styles.timeTextSmall]}>{`${seconds.toString().padStart(2, '0')}`}</Text>
					</View>
				</View>
			);
		} else if (minutes > 0) {
			return (
				<Text style={styles.timeText}>
					{`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
				</Text>
			);
		}
	}

	const ExtraInfo = () => {
		if (!isRunning && elapsedTime > 0) {
			if (type === 'Stopwatch' || timeLeftInMilliseconds > 0) {
				return (
					<Text style={[styles.timerLabel, styles.smallTimerLabel, {color: '#578ed5'}]}>Paused</Text>
				)
			} else{
				return (
					<Text style={[styles.timerLabel, styles.smallTimerLabel, {color: '#b32626'}]}>Reset</Text>
				)
			}
		}
	}

	return (
		<View style={[styles.timerCircle, { borderColor: `${rgbaOpacity(color, '0.2')}` }]}>
			<TimeDisplay />
			<View style={styles.timerLabelContainer}>
				<Text style={styles.timerLabel}>{label}</Text>
				<ExtraInfo/>
			</View>
		</View>
	)
};

const styles = StyleSheet.create({
	timerCircle: {
		width: 100,
		height: 100,
		borderRadius: 50,
		borderWidth: 4,
		alignItems: 'center',
		justifyContent: 'center',
		zIndex: 1, // Ensure the border and text appear above the background
	},
	timerLabelContainer: {
		alignItems: 'center',
	},
	timerLabel: {
		fontSize: 14,
		textAlign: 'center',
		color: '#434343',
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
});

export default TimerContent
