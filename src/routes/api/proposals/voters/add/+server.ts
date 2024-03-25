import { metaNamesSdk } from '$lib/server';
import { json } from '@sveltejs/kit';
import { config } from 'src/lib';
import { proposalsWalletPrivateKey } from 'src/lib/server/config';
import { actionAddVotersPayload } from 'src/lib/proposal';

export async function GET() {
	metaNamesSdk.setSigningStrategy('privateKey', proposalsWalletPrivateKey);

	const votingContractState = await metaNamesSdk.contractRepository.getState({
		contractAddress: config.tldMigrationProposalContractAddress
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

	const newVoters = owners.filter((owner) => !voters.includes(owner)).slice(0, 50);
	if (newVoters.length === 0) return json({ newVoters }, { status: 200 });

	const votingContract = await metaNamesSdk.contractRepository.getContract({
		contractAddress: config.tldMigrationProposalContractAddress
	});
	const payload = actionAddVotersPayload(votingContract.abi, newVoters);

	const { transactionHash } = await metaNamesSdk.contractRepository.createTransaction({
		contractAddress: config.tldMigrationProposalContractAddress,
		payload,
		gasCost: 'low'
	});

	metaNamesSdk.resetSigningStrategy();

	return json({ newVoters, transactionHash });
}
