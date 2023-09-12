<script>
	import Logo from './Logo.svelte';
</script>

<footer>
	<div class="logo">
		<Logo />
		Meta Names
	</div>
	<div class="links">
		<a href="mailto:metanames@proton.me">Contact us</a>
		<a href="https://x.com/metanames_">Twitter</a>
	</div>
</footer>

<style>
	.logo {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.links {
		display: flex;
		flex-direction: column;
		align-items: center;

		& a {
			color: var(--mdc-theme-on-primary);
		}
	}

	footer {
		display: flex;
		flex-direction: row;
		justify-content: space-evenly;
		align-items: center;
		padding: 1rem;

		background-color: var(--mdc-theme-primary);

		@media only screen and (max-width: 600px) {
			flex-direction: column;
		}

		border-top: 1px solid var(--mdc-theme-secondary);
	}
</style>
