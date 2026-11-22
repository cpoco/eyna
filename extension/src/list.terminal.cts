module.exports = async (ex: Extension): Promise<void> => {
	ex.util.spawn("extension.list.terminal")
}
