export function DateTime(nano: bigint): { date: string; time: string } {
	if (nano === 0n) {
		return {
			date: "----/--/--",
			time: "--:--:--",
		}
	}

	const d = Temporal.Instant
		.fromEpochNanoseconds(nano)
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
