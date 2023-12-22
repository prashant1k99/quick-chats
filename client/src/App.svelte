<script lang="ts">
  import { onMount } from "svelte";
  import Navbar from "./components/navbar.svelte";
	import SetName from "./components/setName.svelte"
	import StartConversation from "./components/startConversation.svelte"
  import { readSocket } from "./store/socketHandler";

  let myId = ""
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

  readSocket.on("connect", async () => {
    myId = readSocket.id;
    console.log('myId', myId);
  });

  onMount(() => {
    showModal();
  });
</script>

<div class="h-full w-full flex justify-center items-center">
  <main class="h-dvh max-h-dvh sm:max-h-[95dvh] flex flex-col container m-auto max-w-5xl">
    <Navbar />
    <div class="h-full max-h-[90dvh] sm:max-h-[85dvh] w-full rounded-none sm:rounded-2xl flex flex-col bg-base-300">
      <SetName />
      {#if myId}
        <StartConversation {conversationId} {myId} />
      {/if}
    </div>
  </main>
</div>