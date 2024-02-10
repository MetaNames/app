<script>
	import { config } from 'src/lib';
	import Logo from 'src/routes/Logo.svelte';
</script>

<footer>
	<div class="logo">
		<Logo color="dark" />
		<span>Meta Names</span>
	</div>
	<div class="links">
		<a href={config.landingUrl} target="_blank">Landing</a>
		<a href="https://t.me/mpc_metanames" target="_blank">Telegram</a>
		<a href="https://x.com/metanames_" target="_blank">Twitter</a>
		<a href="https://github.com/metanames" target="_blank">GitHub</a>
		<a href="https://github.com/metanames/sdk/wiki" target="_blank">API Docs</a>
	</div>
</footer>

<style lang="scss">
	.logo {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.links {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-evenly;

		a {
			margin: 0 0.5rem;
		}
	}

	a,
	span {
		font-size: small;
		color: var(--mdc-theme-on-background);
		text-decoration: none;
	}

	footer {
		display: flex;
		flex-direction: row;
		justify-content: space-evenly;
		align-items: center;
		padding: 1rem 0;

		@media only screen and (max-width: 600px) {
			flex-direction: column;
		}

		border-top: 1px solid var(--mdc-theme-secondary);
	}
</style>
