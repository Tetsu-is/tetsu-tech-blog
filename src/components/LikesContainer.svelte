<script>
const { blogID } = $props();

let count = $state(0);
let pressed = $state(false);

const url = `${import.meta.env.PUBLIC_API_URL}/api/likes/${blogID}`;
console.log(url);

async function increment() {
	count += 1;
	pressed = true;

	try {
		await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
		});
	} catch (e) {
		console.log("良いね処理に失敗しました");
	}
}

$effect(async () => {
	const res = await fetch(url);
	const data = await res.json();
	count = data.result.likes_count;
});
</script>

<div style="display: flex; justify-content: center; gap: 1em; margin-top: 1em;">
  <div>{count} いいね</div>
  {#if pressed === true}
    <button
      disabled="true"
      style="background-color: rgb(var(--gray));
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.5em 1em;
    cursor: pointer;">いいね済み</button
    >
  {:else}
    <button
      onclick={increment}
      style="background-color: rgb(var(--gray));
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.5em 1em;
    cursor: pointer;">いいね</button
    >
  {/if}
</div>
