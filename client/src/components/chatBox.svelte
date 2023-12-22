<script lang="ts">
  import Messages from "./messages.svelte";
  let message = '';

  let messages = [
    { message: 'Hello' },
    { message: 'Hi' },
    { message: 'How are you?' },
    { message: 'I am fine' },
    { message: 'How about you?' },
  ]

  $: renderableMessages = messages;

  const sendMessage = (e: Event) => {
    e.preventDefault();
    messages.push({ message: message });
    console.log(messages)
    message = '';
  }
</script>


<div class="w-full overflow-y-auto grow p-2 flex flex-col justify-end">
  {#each renderableMessages as { message: msg }, i}
    <Messages message={msg} timeStamp={Date.now()} isSent={i % 2 === 0} name="John Doe" />
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