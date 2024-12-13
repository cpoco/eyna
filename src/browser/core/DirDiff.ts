import * as Native from "@eyna/native/lib/browser"

type Diff = {
	base: [string, string]
	list: Item[]
	cnt: [number, number]
}
type Item = {
	type: [Native.AttributeFileType, Native.AttributeFileType]
	rltv: string
}

export class DirDiff {
	static diff(wd1: string, wd2: string, depth: number, cb: (diff: Diff) => void) {
		Promise.all([
			Native.getDirectory(wd1, wd1, false, depth),
			Native.getDirectory(wd2, wd2, false, depth),
		]).then((all) => {
			const diff: Diff = {
				base: [wd1, wd2],
				list: [],
				cnt: [0, 0],
			}

			while (diff.cnt[0] < all[0].list.length && diff.cnt[1] < all[1].list.length) {
				const data1 = all[0].list[diff.cnt[0]]!
				const data2 = all[1].list[diff.cnt[1]]!

				if (data1.rltv == data2.rltv) {
					diff.list.push({
						type: [data1.type, data2.type],
						rltv: data1.rltv,
					})
					diff.cnt[0]++
					diff.cnt[1]++
				}
				else if (data1.rltv < data2.rltv) {
					diff.list.push({
						type: [data1.type, Native.AttributeFileType.None],
						rltv: data1.rltv,
					})
					diff.cnt[0]++
				}
				else {
					diff.list.push({
						type: [Native.AttributeFileType.None, data2.type],
						rltv: data2.rltv,
					})
					diff.cnt[1]++
				}
			}

			while (diff.cnt[0] < all[0].list.length) {
				const data1 = all[0].list[diff.cnt[0]]!
				diff.list.push({
					type: [data1.type, Native.AttributeFileType.None],
					rltv: data1.rltv,
				})
				diff.cnt[0]++
			}

			while (diff.cnt[1] < all[1].list.length) {
				const data2 = all[1].list[diff.cnt[1]]!
				diff.list.push({
					type: [Native.AttributeFileType.None, data2.type],
					rltv: data2.rltv,
				})
				diff.cnt[1]++
			}

			cb(diff)
		})
	}
}
