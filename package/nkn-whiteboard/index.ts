import nkn from "nkn-sdk"
import { BoardDOMEventImplementer, ChannelMode, Device, DrawingContext, DrawingModes, IBoardEngine, IChannel, IDrawCommand, INKNChannel, IReverseableDrawCommand } from "./internals/types"
import { throttle, makeRandomName } from "./utils"
import { FreeHandDrawCommand } from "./internals/impl/FreeHandCommand"
import { TextCommand } from "./internals/impl/TextCommand"
import { RectShapeCommand } from "./internals/impl/RectShapeCommand"
import { CirclShapeCommand } from "./internals/impl/CircleShapeCommand"
import { EraseCommand } from "./internals/impl/EraseCommand"
import { Channel, TransferData, UserSpaceEvents } from "./channel"
import { BoardControlEvent, CanvasEvent, CanvasModes, ChannelMouseEvent, NewDeviceEvent, RedoEvent, UndoEvent } from "./utils/event"
export * from "../nkn-whiteboard/internals/types"
export function createBoard(option?: nkn.Client): IBoardEngine {
    if (option) {
        let _board = new NKNWhiteBoard()
        return _board
    } else {
        let _board = new NKNWhiteBoard()
        return _board
    }
}

class NKNWhiteBoard implements IBoardEngine, BoardDOMEventImplementer {
    private _prevCommandList: (any)[] = []
    private _redoList: CanvasEvent[] = []
    private _cntx: DrawingContext
    private _device: Device

    constructor() {
        this._prevCommandList = []
        this._cntx = new DrawingContext()
        this._device = new Device()
        this._device.id = makeRandomName(8)
    }

    muteMic(): void {
        (this._cntx.channel as IChannel).muteMic()
    }

    unMuteMic(): void {
        (this._cntx.channel as IChannel).unMuteMic(this._cntx)
    }

    muteSpeaker(): void {
        (this._cntx.channel as IChannel).muteSpeaker()
    }

    unMuteSpeaker(): void {
        (this._cntx.channel as IChannel).unMuteSpeaker(this._cntx)
    }

    setDrawMode(mode: string) {
        console.log("[setDrawMode called]")
        this._cntx.mode = mode
        if (this._redoList.length > 0) this._redoList = []
        if (this._cntx.channel_mode === ChannelMode.PUBLISHER) {
            let ch = this._cntx.channel as INKNChannel
            let board_ev = new BoardControlEvent()
            board_ev.eventName = "modeChange"
            board_ev.data = mode
            let transferData = {
                name: BoardControlEvent.OBJECT_NAME,
                value: board_ev
            }
            ch.publishDataChannel(transferData, this._cntx)
        }
        switch (this._cntx.mode) {
            case DrawingModes.FREE_HAND:
                this._cntx.currentCommand = new FreeHandDrawCommand()
                this._prevCommandList.push({
                    type: FreeHandDrawCommand.OBJECT_NAME,
                    data: this._cntx.currentCommand
                })
                break;
            case DrawingModes.TEXT:
                this._cntx.currentCommand = new TextCommand()
                this._prevCommandList.push({
                    type: TextCommand.OBJECT_NAME,
                    data: this._cntx.currentCommand
                })
                break
            case DrawingModes.RECT_SHAPE:
                this._cntx.currentCommand = new RectShapeCommand()
                this._prevCommandList.push({
                    type: RectShapeCommand.OBJECT_NAME,
                    data: this._cntx.currentCommand
                })
                break;
            case DrawingModes.CIRCLE_SHAPE:
                this._cntx.currentCommand = new CirclShapeCommand()
                this._prevCommandList.push({
                    type: CirclShapeCommand.OBJECT_NAME,
                    data: this._cntx.currentCommand
                })
                break;
            case DrawingModes.ERASER:
                this._cntx.currentCommand = new EraseCommand()
                this._prevCommandList.push({
                    type: EraseCommand.OBJECT_NAME,
                    data: this._cntx.currentCommand
                })
                break;

        }
    }
    onMouseDown(ev: MouseEvent): void {
        this.setDrawMode(this._cntx.mode)
        return this._cntx.currentCommand?.onMouseDown(ev, this._cntx)
    }
    onMouseUp(ev: MouseEvent): void {

        return this._cntx.currentCommand?.onMouseUp(ev, this._cntx)
    }
    onMouseOut(ev: MouseEvent): void {

        return this._cntx.currentCommand?.onMouseOut(ev, this._cntx)
    }
    onMouseMove(ev: MouseEvent): void {

        return this._cntx.currentCommand?.onMouseMove(ev, this._cntx)
    }

