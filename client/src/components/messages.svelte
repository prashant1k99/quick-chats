<script lang="ts">
  export let message: string
  export let timeStamp: number
  export let isSent: boolean
  export let name: string
</script>

<div class={`chat ${isSent? 'chat-end': 'chat-start'}`}>
  <div class="chat-header pb-2">
    {isSent ? 'You' : name}
    <time class="text-xs opacity-50">
      {new Date(timeStamp).toLocaleTimeString()}
    </time>
  </div>
  <div class={`chat-bubble ${isSent ? 'chat-bubble-primary' : 'chat-bubble-accent' }`}>{message}</div>
</div>