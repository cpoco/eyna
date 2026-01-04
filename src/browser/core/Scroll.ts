export class Scroll {
	public screenSize: number

	public contentsSize: number
	public contentsCount: number
	public contentsPosition: number = 0

	private static readonly KnobMinSize: number = 16
	public knobSize: number = 0
	public knobPosition: number = 0

	constructor(screenSize: number = 1, contentsSize: number = 1, contentsCount: number = 0) {
		this.screenSize = screenSize
		this.contentsSize = contentsSize
		this.contentsCount = contentsCount
	}

	public update() {
		// 表示位置更新
		this.contentsPosition = Math.max(
			0,
			Math.min(this.contentsPosition, (this.contentsSize * this.contentsCount) - this.screenSize),
		)

		const r = Math.min(1, (this.screenSize - Scroll.KnobMinSize) / (this.contentsSize * this.contentsCount))
		this.knobPosition = this.contentsPosition * r
		this.knobSize = Math.min(this.screenSize, this.screenSize * r + Scroll.KnobMinSize)
	}

	public drawCount() {
		return Math.ceil(this.screenSize / this.contentsSize)
	}

	public drawIndex(i: number): number {
		return i + Math.floor(this.contentsPosition / this.contentsSize)
	}

	public drawPosition(i: number): number {
		return (this.contentsSize * i) - Math.floor(this.contentsPosition % this.contentsSize)
	}
}
