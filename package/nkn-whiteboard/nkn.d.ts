declare module "nkn-sdk"{
    export class Client{
        constructor(options ?:{
            seed?:string,
            identifier?: string,
            rpcServerAddr?:string
        })

        publish(topic : string, data : any) : void
        subscribe(topic: string, duration: number, identifier: string, meta : string, options : any) : Promise<any>
        unsubscribe(topic : string, identifier : string, options : any) : Promise<any>
        onMessage(func : Function) : void | boolean | Promise<any>
        onConnect(func : Function) : void
    }
}