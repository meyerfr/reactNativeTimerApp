import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TimeSelectorModal = ({ visible, onClose, onSave, initialTime: initialTimeInSeconds }) => {
	const [days, setDays] = useState(0);
	const [hours, setHours] = useState(0);
	const [minutes, setMinutes] = useState(0);
	const [seconds, setSeconds] = useState(0);
	const [selectedUnit, setSelectedUnit] = useState('seconds'); // Track which unit is selected

	const resetDate = () => {
		const d = Math.floor(initialTimeInSeconds / (3600 * 24));
		const h = Math.floor((initialTimeInSeconds % (3600 * 24)) / 3600);
		const m = Math.floor((initialTimeInSeconds % 3600) / 60);
		const s = initialTimeInSeconds % 60;

		setDays(d);
		setHours(h);
		setMinutes(m);
		setSeconds(s);
	}

	useEffect(() => {
		// Initialize the time units from the total initial time (in seconds)
		resetDate();
	}, [initialTimeInSeconds]);

	const handleSave = () => {
		// Convert everything to seconds and return the total time
		const totalSeconds = ((days * 24 * 3600) + (hours * 3600) + (minutes * 60) + seconds)*1000;
		onSave(totalSeconds);
		onClose();
	};

	const handleNumberPress = (value) => {
		// Handle input for the selected unit and update the corresponding time value
		switch (selectedUnit) {
			case 'days':
				setDays((prev) => Math.min(prev * 10 + value, 99)); // Limit to 99 days
				break;
			case 'hours':
				setHours((prev) => Math.min(prev * 10 + value, 23)); // Limit to 23 hours
				break;
			case 'minutes':
				setMinutes((prev) => {
					const totalMinutes = prev * 10 + value;
					const overflowHours = Math.floor(totalMinutes / 60);
					setHours((prevHours) => Math.min(prevHours + overflowHours, 23)); // Overflow into hours if needed
					return totalMinutes % 60;
				});
				break;
			case 'seconds':
				setSeconds((prev) => {
					const totalSeconds = prev * 10 + value;
					const overflowMinutes = Math.floor(totalSeconds / 60);
					setMinutes((prevMinutes) => Math.min(prevMinutes + overflowMinutes, 59)); // Overflow into minutes if needed
					return totalSeconds % 60;
				});
				break;
		}
	};

	const handleDeletePress = () => {
		// Clear the selected unit
		switch (selectedUnit) {
			case 'days':
				setDays(0);
				break;
			case 'hours':
				setHours(0);
				break;
			case 'minutes':
				setMinutes(0);
				break;
			case 'seconds':
				setSeconds(0);
				break;
		}
	};

	return (
		<Modal
			visible={visible}
			animationType="fade"
			transparent={true}
			onRequestClose={onClose}
		>
			<TouchableOpacity style={styles.modalOverlay} onPress={() => {
				resetDate()
				onClose()
			}} activeOpacity={1}>
				<View style={styles.modalContainer}>
					<View style={styles.modalContent}>
						{/* Header */}
						<View style={styles.header}>
							<TouchableOpacity onPress={() => {
								resetDate()
								onClose()
							}}>
								<Ionicons name="close" size={24} color="black" />
							</TouchableOpacity>
							<Text style={styles.headerTitle}>Select Time</Text>
							<TouchableOpacity onPress={handleSave}>
								<Text style={styles.doneButton}>Done</Text>
							</TouchableOpacity>
						</View>

						{/* Time Display */}
						<View style={styles.timeDisplay}>
							<TouchableOpacity
								style={[styles.timeUnit, selectedUnit === 'days' && styles.selectedUnit]}
								onPress={() => setSelectedUnit('days')}
							>
								<Text style={styles.unitText}>{days}</Text>
								<Text style={styles.unitLabel}>Days</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.timeUnit, selectedUnit === 'hours' && styles.selectedUnit]}
								onPress={() => setSelectedUnit('hours')}
							>
								<Text style={styles.unitText}>{hours}</Text>
								<Text style={styles.unitLabel}>Hours</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.timeUnit, selectedUnit === 'minutes' && styles.selectedUnit]}
								onPress={() => setSelectedUnit('minutes')}
							>
								<Text style={styles.unitText}>{minutes}</Text>
								<Text style={styles.unitLabel}>Minutes</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.timeUnit, selectedUnit === 'seconds' && styles.selectedUnit]}
								onPress={() => setSelectedUnit('seconds')}
							>
								<Text style={styles.unitText}>{seconds}</Text>
								<Text style={styles.unitLabel}>Seconds</Text>
							</TouchableOpacity>
						</View>

						{/* Number Pad */}
						<ScrollView contentContainerStyle={styles.numberPad} scrollEnabled={false}>
							{[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
								<TouchableOpacity
									key={num}
									style={styles.numberButton}
									onPress={() => handleNumberPress(num)}
								>
									<Text style={styles.numberText}>{num}</Text>
								</TouchableOpacity>
							))}
							<TouchableOpacity style={styles.numberButton} onPress={handleDeletePress}>
								<Ionicons name="backspace-outline" size={24} color="black" />
							</TouchableOpacity>
							<TouchableOpacity style={styles.numberButton} onPress={() => handleNumberPress(0)}>
								<Text style={styles.numberText}>0</Text>
							</TouchableOpacity>
						</ScrollView>
					</View>
				</View>
			</TouchableOpacity>
		</Modal>
	);
};

export default TimeSelectorModal;

const styles = StyleSheet.create({
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.3)',
	},
	modalContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	modalContent: {
		width: '90%',
		padding: 20,
		backgroundColor: 'white',
		borderRadius: 10,
		alignItems: 'center',
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		width: '100%',
		marginBottom: 20,
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: 'bold',
	},
	doneButton: {
		fontSize: 18,
		color: 'blue',
	},
	timeDisplay: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: '100%',
		marginBottom: 20,
	},
	timeUnit: {
		alignItems: 'center',
		borderWidth: 2,
		borderRadius: 10,
		borderColor: 'transparent', // Set to 'blue' to see the selected unit
		padding: 5,
		flex: 1,
	},
	selectedUnit: {
		borderColor: 'blue',
	},
	unitText: {
		fontSize: 24,
		fontWeight: 'bold',
	},
	unitLabel: {
		fontSize: 14,
		color: '#555',
	},
	numberPad: {
		display: 'flex',
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'center',
		width: '100%',
	},
	numberButton: {
		width: '30%',
		height: 50,
		// padding: 15,
		margin: 5,
		backgroundColor: '#f0f0f0',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 5,
	},
	numberText: {
		fontSize: 24,
		fontWeight: 'bold',
	},
});
