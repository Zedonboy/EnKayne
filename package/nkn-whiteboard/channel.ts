import { DrawingContext, IChannel, INKNChannel, IProcessor } from "./internals/types"
import nkn from "nkn-sdk"
class DataProcessor implements IProcessor {
    decode(data: string | Uint8Array) {
        if (typeof data === "string") return JSON.parse(data)
        else return data
    }
    encode(data: any): string | Uint8Array {
        return JSON.stringify(data)
    }

}

export enum UserSpaceEvents {
    NEW_DEVICE = "new_device"
}

export class TransferData {
    name: string = ""
    value: any = undefined
    constructor(name: string, value: any) {
        this.name = name
        this.value = value
    }
}
export class Channel implements IChannel, INKNChannel {
    static CHANNEL_IDENTIFIER = "enkayne_client"
    audioMute : boolean = true
    audioSubscribed : boolean = false
    micActivated : boolean = false
    channelName: string
    dataNknClient: nkn.Client | null
    dataNKNClientIDentifier: string = ""
    audioNKNClientIdentifier: string = ""
    dataProcessor: IProcessor = new DataProcessor()
    onDataMessageCB: Function[] = []
    audioNknClient: nkn.Client | null = null
    eventMap = {}
    onConnectCb: Function = () => { }
    constructor(name: string) {
        this.channelName = name
        this.dataNKNClientIDentifier = name + "_data"
        this.audioNKNClientIdentifier = name + "_audio"
        this.dataNknClient = new nkn.Client({ identifier: this.dataNKNClientIDentifier })
        this.dataNknClient.onConnect(() => {
            this.onConnectCb()
            this.callevent("connect")
        })
        this.audioNknClient = new nkn.Client({ identifier: this.audioNKNClientIdentifier })
    }

    onConnect(cb: Function) {
        this.onConnectCb = cb
    }
    publishDataChannel(data: any): void {
        console.log("publishing step 1" + data)
        if (this.dataNknClient) {
            new Promise((res, rej) => {
                let output = this.dataProcessor.encode(data)
                res(output)
            }).then(output => {
                console.log("publishing " + output)
                //@ts-ignore
                this.dataNknClient?.publish(this.channelName, output).then(e => {
                    console.log(e)
                })
            })
        }
    }

    async subscribeDataChannel(ctx: DrawingContext) {
        if (this.dataNknClient) {
            this.internalOnDataMessage()
            // 20s per block
            return this.dataNknClient.subscribe(this.channelName, Math.ceil(ctx.remainingSeconds / 20), this.dataNKNClientIDentifier, "metadata", {})
        }
    }
    async unsubscribeDataChannel() {
        if (this.dataNknClient) {
            this.dataNknClient.unsubscribe(this.channelName, this.dataNKNClientIDentifier, {})
        }
    }

    private internalOnDataMessage() {
        if (this.dataNknClient) {
            this.dataNknClient.onMessage((data: any) => {
                new Promise((res, rej) => {
                    console.log("incoming data" + data.payload)
                    let sourc = this.dataProcessor.decode(data.payload)
                    this.onDataMessageCB.forEach(fn => {
                        fn(sourc)
                    })

                    res(null)
                })

            })
        }
    }

    addDataMessageProcessor(data: IProcessor) {
        this.dataProcessor = data
    }

    onDataMessage(cb: (data: any) => void) {
        this.onDataMessageCB.push(cb)
    }

    publishAudioChannel(): void {
       
    }
    subscribeAudioChannel(): void {
        throw new Error("Method not implemented.")
    }
    unsubscribeAudioChannel(): void {
        throw new Error("Method not implemented.")
    }

    callevent(event: string, data?: any) {
        //@ts-ignore
        let cb = this.eventMap[event]
        if(cb){
            cb(data)
        }
    }
    listenTo(event: string, cb: () => void): void {
        //@ts-ignore
        this.eventMap[event] = cb
    }
    muteMic(): void {
        this.audioMute = true
        this.audioNknClient?.unsubscribe(this.channelName, this.audioNKNClientIdentifier, {})
        this.audioSubscribed = false
    }
    muteSpeaker(): void {
        this.audioNknClient?.unsubscribe(this.channelName, this.audioNKNClientIdentifier, {})
        this.audioSubscribed = false
    }

    unMuteSpeaker(ctx : DrawingContext) {
        if(!this.audioSubscribed){       
            this.audioNknClient?.subscribe(this.channelName, Math.ceil(ctx.remainingSeconds / 20), this.audioNKNClientIdentifier, "metadata", {})
        }

        this.audioNknClient?.onMessage((data : Uint8Array) => {
            let context = new AudioContext()
            let source = context.createBufferSource()
            let audioData = data
            let floatAudioBuffer = new Float32Array(audioData.buffer)
            source.buffer?.copyFromChannel(floatAudioBuffer, 0)
            source.connect(context.destination)
            source.start()
        })
    }

    unMuteMic(ctx : DrawingContext) {
        this.audioMute = false
        this.activateMic(ctx)
    }

    activateMic(ctx : DrawingContext) {
       
        if(this.micActivated) return
        navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(stream => {
            this.micActivated = true
            const context = new AudioContext();
            const source = context.createMediaStreamSource(stream);
            const processor = context.createScriptProcessor(1024, 1, 1);
            source.connect(processor);
            processor.connect(context.destination);

            if(processor.onaudioprocess){
                processor.onaudioprocess = (e) => {
                    
                    if(this.audioMute) return
                    // Do something with the data, e.g. convert it to WAV
                    let audioBif = e.inputBuffer
                    let floatArray = audioBif.getChannelData(0)
                    let audioData = new Uint8Array(floatArray.buffer)
                    console.log("Sending Audio Data")
                    this.audioNknClient?.publish(this.channelName, audioData)
                };
            }

        })
    }

}