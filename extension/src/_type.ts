export enum AttributeFileType {
	homeuser = -2,
	drive = -1,
	none = 0,
	directory = 1,
	link = 2,
	file = 3,
	special = 10,
}

export enum AttributeLinkType {
	none = 0,
	symbolic = 1,
	junction = 2,
	shortcut = 3,
	bookmark = 4,
}
