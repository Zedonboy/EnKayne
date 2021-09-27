import { TransferData } from "../../channel"
import { CanvasEvent, CanvasModes } from "../../utils/event"
import { ChannelMode, CommandDOMEventImplementer, DrawingContext, IDrawCommand, INKNChannel, IReverseableDrawCommand } from "../types"

class Line {
    startX : number = 0
    startY : number = 0
    endX : number = 0
    endY : number = 0
    constructor(startX : number, startY : number, endX : number, endY : number){
        this.startX = startX
        this.startY = startY
        this.endX = endX
        this.endY = endY
    }
}
export class FreeHandDrawCommand implements IDrawCommand, CommandDOMEventImplementer, IReverseableDrawCommand{
    _lines : Line[] = []
    static OBJECT_NAME = "FreeHandDrawCommand"
    onMouseDown(ev: MouseEvent, ctx: DrawingContext): void {
        ctx.isDrawing = true
        ctx.originCoord.x = ev.offsetX
        ctx.originCoord.y = ev.offsetY
    }
    onMouseUp(ev: MouseEvent, ctx: DrawingContext): void {
        ctx.isDrawing = false
    }
    onMouseOut(ev: MouseEvent, ctx: DrawingContext): void {
        ctx.isDrawing = false
    }
    onMouseMove(ev: MouseEvent, ctx: DrawingContext): void {
        if(!ctx.canvasCtx) throw Error("Canvas is undefined in context")
        if(!ctx.isDrawing) return
        ctx.canvasCtx.beginPath()
        const startX = ctx.originCoord.x
        const startY = ctx.originCoord.y
        const endX = ev.offsetX
        const endY = ev.offsetY
        ctx.canvasCtx.moveTo(ctx.originCoord.x, ctx.originCoord.y)
        ctx.canvasCtx.lineTo(ev.offsetX, ev.offsetY)
        ctx.canvasCtx.strokeStyle = ctx.stroke.color
        ctx.canvasCtx.lineWidth = ctx.stroke.width
        ctx.canvasCtx.stroke()
        ctx.canvasCtx.closePath()
        ctx.originCoord.x = ev.offsetX
        ctx.originCoord.y = ev.offsetY
        if(ctx.channel_mode === ChannelMode.PUBLISHER){
            let ch = ctx.channel as INKNChannel
            let c_ev = new CanvasEvent()
            c_ev.mode = CanvasModes.LINE
            c_ev.args = [startX, startY, endX, endY]
            let td = new TransferData(CanvasEvent.OBJECT_NAME, c_ev)
            ch.publishDataChannel(td, ctx)
            ctx.prevCanvasEventCommands.push(c_ev)
        }
        new Promise((res, rej) => {

            this._lines.push(new Line(startX, startY, endX, endY))
        })
    }

    draw(ctx : DrawingContext) {
        if(!ctx.canvasCtx) return
        this._lines.forEach(ln => {
            ctx.canvasCtx?.beginPath()
            ctx.canvasCtx?.moveTo(ln.startX, ln.startY)
            ctx.canvasCtx?.lineTo(ln.endX, ln.endY)
            ctx.canvasCtx?.stroke()
            ctx.canvasCtx?.closePath()
        })
    }

    undo (ctx : DrawingContext) : boolean {
        return ctx.systemUndo()
    }

    redo(ctx : DrawingContext) : boolean{
        this.draw(ctx)
        return true
    }
}