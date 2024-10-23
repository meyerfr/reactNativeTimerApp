const getColorByType = (type) => {
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

export default getColorByType
