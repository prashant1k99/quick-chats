<script lang="ts">
  import { onMount } from "svelte";
	import ShareProfile from "./shareProfile.svelte"
	import ChatBox from "./chatBox.svelte"
	import ConnectionRequest from "./connectionRequest.svelte"
  import { readSocket } from "../store/socketHandler"
	import ConnectionReject from "./connectionReject.svelte"
	import SetName from "./setName.svelte"

  let conversationId = ''

  let currentState: 'idle' | 'connecting' | 'connected' = 'idle'

  const checkForConversationId = () => {
    const urlParams = new URLSearchParams(window.location.search)
    const conversationId = urlParams.get('cId')
    if (conversationId) {
      return conversationId
    }
    return ''
  }

  const startConversationWithId = () => {
    currentState = 'connecting'
    console.log('Is connected: ', readSocket.connected)
    readSocket.emit('RequestConnection', { 
      conversationId,
      name: localStorage.getItem('name')
    })
  }

  const showModal = () => {
    const name = localStorage.getItem('name');
    if (name) {
      return;
    } 
    const showAddName = document.getElementById('showAddName') as HTMLDialogElement;
    if (showAddName) {
      showAddName.showModal();
      showAddName.addEventListener('close', () => {
        triggerConnectionRequest();
      })
    }
  }

  readSocket.on('init-conversation-success', (responseId) => {
    if (responseId === conversationId) {
      currentState = 'connected'
    }
  })

  const triggerConnectionRequest = () => {
    if (conversationId) {
      startConversationWithId()
    }
  }

  onMount(() => {
    conversationId = checkForConversationId()
    if (!localStorage.getItem('name')) {
      showModal();
    } else {
      triggerConnectionRequest()
    }
  })

  const handleAccept = (e: CustomEvent) => {
    console.log('handleAccept', e)
    if (e.detail) {
      currentState = 'connected'
    } else {
      currentState = 'idle'
    }
  }
</script>

<ConnectionRequest />
<ConnectionReject on:accepted={handleAccept} />
<SetName />
{#if currentState === 'idle'}
  <div class="flex h-full w-full justify-center items-center">
    <ShareProfile myId={readSocket.id} />
  </div>
{:else if currentState === 'connecting'}
  <div class="flex flex-col h-full w-full justify-center items-center">
    <span class="loading loading-dots loading-lg"></span>
    Connecting...
  </div>
{:else if currentState === 'connected'}
  <ChatBox />
{/if}