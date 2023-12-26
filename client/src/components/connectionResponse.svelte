<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { readSocket } from "../store/socketHandler";
	import { ResponseMethods, type ResponseConnectionPayload } from '../../../types/socketRequest'
  import { addParticipant, requestOffer } from '../store/participents';

  const dispatch = createEventDispatcher();

  readSocket.on(ResponseMethods.ResponseConnection, (data: ResponseConnectionPayload) => {
    if (data.status === 'Accepted') {
      addParticipant({
        id: data.id,
        name: data.name
      })
      requestOffer(data.id)
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