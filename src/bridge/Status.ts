export const Status = {
	none: 0,
	active: 1,
	target: 2,
} as const
export type StatusTypes = typeof Status[keyof typeof Status]
