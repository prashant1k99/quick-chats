<script lang="ts">
  let myName = ''

  const setName = (e: Event) => {
    e.preventDefault()
    localStorage.setItem('name', myName)
    const dialog = document.getElementById('showAddName') as HTMLDialogElement
    dialog.close()
  }
</script>

<dialog id="showAddName" class="modal modal-bottom sm:modal-middle">
  <div class="modal-box p-4">
    <div class="w-full h-full max-w-screen overflow-hidden p-4 sm:pt-8">
      <form on:submit={setName} class="flex flex-col gap-4">
        <label class="form-control w-full">
          <div class="label">
            <span class="label-text">Enter Your Name</span>
          </div>
          <input type="text" placeholder="Enter name here" bind:value={myName} class="input input-bordered w-full rounded-lg" />
        </label>
        <button type="submit" class="btn btn-primary font-semibold rounded-lg w-full">Set Name</button>
      </form>
    </div>
  </div>
</dialog>