import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import ColorPicker, { Panel1, Swatches, HueSlider } from 'reanimated-color-picker';
import TimeSelectorModal from './TimeSelectorModal';
import { formatTimeDisplay } from "./formatTimeDisplay" // Assume this is another modal for selecting time

const TimerSettingsModal = ({ visible, onClose, onSave, timer, onDelete }) => {
	const [label, setLabel] = useState(timer.label || '');
	const [time, setTime] = useState(timer.initialTime || 0); // Time in seconds
	const [color, setColor] = useState(timer.color || '#000000'); // Color stored as a string
	const [type, setType] = useState(timer.type); // Timer type (Pomodoro, Stopwatch, etc.)
	const [timeModalVisible, setTimeModalVisible] = useState(false); // Control time selector visibility
	const [showColorWheel, setShowColorWheel] = useState(false); // Control time selector visibility

	// Function to handle saving changes
	const handleSave = () => {
		onSave({ ...timer, label, initialTime: time, color, type });
		onClose();
	};

	useEffect(() => {
		setLabel(timer.label);
		setTime(timer.initialTime);
		setColor(timer.color);
		setType(timer.type);
	}, [timer]);

	// Handle scrolling - auto-close modal if scrolled too far
	const handleScroll = (event) => {
		const offsetY = event.nativeEvent.contentOffset.y;
		if (offsetY > 100) { // Customize this value as needed
			onClose();
		}
	};

	const handleCancelColor = () => {
		setColor(timer.color)
		setShowColorWheel(false)
	}

	const handleCancel = () => {
		setLabel(timer.label);
		setTime(timer.initialTime);
		setColor(timer.color);
		setType(timer.type);

		onClose()
	}

	return (
		<Modal
			visible={visible}
			animationType="slide"
			transparent={true}
			onRequestClose={onClose}
		>
			<View style={styles.modalContainer}>
				<View style={styles.modalContent}>
					{/* Header */}
					<View style={styles.header}>
						<TouchableOpacity onPress={handleCancel}>
							<Ionicons name="close" size={24} color="black" />
						</TouchableOpacity>
						<Text style={styles.headerTitle}>{type} Timer</Text>
						<TouchableOpacity onPress={handleSave}>
							<Text style={styles.doneButton}>Done</Text>
						</TouchableOpacity>
					</View>

					{/* ScrollView for Content */}
					<ScrollView
						onScroll={handleScroll}
						scrollEventThrottle={16}
						contentContainerStyle={styles.scrollContainer}
					>
						{/* Editable Fields */}
						<View style={styles.inputContainer}>
							<Text style={styles.inputLabel}>Label</Text>
							<TextInput
								style={styles.input}
								value={label}
								onChangeText={setLabel}
							/>

							{/* Time Selector */}
							<Text style={styles.inputLabel}>Time</Text>
							<TouchableOpacity style={styles.timeSelector} onPress={() => setTimeModalVisible(true)}>
								<Text>{formatTimeDisplay(time)}</Text>
							</TouchableOpacity>

							{/* Time Selector Modal */}
							<TimeSelectorModal
								visible={timeModalVisible}
								onClose={() => setTimeModalVisible(false)}
								onSave={(selectedTime) => setTime(selectedTime)}
								initialTime={time/1000}
							/>

							{/* Color Selection */}
							<Text style={[styles.inputLabel, {marginBottom: 8}]}>Color</Text>
							<View style={styles.colorSelectionContainer}>
								{/* Selected Color Display */}
								<View style={[{ backgroundColor: color }, styles.selectedColor]} />
								{/* Swatches for Predefined Colors */}
								<ColorPicker
									value={color}
									onComplete={({ rgba }) => setColor(rgba)}
								>
									<Swatches
										style={{ flexDirection: 'row', alignItems: 'center' }}
										swatchStyle={{ marginBottom: 0 }}
										colors={['#FF6347', '#4682B4', '#32CD32', '#FFD700']}
										onSelect={({ rgba }) => setColor(rgba)}
									/>
								</ColorPicker>

								{/* Icon to Open Color Wheel Modal */}
								<TouchableOpacity onPress={() => setShowColorWheel(true)} style={styles.colorWheelButton}>
									<Ionicons name="color-palette-outline" size={24} color="#000" />
								</TouchableOpacity>
							</View>

							{/* Color Wheel Modal */}
							<Modal
								visible={showColorWheel}
								animationType="fade"
								transparent={true}
								onRequestClose={() => setShowColorWheel(false)}
							>
								<View style={styles.colorWheelModal}>
									<View style={styles.colorWheelContainer}>
										<ColorPicker
											style={{ width: '100%',  }}
											value={color}
											onComplete={({ rgba }) => setColor(rgba)}
										>
											<Panel1
												verticalChannel='brightness'
												style={{borderRadius: 0}}
											/>
											<HueSlider style={{marginVertical: 10, marginHorizontal: 15}} />
										</ColorPicker>
										{/* Close Button for Color Wheel Modal */}
										<View style={styles.colorWheelButtonsContainer}>
											<TouchableOpacity
												style={styles.closeColorWheelButton}
												onPress={handleCancelColor}
											>
												<Text style={styles.closeColorWheelButtonText}>Cancel</Text>
											</TouchableOpacity>
											<TouchableOpacity
												style={[{borderRightWidth: 0}, styles.closeColorWheelButton]}
												onPress={() => setShowColorWheel(false)}
											>
												<Text style={styles.closeColorWheelButtonText}>Done</Text>
											</TouchableOpacity>
										</View>
									</View>
								</View>
							</Modal>

							{/* Timer Type Selector */}
							<Text style={styles.inputLabel}>Timer Type</Text>
							<View style={styles.typeSelector}>
								{['Pomodoro', 'Standard', 'Stopwatch', 'Interval'].map((timerType) => (
									<TouchableOpacity
										key={timerType}
										style={[
											styles.typeOption,
											type === timerType && styles.selectedTypeOption,
										]}
										onPress={() => setType(timerType)}
									>
										<Text style={styles.typeOptionText}>{timerType}</Text>
									</TouchableOpacity>
								))}
							</View>
						</View>

						{/* Delete Timer Button */}
						<TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
							<Ionicons name="trash-outline" size={24} color="gray" />
							<Text style={styles.deleteButtonText}>Delete Timer</Text>
						</TouchableOpacity>
					</ScrollView>
				</View>
			</View>
		</Modal>
	);
};

