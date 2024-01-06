<script lang="ts">
  import { chats } from '../store/chats'
  import type { Participant } from '../store/participents'
  import Messages from "./messages.svelte";
  export let participant: Participant;
  let message = '';

  const sendMessage = async (e: Event) => {
    e.preventDefault();
    if (message == '') {
      return
    }
    await participant.peerConnection.sendChat(message);
    chats.addChat(participant.id, {
      message,
      recieved: false,
      id: '1',
      timestamp: Date.now()
    });
    message = '';
  }
</script>


<div class="w-full overflow-y-auto grow p-2 flex flex-col justify-end">
    {#each $chats[0].messages as { message: msg, recieved }, i}
      <Messages message={msg} timeStamp={Date.now()} isSent={!recieved} name={participant.name} />
    {/each}
</div>
<form on:submit|preventDefault={sendMessage} class=" flex gap-4 p-4 bg-neutral rounded-none sm:rounded-2xl sm:rounded-t-none" >
  <input class="w-full bg-inherit focus:outline-none text-primary" bind:value={message} type="text" placeholder="Enter your name" on:keydown={(e) => {
    if (e.key === 'Enter') {
      sendMessage(e)
    }
  }} />
  <button class="btn btn-ghost text-primary" tabindex="0" type="submit">Send</button>
</form>