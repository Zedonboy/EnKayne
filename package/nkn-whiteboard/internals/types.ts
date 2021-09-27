import nkn from "nkn-sdk"
import { CanvasEvent } from "../utils/event"

export class Device {
    id: string = ""
}
export interface IReverseableDrawCommand {
    undo(ctx : DrawingContext) : boolean
    redo(ctx : DrawingContext) : boolean
    draw(ctx : DrawingContext) : void
}
export interface BoardDOMEventImplementer {
    onMouseDown(ev: MouseEvent): void
    onMouseUp(ev: MouseEvent): void
    onMouseOut(ev: MouseEvent): void
    onMouseMove(ev: MouseEvent): void
}

export interface CommandDOMEventImplementer {
    onMouseDown(ev: MouseEvent, ctx: DrawingContext): void
    onMouseUp(ev: MouseEvent, ctx: DrawingContext): void
    onMouseOut(ev: MouseEvent, ctx: DrawingContext): void
    onMouseMove(ev: MouseEvent, ctx: DrawingContext): void
}
export enum DrawingModes {
    FREE_HAND = "freeHand",
    NONE = "none",
    TEXT = "text",
    RECT_SHAPE = "rect_shape",
    CIRCLE_SHAPE = "circle_shape",
    ERASER = "eraser"
}

export interface IProcessor {
    decode(data : string | Uint8Array) : any
    encode(data : any) : string | Uint8Array
}

export enum ChannelMode {
    PUBLISHER = "publisher",
    SUBSCRIBER = "subscriber"
}
export interface INKNChannel {
    publishDataChannel(data : any, ctx ?: DrawingContext) : void
    subscribeDataChannel(ctx :DrawingContext): any
    unsubscribeDataChannel(ctx :DrawingContext): any
    onDataMessage(cb : (data : any) => void) : void
    addDataMessageProcessor(processor : IProcessor) : void
    publishAudioChannel() : void
    subscribeAudioChannel() : void
    unsubscribeAudioChannel(): void
    callevent(eventName : string, data ?: any) : void
    onConnect(cb : () => void) : void
    
    
}
export interface IChannel {
    listenTo(event : string, cb : () => void) : void
    muteMic():void
    muteSpeaker():void
    unMuteMic(ctx : DrawingContext):void
    unMuteSpeaker(ctx:DrawingContext):void
}
export interface IBoardEngine {
    setDrawMode(mode: string): void
    initCanvas(data: HTMLCanvasElement | string, auto?: boolean): void
    boardUndo() : void
    boardRedo() : void
    startChannel(channelName ?: string, opt ?: {}) :IChannel
    joinChannel(channelName : string, opt ?: {}) :IChannel
    getChannelName() : string
    muteMic():void
    unMuteMic():void
    muteSpeaker():void
    unMuteSpeaker():void
}

export class DrawingContext {
    originCoord: { x: number, y: number }
    stroke: { width: number, color: string }
    mode: string
    currentCommand: IDrawCommand | null
    isDrawing: boolean
    nknClient: nkn.Client | null = null
    canvasCtx : CanvasRenderingContext2D | null = null
    systemUndo : (data ?: any) => boolean = data => false // deprecated
    systemRedo : (data ?: any) => boolean = data => false // deprecated
    remainingSeconds: number = 1800
    channel : IChannel | INKNChannel | null = null
    channel_mode : ChannelMode = ChannelMode.SUBSCRIBER
    prevCanvasEventCommands : CanvasEvent[] = []
    constructor() {
        this.originCoord = { x: 0, y: 0 }
        this.stroke = { width: 1, color: "black" }
        this.mode = DrawingModes.FREE_HAND
        this.currentCommand = null
        this.isDrawing = false
    }
}
export interface IDrawCommand {
    onMouseDown(ev: MouseEvent, ctx: DrawingContext): void
    onMouseUp(ev: MouseEvent, ctx: DrawingContext): void
    onMouseOut(ev: MouseEvent, ctx: DrawingContext): void
    onMouseMove(ev: MouseEvent, ctx: DrawingContext): void
}