export default TimerSettingsModal;

const styles = StyleSheet.create({
	modalContainer: {
		flex: 1,
		justifyContent: 'flex-end',
		backgroundColor: 'rgba(0, 0, 0, 0.5)', // Transparent background with dark overlay
	},
	modalContent: {
		height: '90%', // Almost full screen, leaving some space at the top
		backgroundColor: 'white',
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		padding: 20,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 20,
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: 'bold',
	},
	doneButton: {
		fontSize: 18,
		color: 'blue',
		marginLeft: 10,
	},
	scrollContainer: {
		paddingBottom: 20,
	},
	inputContainer: {
		marginBottom: 20,
	},
	inputLabel: {
		fontSize: 16,
		fontWeight: 'bold',
		marginBottom: 5,
	},
	input: {
		height: 40,
		borderColor: '#ccc',
		borderWidth: 1,
		borderRadius: 5,
		paddingHorizontal: 10,
		marginBottom: 20,
	},
	timeSelector: {
		paddingVertical: 15,
		paddingHorizontal: 10,
		borderColor: '#ccc',
		borderWidth: 1,
		borderRadius: 5,
		marginBottom: 20,
	},
	typeSelector: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		marginBottom: 20,
	},
	typeOption: {
		padding: 10,
		borderRadius: 10,
		borderColor: '#ccc',
		borderWidth: 1,
	},
	selectedTypeOption: {
		backgroundColor: '#4682B4',
	},
	typeOptionText: {
		color: '#000',
	},
	colorSelectionContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 20,
	},
	selectedColor: {
		width: 40,
		height: 40,
		borderRadius: 5,
		marginRight: 20,
	},
	colorWheelButton: {
		marginLeft: 10,
	},
	colorWheelModal: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.7)',
	},
	colorWheelContainer: {
		backgroundColor: 'white',
		borderRadius: 10,
		overflow: 'hidden',
		width: '80%',
		alignItems: 'center',
	},
	colorWheelButtonsContainer: {
		flexDirection: 'row',
	},
	closeColorWheelButton: {
		flex: 1,
		padding: 10,
		backgroundColor: '#fff',
		borderRightWidth: 1,
		borderTopWidth: 1,
		borderColor: '#ccc',
	},
	closeColorWheelButtonText: {
		textAlign: 'center',
		color: '#000',
		fontSize: 16,
	},
	deleteButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		padding: 15,
		borderRadius: 10,
		backgroundColor: '#f5f5f5',
	},
	deleteButtonText: {
		color: 'gray',
		marginLeft: 10,
		fontSize: 16,
	},
});
