import {
	RpcBuilder,
	type ContractAbi,
	AbiBitOutput,
	ScValueStruct
} from '@partisiablockchain/abi-client';
import { BigEndianByteOutput } from '@secata-public/bitmanipulation-ts';

export const actionAddVotersPayload = (contractAbi: any, voters: string[]): Buffer => {
	const abi = contractAbi as ContractAbi;
	if (!abi.getFunctionByName('add_voters'))
		throw new Error('Function add_voters not found in contract abi');

	// @ts-ignore - RpcBuilder accepts ContractAbi at runtime
	const rpc = new RpcBuilder('add_voters', abi);
	const addresses = rpc.addVec();
	voters.map((voter) => addresses.addAddress(Buffer.from(voter, 'hex')));

	return builderToBytesBe(rpc);
};

export const actionRemoveVotersPayload = (contractAbi: any, voters: string[]): Buffer => {
	const abi = contractAbi as ContractAbi;
	if (!abi.getFunctionByName('remove_voters'))
		throw new Error('Function add_voters not found in contract abi');

	// @ts-ignore - RpcBuilder accepts ContractAbi at runtime
	const rpc = new RpcBuilder('remove_voters', abi);
	const addresses = rpc.addVec();
	voters.map((voter) => addresses.addAddress(Buffer.from(voter, 'hex')));

	return builderToBytesBe(rpc);
};

export const actionVotePayload = (contractAbi: any, vote: boolean): Buffer => {
	const abi = contractAbi as ContractAbi;
	if (!abi.getFunctionByName('vote'))
		throw new Error('Function vote not found in contract abi');

	// @ts-ignore - RpcBuilder accepts ContractAbi at runtime
	const rpc = new RpcBuilder('vote', abi);
	rpc.addBool(vote);

	return builderToBytesBe(rpc);
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

const builderToBytesBe = (rpc: RpcBuilder) => {
	const bitOutput = new BigEndianByteOutput();
	const abiOutputBits = new AbiBitOutput(bitOutput as any);
	rpc.write(abiOutputBits);

	return bitOutput.toBuffer();
};
