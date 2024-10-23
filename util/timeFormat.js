// Format time to MM:SS for non-stopwatch timers
const formatTime = (timeInSeconds) => {
	const minutes = Math.floor(timeInSeconds / 60);
	const seconds = timeInSeconds % 60;
	return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Format time to SS.SSS for stopwatch
const formatStopwatchTime = (timeInMilliseconds) => {
	const seconds = Math.floor(timeInMilliseconds / 1000);
	const milliseconds = timeInMilliseconds % 1000;
	return `${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
};

export { formatTime, formatStopwatchTime };