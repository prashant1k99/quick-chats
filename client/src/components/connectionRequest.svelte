<script lang="ts">
  import { readSocket } from "../store/socketHandler";

  let requesterName: string = "";

  readSocket.on("RequestConnection" , (data) => {
    data = JSON.parse(data);
    requesterName = data.name;
    const dialog = document.getElementById('connectionRequest') as HTMLDialogElement;
    dialog?.showModal();
  })

  const closeDialog = (e) => {
    const dialog = document.getElementById('connectionRequest') as HTMLDialogElement;
    dialog?.close();
  }

  const handleConnectionAccept = (e) => {
    console.log('Accept');
    closeDialog(e);
  }
  
  const handleConnectionReject = (e) => {
    console.log('Reject');
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