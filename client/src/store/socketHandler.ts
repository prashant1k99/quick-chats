import io from "socket.io-client";
import type { Socket } from "socket.io-client"
import { readable, get } from "svelte/store";

export default class SocketHandler {
  private socket?: Socket
  constructor(){
    this.socket = io({
      transports: ['websocket'],
      path: '/socket'
    })
    this.socket.connect()
  }

  get Socket(): Socket {
    return this.socket as Socket
  }
}

export const socket = readable(new SocketHandler())

export const readSocket = get(socket).Socket