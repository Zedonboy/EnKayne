import { TransferData } from "../../channel"
import { CanvasEvent, CanvasModes } from "../../utils/event"
import { ChannelMode, DrawingContext, IDrawCommand, INKNChannel, IReverseableDrawCommand } from "../types"
export class CirclShapeCommand implements IDrawCommand, IReverseableDrawCommand {
    static OBJECT_NAME = "CirclShapeCommand"
    dragging: boolean = false
    div: HTMLDivElement | null = null
    x: number = 0
    y: number = 0
    ellipseX : number = 0
    ellipseY : number = 0
    ellipseRadiusX : number = 0
    ellipseRadiusY : number = 0
    drawnSmthing: boolean = false

    onMouseDown(ev: MouseEvent, ctx: DrawingContext): void {
        this.dragging = true
        let div = document.createElement("div")
        div.classList.add("circle")
        document.body.appendChild(div);
        div.style.position = 'absolute';
        div.style.top = ev.clientY + 'px';
        div.style.left = ev.clientX + 'px';
        this.x = ev.clientX
        this.y = ev.clientY
        ctx.originCoord.x = ev.offsetX
        ctx.originCoord.y = ev.offsetY
        this.div = div
    }
    onMouseUp(ev: MouseEvent, ctx: DrawingContext): void {
        if (this.drawnSmthing && this.dragging) {
            this.dragging = false
            this.drawnSmthing = false
            if (ctx.canvasCtx) {
                ctx.canvasCtx?.beginPath()
                ctx.canvasCtx.strokeStyle = ctx.stroke.color
                let x = ctx.originCoord.x + (Math.abs(ev.offsetX - ctx.originCoord.x)/2)
                let y = ctx.originCoord.y + (Math.abs(ev.offsetY - ctx.originCoord.y)/2)
                let rx = Math.abs(ev.offsetX - ctx.originCoord.x)/2
                let ry = Math.abs(ev.offsetY - ctx.originCoord.y)/2
                ctx.canvasCtx?.ellipse(x, y, rx, ry, 0, 0, 2 * Math.PI)
                ctx.canvasCtx?.stroke()
                this.ellipseX = x
                this.ellipseY = y
                this.ellipseRadiusX = rx
                this.ellipseRadiusY = ry
                if(ctx.channel_mode === ChannelMode.PUBLISHER){
                    let ch = ctx.channel as INKNChannel
                    let c_ev = new CanvasEvent()
                    c_ev.mode = CanvasModes.ELLIPSE
                    c_ev.args = [x, y, rx, ry, 0, 0, 2*Math.PI]
                    let td = new TransferData(CanvasEvent.OBJECT_NAME, c_ev)
                    ch.publishDataChannel(td, ctx)
                    ctx.prevCanvasEventCommands.push(c_ev)
                }
            } else throw new Error("Canvas is undefined in context object")
            if (this.div) try {
                document.body.removeChild(this.div)
            } catch (e) { }
        }
    }

    onMouseOut(ev: MouseEvent, ctx: DrawingContext): void {
        return this.onMouseUp(ev, ctx)
    }

    onMouseMove(ev: MouseEvent, ctx: DrawingContext): void {
        if (this.dragging) {
            this.drawnSmthing = true
            if (this.div) {
                this.div.style.width = Math.abs(ev.clientX - this.x) + "px"
                this.div.style.height = Math.abs(ev.clientY - this.y) + "px"
            }
        }
    }

    draw(ctx : DrawingContext) {
        if(ctx.canvasCtx){
            ctx.canvasCtx?.beginPath()
            ctx.canvasCtx?.ellipse(this.ellipseX, this.ellipseY, this.ellipseRadiusX, this.ellipseRadiusY, 0, 0, 2 * Math.PI)
            ctx.canvasCtx.stroke()
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