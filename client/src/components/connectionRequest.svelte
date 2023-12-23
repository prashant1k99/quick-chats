<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { readSocket } from "../store/socketHandler";
	import { ResponseMethods } from '../../../types/socketRequest'

  const dispatch = createEventDispatcher();

  let requesterName: string = "";
  let requesterId: string = "";

  readSocket.on("RequestConnection" , (data) => {
    requesterName = data.name;
    requesterId = data.id;
    const dialog = document.getElementById('connectionRequest') as HTMLDialogElement;
    dialog?.showModal();
  })

  const closeDialog = (e) => {
    const dialog = document.getElementById('connectionRequest') as HTMLDialogElement;
    dialog?.close();
  }

  const handleConnectionAccept = (e) => {
    readSocket.emit(ResponseMethods.ResponseConnection, {
      id: requesterId,
      status: 'Accepted'
    })
    dispatch('connectionAccept', true);
    closeDialog(e);
  }
  
  const handleConnectionReject = (e) => {
    readSocket.emit(ResponseMethods.ResponseConnection, {
      id: requesterId,
      status: 'Rejected'
    })
    closeDialog(e);
  }
</script>

<!-- Show Request for connection -->
<dialog id="connectionRequest" class="modal modal-bottom sm:modal-middle">
  <div class="modal-box">
    <h3 class="font-bold text-lg">Hello!</h3>
    <p class="py-4">
      {requesterName} wants to connect with you.
    </p>
    <div class="w-full flex gap-3">
      <button class="btn btn-accent rounded-lg grow" on:click={handleConnectionAccept}>Accept</button>
      <button class="btn btn-error rounded-lg grow" on:click={handleConnectionReject}>Reject</button>
    </div>  
  </div>
</dialog>