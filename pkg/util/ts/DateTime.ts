export function DateTime(sec: number): { date: string; time: string } {
	if (sec === 0) {
		return {
			date: "----/--/--",
			time: "--:--:--",
		}
	}

	const d = new Date(sec * 1000)

	return {
		date: [
			d.getFullYear(),
			(d.getMonth() + 1).toString().padStart(2, "0"),
			d.getDate().toString().padStart(2, "0"),
		].join("/"),
		time: [
			d.getHours().toString().padStart(2, "0"),
			d.getMinutes().toString().padStart(2, "0"),
			d.getSeconds().toString().padStart(2, "0"),
		].join(":"),
	}
}
