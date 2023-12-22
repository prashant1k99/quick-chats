<script lang="ts">
  import { onMount } from "svelte";
	import ShareProfile from "./shareProfile.svelte"
	import ChatBox from "./chatBox.svelte"
	import ConnectionRequest from "./connectionRequest.svelte"
  import { readSocket } from "../store/socketHandler"

  export let conversationId = ''
  export let myId = ''

  let currentState: 'idle' | 'connecting' | 'connected' = 'idle'

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
    readSocket.emit('init-conversation', { 
      conversationId,
      myId,
      muName: localStorage.getItem('name')
    })
  }

  readSocket.on('init-conversation-success', (responseId) => {
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

<ConnectionRequest />
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