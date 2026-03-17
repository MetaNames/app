import { metaNamesSdk } from '$lib/server';
import { json } from '@sveltejs/kit';
import {
	proposalsWalletPrivateKey,
	tldMigrationProposalContractAddress
} from 'src/lib/server/config';
import { actionRemoveVotersPayload } from 'src/lib/proposal';
import type { ContractAbi } from '@partisiablockchain/abi-client';

export async function GET() {
	metaNamesSdk.setSigningStrategy('privateKey', proposalsWalletPrivateKey);

	let votingContractState;
	try {
		votingContractState = await metaNamesSdk.contractRepository.getState({
			contractAddress: tldMigrationProposalContractAddress
		});
	} catch (err) {
		console.error('getState error:', err);
		metaNamesSdk.resetSigningStrategy();
		return json({ error: 'Failed to get contract state', details: String(err) }, { status: 500 });
	}
	
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

	const votersToRemove = voters.filter((voter) => !owners.includes(voter)).slice(0, 50);
	if (votersToRemove.length === 0) return json({ newVoters: votersToRemove }, { status: 200 });

	const votingContract = await metaNamesSdk.contractRepository.getContract({
		contractAddress: tldMigrationProposalContractAddress
	});
	const payload = actionRemoveVotersPayload(votingContract.abi as ContractAbi, votersToRemove);

	const { transactionHash } = await metaNamesSdk.contractRepository.createTransaction({
		contractAddress: tldMigrationProposalContractAddress,
		payload,
		gasCost: 'low'
	});

	metaNamesSdk.resetSigningStrategy();

	return json({ newVoters: votersToRemove, transactionHash });
}
