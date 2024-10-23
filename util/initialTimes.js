const getInitialTime = (type) => {
	switch (type) {
		case 'pomodoro':
			return 100; // 25 minutes
		case 'stopwatch':
			return 0;
		case 'interval':
			return 1000;
		case 'standard':
		default:
			return 300; // 5 minutes
	}
}

export default getInitialTime
