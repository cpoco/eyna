export function DateTime(sec: number): { date: string; time: string } {
	if (sec === 0) {
		return {
			date: "----/--/--",
			time: "--:--:--",
		}
	}

	const d = Temporal.Instant
		.fromEpochMilliseconds(sec * 1000)
		.toZonedDateTimeISO(Temporal.Now.timeZoneId())

	return {
		date: [
			d.year,
			d.month.toString().padStart(2, "0"),
			d.day.toString().padStart(2, "0"),
		].join("/"),
		time: [
			d.hour.toString().padStart(2, "0"),
			d.minute.toString().padStart(2, "0"),
			d.second.toString().padStart(2, "0"),
		].join(":"),
	}
}