    _canvas: HTMLCanvasElement | null = null

    initCanvas(data: HTMLCanvasElement | string, AutoSetDim?: boolean) {
        if (typeof data === "string") {
            this._canvas = document.getElementById(data) as HTMLCanvasElement

        } else {
            this._canvas = data
        }
        if (AutoSetDim) {
            this._canvas.width = this._canvas.offsetWidth
            this._canvas.height = this._canvas.offsetHeight
        }

        if (this._cntx) {
            this._cntx.canvasCtx = this._canvas.getContext("2d")

        }

    }

    private removeCanvasEventListener() {
        this._canvas?.removeEventListener("mousedown", this.onMouseDown.bind(this), false);
        this._canvas?.removeEventListener("mouseup", this.onMouseUp.bind(this), false);
        this._canvas?.removeEventListener("mouseout", this.onMouseUp.bind(this), false);
        this._canvas?.removeEventListener("mousemove", throttle(this.onMouseMove.bind(this), 10), false);
    }

    private listenToCanvasEvents() {
        console.log("[listenToCanvasEvents] listening to canvas element")
        if (this._cntx.channel_mode === ChannelMode.PUBLISHER) {
            this._canvas?.addEventListener("mousedown", this.onMouseDown.bind(this), false);
            this._canvas?.addEventListener("mouseup", this.onMouseUp.bind(this), false);
            this._canvas?.addEventListener("mouseout", this.onMouseUp.bind(this), false);
            this._canvas?.addEventListener("mousemove", throttle(this.onMouseMove.bind(this), 10), false);
        } else {
            // Changes peculiar to subscribers
            let channel = this._cntx.channel as INKNChannel
            channel.onDataMessage(data => {
                console.log("Received message " + data.name)
                if (data.name === CanvasEvent.OBJECT_NAME) {
                    let c_ev = data.value as CanvasEvent
                    this.drawFromCanvasEvents(c_ev)
                    this._cntx.prevCanvasEventCommands.push(c_ev)
                }

                if (data.name === UndoEvent.OBJECT_NAME) {
                    this.boardUndo()
                }

                if (data.name === RedoEvent.OBJECT_NAME) {
                    this.boardRedo()
                }
            })
        }
    }

    private drawFromCanvasEvents(c_ev: CanvasEvent) {
        let ctx = this._cntx
        switch (c_ev.mode) {
            case CanvasModes.ELLIPSE:
                if (ctx.canvasCtx) {
                    ctx.canvasCtx?.beginPath()
                    ctx.canvasCtx.strokeStyle = ctx.stroke.color
                    //@ts-ignore
                    ctx.canvasCtx?.ellipse(...c_ev.args)
                    ctx.canvasCtx?.stroke()
                }
                break
            case CanvasModes.ERASER:
                if (ctx.canvasCtx) {
                    ctx.canvasCtx.globalCompositeOperation = "destination-out"
                    ctx.canvasCtx?.beginPath()
                    //@ts-ignore
                    ctx.canvasCtx.arc(...c_ev.args)
                    ctx.canvasCtx.fill()
                    ctx.canvasCtx.globalCompositeOperation = "source-over"
                }
                break
            case CanvasModes.LINE:
                if (!ctx.canvasCtx) break
                ctx.canvasCtx.beginPath()
                ctx.canvasCtx.moveTo(c_ev.args[0], c_ev.args[1])
                ctx.canvasCtx.lineTo(c_ev.args[2], c_ev.args[3])
                ctx.canvasCtx.strokeStyle = ctx.stroke.color
                ctx.canvasCtx.lineWidth = ctx.stroke.width
                ctx.canvasCtx.stroke()
                ctx.canvasCtx.closePath()
                break
            case CanvasModes.RECT:
                if (ctx.canvasCtx) {
                    ctx.canvasCtx?.beginPath()
                    ctx.canvasCtx.strokeStyle = ctx.stroke.color
                    //@ts-ignore
                    ctx.canvasCtx?.strokeRect(...c_ev.args)

                }
                break
            case CanvasModes.TEXT:
                if (ctx.canvasCtx) {
                    ctx.canvasCtx.font = '18px serif';
                    //@ts-ignore
                    ctx.canvasCtx.fillText(...c_ev.args);
                }
                break
        }
    }


