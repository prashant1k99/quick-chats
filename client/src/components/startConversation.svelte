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
  import { participants } from "../store/participents";

  let conversationId = ''

  const checkForConversationId = () => {
    const urlParams = new URLSearchParams(window.location.search)
    const conversationId = urlParams.get('cId')
    if (conversationId) {
      return conversationId
    }
    return ''
  }

  const startConversationWithId = () => {
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
</script>

<ConnectionRequest />
<ConnectionResponse />
<SetName />
{#if $participants.length > 0 && $participants[0].state == 'connected'}
  <ChatBox />
{:else if $participants.length > 0 || conversationId != ''}
  <Loader />
{:else}
  <ShareProfile myId={readSocket.id} />
{/if}