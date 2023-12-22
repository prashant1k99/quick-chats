<script lang="ts">
  import { onMount } from "svelte";
	import type { Socket } from "socket.io-client"
	import ShareProfile from "./shareProfile.svelte"
	import ChatBox from "./chatBox.svelte"

  export let conversationId = ''
  export let myId = ''
  export let socket: Socket

  let currentState: 'idle' | 'connecting' | 'connected' = 'connected'

  const checkForConversationId = () => {
    const urlParams = new URLSearchParams(window.location.search)
    const conversationId = urlParams.get('conversationId')
    if (conversationId) {
      return conversationId
    }
    return ''
  }

  const startConversationWithId = () => {
    currentState = 'connecting'
    socket.emit('init-conversation', { 
      conversationId,
      myId,
      muName: localStorage.getItem('name')
    })
  }

  socket.on('init-conversation-success', (responseId) => {
    if (responseId === conversationId) {
      currentState = 'connected'
    }
  })

  onMount(() => {
    conversationId = checkForConversationId()
    if (conversationId) {
      startConversationWithId()
    }
  })
</script>

{#if currentState === 'idle'}
  <div class="flex h-full w-full justify-center items-center">
    <ShareProfile {myId} />
  </div>
{:else if currentState === 'connecting'}
  <div class="flex flex-col h-full w-full justify-center items-center">
    <span class="loading loading-dots loading-lg"></span>
    Connecting...
  </div>
{:else if currentState === 'connected'}
  <ChatBox />
{/if}