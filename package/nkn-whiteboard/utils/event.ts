import { Device } from "../internals/types"

export interface IChannelTransmittable{
    serialize() : any
    deserialize(data : any) : any
}
//@ts-ignore
export class ChannelMouseEvent implements MouseEvent, IChannelTransmittable{
    offsetX : number = 0
    offsetY : number = 0
    clientX : number = 0
    clientY : number = 0
    tool : string = ""
    eventName : string = ""
    serialize() {
        return this
    }
    static deserialize(data: any) {
        return data
    }
    static OBJECT_NAME = "channel_mouse_event"
    constructor(eventName ?: string) {
        if(eventName){
            this.eventName = eventName
        }
    }
}

export class UndoEvent {
    static OBJECT_NAME = "undo_event"
}

export class RedoEvent {
    static OBJECT_NAME = "redo_event"
}

export enum CanvasModes{
    ELLIPSE = "ellipse",
    RECT = "rect",
    LINE = "line",
    TEXT = "text",
    ERASER = "eraser"
}
export class CanvasEvent {
    static OBJECT_NAME = "canvas_event"
    mode : string = ""
    args: any[] = []
}
export class BoardControlEvent {
    static OBJECT_NAME = "board_event"
    eventName = "modeChange" || "none"
    data : any
}

export class NewDeviceEvent {
    static OBJECT_NAME = "new_device_event"
    device : Device | null = null
}

export class TransferPublishRight{}