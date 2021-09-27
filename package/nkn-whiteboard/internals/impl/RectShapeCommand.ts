import { TransferData } from "../../channel";
import { CanvasEvent, CanvasModes } from "../../utils/event";
import { ChannelMode, CommandDOMEventImplementer, DrawingContext, IDrawCommand, INKNChannel, IReverseableDrawCommand } from "../types";

export class RectShapeCommand implements IDrawCommand, CommandDOMEventImplementer, IReverseableDrawCommand {
    dragging: boolean = false
    div: HTMLDivElement | null = null
    x: number = 0
    y: number = 0
    drawnSmthing: boolean = false

    rectStartX: number = 0
    rectStartY: number = 0
    rectWidth: number = 0
    rectHeight: number = 0
    strokeColor: string = ""

    static OBJECT_NAME = "RectShapeCommand"
    onMouseDown(ev: MouseEvent, ctx: DrawingContext): void {
        this.dragging = true
        let div = document.createElement("div")
        div.classList.add("rect")
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
                let absWidth = Math.abs(ev.offsetX - ctx.originCoord.x)
                let absHeight = Math.abs(ev.offsetY - ctx.originCoord.y)
                ctx.canvasCtx?.strokeRect(ctx.originCoord.x, ctx.originCoord.y, absWidth, absHeight)
                this.rectStartX = ctx.originCoord.x
                this.rectStartY = ctx.originCoord.y
                this.rectWidth = absWidth
                this.rectHeight = absHeight
                this.strokeColor = ctx.canvasCtx.strokeStyle
                if(ctx.channel_mode === ChannelMode.PUBLISHER){
                    let ch = ctx.channel as INKNChannel
                    let c_ev = new CanvasEvent()
                    c_ev.mode = CanvasModes.RECT
                    c_ev.args = [this.rectStartX, this.rectStartY, this.rectWidth, this.rectHeight]
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
        console.log("mouse move")
        if (this.dragging) {
            this.drawnSmthing = true
            if (this.div) {
                this.div.style.width = Math.abs(ev.clientX - this.x) + "px"
                this.div.style.height = Math.abs(ev.clientY - this.y) + "px"
            }
        }
    }
    draw(ctx: DrawingContext): void {
        if (ctx.canvasCtx) {
            let prevStroke = ctx.canvasCtx.strokeStyle
            ctx.canvasCtx.beginPath()
            ctx.canvasCtx.strokeStyle = this.strokeColor
            ctx.canvasCtx?.strokeRect(this.rectStartX, this.rectStartY, this.rectWidth, this.rectHeight)
            ctx.canvasCtx.strokeStyle = prevStroke
        }
    }

    undo(ctx: DrawingContext): boolean {
        if(ctx.canvasCtx){
            ctx.canvasCtx.clearRect(this.rectStartX, this.rectStartY, this.rectWidth, this.rectHeight)
            return true
        }
        return false
    }

    redo(ctx: DrawingContext): boolean {
        this.draw(ctx)
        return true
    }

}