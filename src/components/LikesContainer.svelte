<script>
  import { writable } from "svelte/store";

  const likes = writable(0);

  function incrementLikes() {
    likes.update((n) => n + 1);
  }
</script>

<div class="likes-container">
  <div class="likes-count">{$likes}</div>
  <button class="like-button" on:click={incrementLikes}>Like</button>
</div>
