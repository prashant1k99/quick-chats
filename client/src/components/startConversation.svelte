<script lang="ts">
  import { onMount } from "svelte";
	import ShareProfile from "./shareProfile.svelte"
	import ChatBox from "./chatBox.svelte"
	import ConnectionRequest from "./connectionRequest.svelte"
  import { readSocket } from "../store/socketHandler"
	import ConnectionResponse from "./connectionResponse.svelte"
	import SetName from "./setName.svelte"
	import Loader from "./loader.svelte"
	import { RequestMethods } from "../../../types/socketRequest"
  import { participants } from "../store/chats";

  let loadingMessage = 'Awaiting Confirmation...'

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
    console.log('cId', conversationId)
    currentState = 'connecting'
    console.log('Is connected: ', readSocket.connected)
    readSocket.emit(RequestMethods.RequestConnection, { 
      id: conversationId,
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

  const connectionAccept = (e: CustomEvent) => {
    // currentState = 'connected'
    loadingMessage = 'Setting connection...'
    currentState = 'connecting'
  }
</script>

<ConnectionRequest on:connectionAccept={connectionAccept}/>
<ConnectionResponse />
<SetName />
<code>
  <pre>
    { JSON.stringify($participants, null)}
  </pre>
</code>
{#if currentState === 'idle'}
  <ShareProfile myId={readSocket.id} />
{:else if currentState === 'connecting'}
  <Loader {loadingMessage} on:connectionComplete={() => {
    currentState = 'connected'
  }}/>
{:else if currentState === 'connected'}
  <ChatBox />
{/if}