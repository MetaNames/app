<script lang="ts">
	import { metaNames } from '$lib';

	const maxDomainLength = metaNames.domainRepository.domainValidator.rules.maxLength;
	import Textfield from '@smui/textfield';
	import HelperText from '@smui/textfield/helper-text';
	import CharacterCounter from '@smui/textfield/character-counter';

	const validator = metaNames.domainRepository.domainValidator;
	let domain: string = '';

	$: errors = invalid ? validator.errors : [];
	$: invalid = domain !== '' && !validator.validate(domain, { raiseError: false });
</script>

<div>
	<Textfield
		class=""
		variant="outlined"
		bind:value={domain}
		bind:invalid
		label="Domain"
		input$maxlength={maxDomainLength}
	>
		<svelte:fragment slot="helper">
			<HelperText slot="helper">{errors.join(', ')}</HelperText>
			<CharacterCounter>0 / {maxDomainLength}</CharacterCounter>
		</svelte:fragment>
	</Textfield>
</div>
