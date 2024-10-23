import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TimerSettingsModal = ({ visible, onClose, onSave, timer, onDelete }) => {
	const [label, setLabel] = useState(timer.label || '');
	const [time, setTime] = useState(timer.initialTime || 0); // Assume time is in seconds
	const [color, setColor] = useState(timer.color || '#000000'); // Assume color is stored as a string

	// Function to handle saving changes
	const handleSave = () => {
		onSave({ ...timer, label, initialTime: time, color });
		onClose();
	};

	useEffect(() => {
		setLabel(timer.label)
		setTime(timer.initialTime)
		setColor(timer.color)
	}, [timer]);

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
						<TouchableOpacity onPress={onClose}>
							<Ionicons name="close" size={24} color="black" />
						</TouchableOpacity>
						<Text style={styles.headerTitle}>{timer.type} Timer</Text>
						<TouchableOpacity onPress={handleSave}>
							<Text style={styles.doneButton}>Done</Text>
						</TouchableOpacity>
					</View>

					{/* Editable Fields */}
					<View style={styles.inputContainer}>
						<Text style={styles.inputLabel}>Label</Text>
						<TextInput
							style={styles.input}
							value={label}
							onChangeText={setLabel}
						/>

						<Text style={styles.inputLabel}>Time (in seconds)</Text>
						<TextInput
							style={styles.input}
							value={time.toString()}
							keyboardType="numeric"
							onChangeText={(value) => setTime(Number(value))}
						/>

						<Text style={styles.inputLabel}>Color</Text>
						<TextInput
							style={styles.input}
							value={color}
							onChangeText={setColor}
						/>
					</View>

					{/* Delete Timer Button */}
					<TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
						<Text style={styles.deleteButtonText}>Delete Timer</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	modalContainer: {
		flex: 1,
		justifyContent: 'flex-end',
		backgroundColor: 'rgba(0, 0, 0, 0.5)', // Transparent background with dark overlay
	},
	modalContent: {
		height: '95%', // Almost full screen, leaving some space at the top
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
		marginBottom: 15,
	},
	deleteButton: {
		marginTop: 20,
		backgroundColor: 'red',
		padding: 15,
		borderRadius: 10,
		alignItems: 'center',
	},
	deleteButtonText: {
		color: 'white',
		fontSize: 18,
	},
});


export default TimerSettingsModal;
