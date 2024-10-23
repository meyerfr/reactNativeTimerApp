import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Icons from Expo

const TimerOptionsModal = ({ visible, onClose, modalHandlers: {onStartPause, onReset, onDelete, onEdit}, isRunning, hasStarted, timerPosition }) => {
	return (
		<Modal
			transparent={true}
			visible={visible}
			animationType="fade"
			onRequestClose={onClose}
		>
			<TouchableOpacity style={styles.modalOverlay} onPress={onClose} activeOpacity={1}>
				<View style={[styles.modalContainer, { top: timerPosition.top, left: timerPosition.left }]}>
					{/* Start/Pause Option */}
					<TouchableOpacity style={styles.option} onPress={onStartPause}>
						<Ionicons name={isRunning ? 'pause' : 'play'} size={24} color="black" />
						<Text style={styles.optionText}>{isRunning ? 'Pause' : 'Start'}</Text>
					</TouchableOpacity>

					{/* Conditionally show the Reset option */}
					{hasStarted && (
						<TouchableOpacity style={styles.option} onPress={onReset}>
							<Ionicons name="refresh" size={24} color="black" />
							<Text style={styles.optionText}>Reset</Text>
						</TouchableOpacity>
					)}

					{/* Edit Option */}
					<TouchableOpacity style={styles.option} onPress={onEdit}>
						<Ionicons name="create-outline" size={24} color="black" />
						<Text style={styles.optionText}>Edit</Text>
					</TouchableOpacity>

					{/* Delete Option */}
					<TouchableOpacity style={styles.option} onPress={onDelete}>
						<Ionicons name="trash" size={24} color="black" />
						<Text style={styles.optionText}>Delete</Text>
					</TouchableOpacity>
				</View>
			</TouchableOpacity>
		</Modal>
	);
};

const styles = StyleSheet.create({
	modalOverlay: {
		flex: 1,
		// justifyContent: 'center',
		// alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	modalContainer: {
		position: 'absolute', // Allow the modal to be absolutely positioned
		width: 250, // Set the width of the modal
		padding: 20,
		backgroundColor: 'white',
		borderRadius: 10,
		elevation: 10,
	},
	option: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 10,
	},
	optionText: {
		fontSize: 18,
		marginLeft: 10,
	},
});

export default TimerOptionsModal;
