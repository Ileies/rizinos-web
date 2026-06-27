<script lang="ts">
	// TODO: Implement a pretty about me
	import Container from '$ui/homepage/Container.svelte';
</script>

<Container>
	<div class="py-24 sm:py-32">
		<img
			alt="description"
			class="float-left mr-4 h-auto w-32 rounded-full"
			src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
		/>
		<div>
			<h2 class="mb-5 text-lg font-bold">Hi! I'm ....</h2>
			<p class="mb-5 text-lg">
				This is my background and the reason why I am qualified to solve problem X. <span
					class="text-foreground/60"
				>
					Lorem ipsum dolor, sit amet consectetur adipisicing elit. Facilis optio sapiente
				</span>
			</p>
			<p class="mb-5 text-lg">
				I noticed problem X and that is why I build this product that helps solve it. <span
					class="text-foreground/60"
				>
					Lorem ipsum, dolor sit amet consectetur adipisicing elit. Dicta, recusandae! Lorem ipsum
					dolor sit amet, consectetur adipisicing elit.
				</span>
			</p>

			<p class="mb-10 text-lg">
				Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam molestias, accusamus
				molestiae deleniti quod laboriosam aut animi! Culpa, dolore, adipisci itaque debitis.
			</p>
			<p class="my-5 text-lg font-bold">Here is a bullet list of the key benefits</p>
			<ul class="list-disc space-y-2 pl-5">
				<li><span class="font-bold">You find god</span> and she finds you</li>
				<li>
					<span class="font-bold">You make a million dollars</span> and your parents as well
				</li>
				<li><span class="font-bold">World peace gets achieved</span> and you get the credits</li>
			</ul>
		</div>
	</div>
</Container>
