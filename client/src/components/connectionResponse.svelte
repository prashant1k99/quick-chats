<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { readSocket } from "../store/socketHandler";
	import { ResponseMethods, type ResponseConnectionPayload } from '../../../types/socketRequest'
  import { participants } from '../store/participents';
	import { chats } from '../store/chats'

  const dispatch = createEventDispatcher();

  readSocket.on(ResponseMethods.ResponseConnection, (data: ResponseConnectionPayload) => {
    if (data.status === 'Accepted') {
      chats.initChat(data.id)
      participants.addParticipant({
        id: data.id,
        name: data.name
      })
      participants.requestOffer(data.id)
    } else {
      const dialog = document.getElementById('connectionRejection') as HTMLDialogElement
      dialog.showModal()
      dialog.addEventListener('close', () => {
        let url = new URL(window.location.href);
        url.searchParams.delete('cId');
        window.history.replaceState({}, '', url.href);
        dispatch('accepted', false)
      })
    }
  })
</script>

<!-- Show Request for connection -->
<dialog id="connectionRejection" class="modal modal-bottom sm:modal-middle">
  <div class="modal-box">
    <h1 class="font-bold text-lg">&#128529;</h1>
    <p class="py-4">
      Request Rejected
    </p>
    <div class="modal-action w-full">
      <form method="dialog">
        <!-- if there is a button in form, it will close the modal -->
        <button class="btn btn-outline rounded-lg w-full">Close</button>
      </form>
    </div>
  </div>
</dialog>