import * as Bridge from "@/bridge/Bridge"
import { AbstractFragment } from "@/browser/fragment/AbstractFragment"
import root from "@/browser/Root"

export class NavbarFragment extends AbstractFragment {
	setTitle(title: string): void {
		root.send<Bridge.Navbar.Title.Send>({
			ch: Bridge.Navbar.Title.CH,
			args: [-1, title],
		})
	}
}
