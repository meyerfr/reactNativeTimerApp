export const formatTimeDisplay = (totalMilliseconds) => {
	const timeInSeconds = Math.floor(totalMilliseconds / 1000);

	const days = Math.floor(timeInSeconds / (3600 * 24));
	const hours = Math.floor((timeInSeconds % (3600 * 24)) / 3600);
	const minutes = Math.floor((timeInSeconds % 3600) / 60);
	const seconds = (timeInSeconds % 60);

	let display = '';
	if (days > 0) {
		display += `${days}d `;
	}
	if (hours > 0 || days > 0) {
		display += `${hours}h `;
	}
	if (minutes > 0 || hours > 0 || days > 0) {
		display += `${minutes}m `;
	}
	display += `${seconds}s`;

	return display.trim();
};
