import { List } from "@/bridge/BridgeList"
import { Modal } from "@/bridge/BridgeModal"
import { System } from "@/bridge/BridgeSystem"
import { Viewer } from "@/bridge/BridgeViewer"
import { Status } from "@/bridge/Status"

export { List }
export { Modal }
export { System }
export { Viewer }
export { Status }

export interface BrowserToRenderer {
	[System.Active.CH]: [-1, System.Active.Data]
	[System.Version.CH]: [-1, System.Version.Data]
	[List.Change.CH]: [number, List.Change.Data]
	[List.Scan.CH]: [number, List.Scan.Data]
	[List.Active.CH]: [number, List.Active.Data]
	[List.Cursor.CH]: [number, List.Cursor.Data]
	[List.Attribute.CH]: [number, List.Attribute.Data]
	[List.Change.CH]: [number, List.Change.Data]
	[List.Mark.CH]: [number, List.Mark.Data]
	[List.Watch.CH]: [number, List.Watch.Data]
	[Modal.Open.CH]: [-1, Modal.Open.Data]
	[Modal.Cancel.CH]: [-1, Modal.Cancel.Data]
	[Viewer.Open.CH]: [-1, Viewer.Open.Data]
	[Viewer.Close.CH]: [-1, Viewer.Close.Data]
	[Viewer.Diff.CH]: [-1, Viewer.Diff.Data]
	[Viewer.Audio.CH]: [-1, Viewer.Audio.Data]
	[Viewer.Video.CH]: [-1, Viewer.Video.Data]
}

export interface RendererToBrowser {
	[List.Drag.CH]: [-1, List.Drag.Data]
	[List.Dom.CH]: [number, List.Dom.Data]
	[Modal.Event.CH]: [-1, Modal.Event.Data]
	[Viewer.Event.CH]: [-1, Viewer.Event.Data]
}

export interface Invokel {
	[System.Dom.CH]: [-1, System.Dom.Data, System.Dom.Result]
}
