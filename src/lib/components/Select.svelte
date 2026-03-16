<script lang="ts">
	export let value: string | undefined = undefined;
	export let label: string = '';
	export let invalid: boolean = false;
	export let variant: 'outlined' | 'filled' | 'standard' = 'outlined';
	export let className: string = '';
	
	let isOpen = false;
	let selectRef: HTMLSelectElement;
	
	function handleFocus() {
		isOpen = true;
	}
	
	function handleBlur() {
		isOpen = false;
	}
	
	function handleChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		value = target.value || undefined;
	}
</script>

<div class="select-wrapper {className}" class:invalid class:focused={isOpen}>
	<select
		bind:this={selectRef}
		bind:value
		on:change={handleChange}
		on:focus={handleFocus}
		on:blur={handleBlur}
		class:outlined={variant === 'outlined'}
		class:filled={variant === 'filled'}
		class:standard={variant === 'standard'}
	>
		{#if label}
			<option value="" disabled selected={value === undefined}>{label}</option>
		{/if}
		<slot />
	</select>
	{#if label}
		<label class:floating={value && value !== ''}>{label}</label>
	{/if}
</div>

<style>
	.select-wrapper {
		position: relative;
		display: inline-flex;
		flex-direction: column;
		min-width: 120px;
	}
	
	select {
		appearance: none;
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 4px;
		padding: 16px 12px 8px;
		font-size: 16px;
		color: white;
		cursor: pointer;
		width: 100%;
		outline: none;
		transition: border-color 0.2s ease, box-shadow 0.2s ease;
	}
	
	select.outlined {
		border: 1px solid rgba(255, 255, 255, 0.3);
	}
	
	select.filled {
		border: none;
		background: rgba(255, 255, 255, 0.1);
	}
	
	select.standard {
		border: none;
		border-bottom: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 0;
	}
	
	select:focus {
		border-color: #6849fe;
		box-shadow: 0 0 0 2px rgba(104, 73, 254, 0.2);
	}
	
	.invalid select {
		border-color: #f44336;
	}
	
	.invalid select:focus {
		box-shadow: 0 0 0 2px rgba(244, 67, 54, 0.2);
	}
	
	label {
		position: absolute;
		left: 12px;
		top: 50%;
		transform: translateY(-50%);
		font-size: 16px;
		color: rgba(255, 255, 255, 0.6);
		pointer-events: none;
		transition: all 0.2s ease;
		background: transparent;
	}
	
	.select-wrapper.focused label {
		color: #6849fe;
	}
	
	label.floating {
		top: 8px;
		font-size: 12px;
		transform: translateY(0);
	}
	
	.invalid label {
		color: #f44336;
	}
	
	option {
		background: #1a1a2e;
		color: white;
		padding: 8px;
	}
</style>
