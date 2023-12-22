<script lang="ts">
  import { onMount } from "svelte";
  import io from "socket.io-client";
  import Navbar from "./components/navbar.svelte";
  import { crypticKeys } from "./store/keys";
	import SetName from "./components/setName.svelte"
	import StartConversation from "./components/startConversation.svelte"
  
  const socket = io({
    transports: ['websocket'],
    path: '/socket'
  })

  let myId = ""
  let myCrypticKeys = {}
  let conversationId = ""

  const showModal = () => {
    const name = localStorage.getItem('name');
    if (name) {
      return;
    } 
    const showAddName = document.getElementById('showAddName');
    if (showAddName) {
      (showAddName as HTMLDialogElement).showModal();
    }
  }

  onMount(() => {
    showModal();
    socket.on("connection-success", (data) => {
      console.log('Success', data);
    })
    socket.on("connect", async () => {
      myId = socket.id;
      const { publicKey, privateKey } = await crypticKeys()
      myCrypticKeys = { publicKey, privateKey }
      console.log('publicKey', publicKey);
    });
    socket.on("disconnect", () => {
      myId = "";
      console.log("Disconnected");
    });
  });
</script>

<div class="h-full w-full flex justify-center items-center">
  <main class="h-dvh max-h-dvh sm:max-h-[95dvh] flex flex-col container m-auto max-w-5xl">
    <Navbar />
    <div class="h-full max-h-[90dvh] sm:max-h-[85dvh] w-full rounded-none sm:rounded-2xl flex flex-col bg-base-300">
      <SetName />
      {#if myId}
        <StartConversation {conversationId} {myId} {socket}/>
      {/if}
    </div>
  </main>
</div>