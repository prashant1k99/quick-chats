import io from "socket.io-client";
import type { Socket } from "socket.io-client"
import { readable } from "svelte/store";

export default class SocketHandler {
  private socket?: Socket
  constructor(){
    this.socket = io({
      transports: ['websocket'],
      path: '/socket'
    })
  }

  get Socket() {
    return this.socket
  }
}

export const socket = readable(new SocketHandler())