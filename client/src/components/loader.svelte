<script lang="ts">
	import { readSocket } from "../store/socketHandler"
	import { ResponseMethods } from "../types/socketRequest"

  export let loadingMessage = 'Awaiting Confirmation...';

  readSocket.on(ResponseMethods.ResponseConnection, (data) => {
    console.log('ResponseConnection', data)
    if (data.status === 'Accepted') {
      loadingMessage = 'Connection Accepted!';
    }
  })
</script>

<div class="flex flex-col h-full w-full justify-center items-center">
  <span class="loading loading-dots loading-lg"></span>
  {loadingMessage}
</div>