    private listenToChannelEvent() {
        let channel = this._cntx.channel as INKNChannel
        channel.onDataMessage(data => {
            switch (data.name) {
                case NewDeviceEvent.OBJECT_NAME:
                    let nev = data.value as NewDeviceEvent
                    channel.callevent(UserSpaceEvents.NEW_DEVICE, nev.device)
                    break;
            }
        })
    }



    private systemDrawAll() {
        if (this._canvas) {
            this._cntx.canvasCtx?.clearRect(0, 0, this._canvas.width, this._canvas.height)
        }

        this._cntx.prevCanvasEventCommands.forEach(c_ev => {
            this.drawFromCanvasEvents(c_ev)
        })

    }

    boardRedo() {
        console.log("whiteboard redo")
        if (this._redoList.length > 0) {
            if (this._cntx.channel_mode === ChannelMode.PUBLISHER) {
                let channel = this._cntx.channel as INKNChannel
                let td = new TransferData(RedoEvent.OBJECT_NAME, new RedoEvent())
                channel.publishDataChannel(td)
            }
            let command = this._redoList.pop() as CanvasEvent
            this._cntx.prevCanvasEventCommands.push(command)
            this.systemDrawAll()
        }
    }
    boardUndo() {
        console.log("whiteboard undo")
        if (this._cntx.prevCanvasEventCommands.length > 0) {
            if (this._cntx.channel_mode === ChannelMode.PUBLISHER) {
                let channel = this._cntx.channel as INKNChannel
                let td = new TransferData(UndoEvent.OBJECT_NAME, new UndoEvent())
                channel.publishDataChannel(td)
            }
            let command = this._cntx.prevCanvasEventCommands.pop() as CanvasEvent
            this._redoList.push(command)
            this.systemDrawAll()
        }
    }

    startChannel(channelName?: string, opts?: any): IChannel {
        this._cntx.channel_mode = ChannelMode.PUBLISHER
        let _channelName
        if (channelName) {
            _channelName = channelName
        } else {
            _channelName = makeRandomName(12)
        }

        let channel = new Channel(_channelName)
        channel.subscribeDataChannel(this._cntx)
        this._cntx.channel = channel
        channel.onConnect(() => {
            this.listenToCanvasEvents()
            this.listenToChannelEvent()
        })
       
        return channel as IChannel
    }

    sendMessage() {
        let ch = this._cntx.channel as INKNChannel
        ch.publishDataChannel("sentData", this._cntx)
    }

    joinChannel(channelName: string, opt?: {}): IChannel {
        this._cntx.channel_mode = ChannelMode.SUBSCRIBER
        let channel = new Channel(channelName)
        channel.subscribeDataChannel(this._cntx)
        // let nde = new NewDeviceEvent()
        // nde.device = this._device
        // let td = new TransferData(NewDeviceEvent.OBJECT_NAME, nde)
        // channel.publishDataChannel(td)
        this._cntx.channel = channel
        channel.onConnect(() => {
            this.listenToCanvasEvents()
            this.listenToChannelEvent()
        })
        return channel
    }

    getChannelName() {
        let ch = this._cntx.channel as IChannel
        //@ts-ignore
        return ch.channelName
    }
}

export default { createBoard }