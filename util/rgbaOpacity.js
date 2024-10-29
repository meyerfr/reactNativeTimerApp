export const rgbaOpacity = (color, opacity) => {
	return color.replace(/[^,]+(?=\))/, opacity)
}