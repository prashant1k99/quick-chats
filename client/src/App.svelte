<script lang="ts">
  import { onMount } from "svelte";
  import io from "socket.io-client";
  import Navbar from "./components/navbar.svelte";
  
  const socket = io({
    transports: ['websocket'],
    path: '/socket'
  })
  onMount(() => {
    console.log("Hello World")
    fetch("/api")
    .then((res) => {
      console.log(res);
      return res.json();
    })
    .then((data) => console.log(data));
    socket.on("connection-success", (data) => {
      console.log('Success', data);
    })
    socket.on("connect", () => {
      myId = socket.id;
      console.log(myId);
    });
    socket.on("disconnect", () => {
      myId = "";
      console.log("Disconnected");
    });
  });

  
  let myId = ""
</script>

<main class="w-screen max-h-screen max-w-screen h-screen flex-row">
  <Navbar />
  <div class="container m-auto h-full bg-base-200 rounded-none sm:rounded-2xl">
    Hello World: {myId}
  </div>
</main>