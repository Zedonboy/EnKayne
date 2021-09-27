import { TransferData } from "../../channel";
import { CanvasEvent, CanvasModes } from "../../utils/event";
import { ChannelMode, DrawingContext, IDrawCommand, INKNChannel, IReverseableDrawCommand } from "../types";

export class EraseCommand implements IDrawCommand, IReverseableDrawCommand {
    static OBJECT_NAME = "EraseCommand"
    dragging = false
    drawn = false
    paths : {
        x : number,
        y : number
    }[] = []
    onMouseDown(ev: MouseEvent, ctx: DrawingContext): void {
        this.dragging = true
    }
    onMouseUp(ev: MouseEvent, ctx: DrawingContext): void {
        if(this.drawn) {
            this.dragging = false
        }
        if(ctx.canvasCtx){
            ctx.canvasCtx.globalCompositeOperation = "source-over"
        }
    }
    onMouseOut(ev: MouseEvent, ctx: DrawingContext): void {
        return this.onMouseOut(ev, ctx)
    }
    onMouseMove(ev: MouseEvent, ctx: DrawingContext): void {
        if (this.dragging) {
            this.drawn = true
            if (ctx.canvasCtx) {
                ctx.canvasCtx.globalCompositeOperation = "destination-out"
                ctx.canvasCtx?.beginPath()
                ctx.canvasCtx.arc(ev.offsetX, ev.offsetY, 100, 0, Math.PI * 2, false)
                ctx.canvasCtx.fill()
                const x = ev.offsetX
                const y = ev.offsetY
                if(ctx.channel_mode === ChannelMode.PUBLISHER){
                    let ch = ctx.channel as INKNChannel
                    let c_ev = new CanvasEvent()
                    c_ev.mode = CanvasModes.ERASER
                    c_ev.args = [x, y, 100, 0, Math.PI * 2, false]
                    let td = new TransferData(CanvasEvent.OBJECT_NAME, c_ev)
                    ch.publishDataChannel(td, ctx)
                    ctx.prevCanvasEventCommands.push(c_ev)
                }
                new Promise((res, rej) => {
                    this.paths.push({x,y})
                })
                ctx.canvasCtx.globalCompositeOperation = "source-over"
            }
        }

    }

    draw(ctx : DrawingContext) {
        if(ctx.canvasCtx){
            ctx.canvasCtx.globalCompositeOperation = "destination-out"
            this.paths.forEach(p => {
                ctx.canvasCtx?.beginPath()
                ctx.canvasCtx?.arc(p.y, p.y, 100, 0, Math.PI * 2, false)
                ctx.canvasCtx?.fill()
            })
            ctx.canvasCtx.globalCompositeOperation = "source-over"
        }
    }

    redo(ctx : DrawingContext) : boolean {
        this.draw(ctx)
        return true
    }

    undo(ctx : DrawingContext) : boolean {
        return ctx.systemUndo()
    }

}