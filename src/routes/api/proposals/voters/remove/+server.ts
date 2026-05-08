import { metaNamesSdk } from '$lib/server';
import { json } from '@sveltejs/kit';
import {
	proposalsWalletPrivateKey,
	tldMigrationProposalContractAddress
} from 'src/lib/server/config';
import { actionRemoveVotersPayload } from 'src/lib/proposal';

export async function GET() {
	metaNamesSdk.setSigningStrategy('privateKey', proposalsWalletPrivateKey);

	const votingContractState = await metaNamesSdk.contractRepository.getState({
		contractAddress: tldMigrationProposalContractAddress
	});
	const fields = votingContractState.fieldsMap;

	const deadline = fields.get('deadline_utc_millis')?.asBN().toNumber();
	if (deadline && deadline < Date.now())
		return json({ error: 'Voting has ended' }, { status: 400 });

	const owners = await metaNamesSdk.domainRepository.getOwners();
	const voters =
		fields
			.get('voters')
			?.setValue()
			.values.map((voter) => voter.addressValue().value.toString('hex')) ?? [];

	// Optimization: Convert the lookup array into a Set for O(1) lookup complexity.
	const ownersSet = new Set(owners);

	const votersToRemove = [];
	// Optimization: Using a for loop instead of .filter().slice() allows for early exit
	// as soon as we reach the 50 item limit, saving unnecessary iterations.
	for (const voter of voters) {
		if (!ownersSet.has(voter)) {
			votersToRemove.push(voter);
			if (votersToRemove.length === 50) break;
		}
	}

	if (votersToRemove.length === 0) return json({ newVoters: votersToRemove }, { status: 200 });

	const votingContract = await metaNamesSdk.contractRepository.getContract({
		contractAddress: tldMigrationProposalContractAddress
	});
	const payload = actionRemoveVotersPayload(votingContract.abi, votersToRemove);

	const { transactionHash } = await metaNamesSdk.contractRepository.createTransaction({
		contractAddress: tldMigrationProposalContractAddress,
		payload,
		gasCost: 'low'
	});

	metaNamesSdk.resetSigningStrategy();

	return json({ newVoters: votersToRemove, transactionHash });
}
