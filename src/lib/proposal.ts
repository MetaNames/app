import {
	RpcContractBuilder,
	type ContractAbi,
	ScValueStruct
} from '@partisiablockchain/abi-client';

export const actionAddVotersPayload = (contractAbi: ContractAbi, voters: string[]): Buffer => {
	if (!contractAbi.getFunctionByName('add_voters'))
		throw new Error('Function add_voters not found in contract abi');

	const rpc = new RpcContractBuilder(contractAbi, 'add_voters');
	const addresses = rpc.addVec();
	voters.map((voter) => addresses.addAddress(Buffer.from(voter, 'hex')));

	return rpc.getBytes();
};

export const actionRemoveVotersPayload = (contractAbi: ContractAbi, voters: string[]): Buffer => {
	if (!contractAbi.getFunctionByName('remove_voters'))
		throw new Error('Function add_voters not found in contract abi');

	const rpc = new RpcContractBuilder(contractAbi, 'remove_voters');
	const addresses = rpc.addVec();
	voters.map((voter) => addresses.addAddress(Buffer.from(voter, 'hex')));

	return rpc.getBytes();
};

export const actionVotePayload = (contractAbi: ContractAbi, vote: boolean): Buffer => {
	if (!contractAbi.getFunctionByName('vote'))
		throw new Error('Function vote not found in contract abi');

	const rpc = new RpcContractBuilder(contractAbi, 'vote');
	rpc.addBool(vote);

	return rpc.getBytes();
};

export const getDeadline = (contractState: ScValueStruct) => {
	const deadline = contractState.fieldsMap.get('deadline_utc_millis')?.asBN().toNumber();
	if (!deadline) throw new Error('Deadline not found in contract state');

	return deadline;
};

export const getVotesResult = (contractState: ScValueStruct) => {
	const votes = contractState.fieldsMap.get('votes')?.avlTreeMapValue();
	if (!votes) throw new Error('Results not found in contract state');
	const votesMap = votes.map;
	if (!votesMap) throw new Error('Results map not found in contract state');

	const result = { approved: 0, rejected: 0 };
	votesMap.forEach((vote) => {
		const approved = vote.boolValue();

		if (approved) result.approved++;
		else result.rejected++;
	});

	return result;
};
