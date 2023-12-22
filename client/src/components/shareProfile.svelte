<script lang="ts">
  import QRius from 'qrious'
	import { onMount } from 'svelte'
  
  export let myId: string;

  let qrImage: QRius | null = null
  let isTextCopied = false
  let copyText = 'Click to Copy'

  const url = new URL(window.location.href);
  url.searchParams.set('cId', myId);
  const shareURL = url.href;

  const mobileShareable = navigator.share as unknown as boolean ? true : false
  
  onMount(() => {
    const qr = new QRius({
      value: shareURL,
      size: 300,
      level: 'H',
    })
    qrImage = qr.toDataURL()
  })

  const toggleTooltip = () => {
    const tooltip = document.querySelector('.tooltip-open')
    if (tooltip) {
      tooltip.classList.toggle('tooltip-open')
    }
  }

  // const copyShareLink = () => {
    
  //   navigator.clipboard.writeText(shareURL)
  //   isTextCopied = true
  //   copyText = 'Copied'
  //   toggleTooltip()
  //   setTimeout(() => {
  //     isTextCopied = false
  //     copyText = 'Click to Copy'
  //   }, 1000);
  // }
  const copyShareLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareURL)
        .then(() => {
          isTextCopied = true;
          copyText = 'Copied';
          toggleTooltip();
          setTimeout(() => {
            isTextCopied = false;
            copyText = 'Click to Copy';
          }, 1000);
        })
        .catch(err => {
          console.error('Could not copy text: ', err);
        });
    } else {
      console.log('Clipboard API not available');
    }
  }
  
  const shareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: `Join conversation with ${localStorage.getItem('name') || 'me'}`,
        text: `Use this url to connect with ${localStorage.getItem('name') || 'me'} to have secret chats.`,
        url: shareURL,
        files: [new File([qrImage], 'qr.png', { type: 'image/png' })]
      })
    } else {
      copyShareLink()
    }
  }
</script>

<div class="max-w-md w-full">
  <div class="w-full h-full max-w-screen overflow-hidden sm:pt-8">
    <div class="flex flex-col justify-center items-center h-full w-full">
      <div class="flex flex-col justify-center items-center gap-2 w-full">
        <p class="text-xl font-bold text-primary" id="qr">Share this QR code to connect</p>
        <div class="w-64 h-64 text-primary my-2" data-background="text-accent" data-foreground="text-primary">
          {#if qrImage}
          <img src={qrImage} alt="QR code" />
          {:else}
          <p class="text-xl font-normal text-accent">Loading...</p>
          {/if}
        </div>
        <p class="text-2xl font-normal text-primary">Or share this link</p>
        <div class="flex border border-slate-800 bg-neutral max-w-full px-8 py-2 rounded-lg w-full items-center">
          <input disabled class="text-accent w-full text-xl bg-inherit rounded-lg text-ellipsis overflow-hidden mr-2" on:click={(e) => {
            e.stopPropagation()
            copyShareLink()
          }} value={shareURL} />
          <div class="tooltip" data-tip={copyText}>
            <button type="button" on:click={shareLink}>
              {#if mobileShareable}
              <svg fill="none" stroke-width="2" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" height="1em" width="1em" style="overflow: visible; color: currentcolor;"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><path d="M16 6 12 2 8 6"></path><path d="M12 2 12 15"></path></svg>
              {:else if isTextCopied}
              <svg class="w-4 h-4 text-accent" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              {:else}
              <svg class="w-4 h-4 text-accent group-hover:rotate-6 transition" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>
              {/if}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>