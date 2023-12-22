import io from "socket.io-client";
import { readable } from "svelte/store";

export default class SocketHandler {
  constructor(){
    const socket = io({
      transports: ['websocket'],
      path: '/socket'
    })
  }
}

export const socket = readable(new SocketHandler())