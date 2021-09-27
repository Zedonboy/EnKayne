import { TransferData } from "../../channel";
import { CanvasEvent, CanvasModes } from "../../utils/event";
import { ChannelMode, CommandDOMEventImplementer, DrawingContext, IDrawCommand, INKNChannel, IReverseableDrawCommand } from "../types";

export class TextCommand implements IDrawCommand, CommandDOMEventImplementer, IReverseableDrawCommand {
    textData : string = ""
    startX : number = 0
    startY : number = 0
    static OBJECT_NAME = "TextCommand"
    onMouseDown(ev: MouseEvent, ctx: DrawingContext): void {
        var textarea = document.createElement('textarea');
        textarea.classList.add("textedit")
        document.body.appendChild(textarea);
        textarea.style.position = 'absolute';
        textarea.style.top = ev.clientY + 'px';
        textarea.style.left = ev.clientX + 'px';
        let x = ev.offsetX
        let y = ev.offsetY
        textarea.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                if (ctx.canvasCtx) {
                    ctx.canvasCtx.font = '18px serif';
                    ctx.canvasCtx.fillText(textarea.value.trim(), x, y);
                    this.startX = x
                    this.startY = y
                    this.textData = textarea.value.trim()
                    if(ctx.channel_mode === ChannelMode.PUBLISHER){
                        let ch = ctx.channel as INKNChannel
                        let c_ev = new CanvasEvent()
                        c_ev.mode = CanvasModes.TEXT
                        c_ev.args = [this.textData, x, y]
                        let td = new TransferData(CanvasEvent.OBJECT_NAME, c_ev)
                        ch.publishDataChannel(td, ctx)
                        ctx.prevCanvasEventCommands.push(c_ev)
                    }
                } else {
                    throw Error("Canvas is undefined in Context Object")
                }

                document.body.removeChild(textarea)
            } else if (e.key === "Escape") {
                textarea.blur()
                document.body.removeChild(textarea)
            }
        })

        setTimeout(() => {
            window.addEventListener("click", this.mousedown.bind(this, textarea))
        }, 1000)

        setImmediate(() => {
            textarea.focus()
        })
    }
    onMouseUp(ev: MouseEvent, ctx: DrawingContext): void {

    }
    onMouseOut(ev: MouseEvent, ctx: DrawingContext): void {

    }
    onMouseMove(ev: MouseEvent, ctx: DrawingContext): void {

    }
    draw(ctx: DrawingContext): void {
        if (ctx.canvasCtx) {
            ctx.canvasCtx.font = '18px serif';
            ctx.canvasCtx.fillText(this.textData, this.startX, this.startY);
        } else {
            throw Error("Canvas is undefined in Context Object")
        }
    }

    mousedown(textarea: any) {
        window.removeEventListener("click", this.mousedown)
        try {
            document.body.removeChild(textarea)
        } catch (error) {

        }

    }

    // to be removed
    undo(ctx : DrawingContext) : boolean {
        return ctx.systemUndo()
    }

    // to be removed
    redo (ctx : DrawingContext) : boolean {
        return ctx.systemRedo()
    }

}