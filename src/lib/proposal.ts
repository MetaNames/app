import { FnRpcBuilder, type ContractAbi, AbiOutputBytes, ScValueStruct } from "@partisiablockchain/abi-client"
import { BigEndianByteOutput } from "@secata-public/bitmanipulation-ts"

export const actionAddVotersPayload = (contractAbi: ContractAbi, voters: string[]): Buffer => {
  if (!contractAbi.getFunctionByName('add_voters')) throw new Error('Function add_voters not found in contract abi')

  const rpc = new FnRpcBuilder('add_voters', contractAbi)
  const addresses = rpc.addVec()
  voters.map(voter => addresses.addAddress(Buffer.from(voter, 'hex')))

  return builderToBytesBe(rpc)
}

export const actionRemoveVotersPayload = (contractAbi: ContractAbi, voters: string[]): Buffer => {
  if (!contractAbi.getFunctionByName('remove_voters')) throw new Error('Function add_voters not found in contract abi')

  const rpc = new FnRpcBuilder('remove_voters', contractAbi)
  const addresses = rpc.addVec()
  voters.map(voter => addresses.addAddress(Buffer.from(voter, 'hex')))

  return builderToBytesBe(rpc)
}

export const actionVotePayload = (contractAbi: ContractAbi, vote: boolean): Buffer => {
  if (!contractAbi.getFunctionByName('vote')) throw new Error('Function vote not found in contract abi')

  const rpc = new FnRpcBuilder('vote', contractAbi)
  rpc.addBool(vote)

  return builderToBytesBe(rpc)
}

export const getDeadline = (contractState: ScValueStruct) => {
  const deadline = contractState.fieldsMap.get('deadline_utc_millis')?.asBN().toNumber()
  if (!deadline) throw new Error('Deadline not found in contract state')

  return deadline
}

export const getVotesResult = (contractState: ScValueStruct) => {
  const votes = contractState.fieldsMap.get('votes')?.avlTreeMapValue()
  if (!votes) throw new Error('Results not found in contract state')
  const votesMap = votes.map
  if (!votesMap) throw new Error('Results map not found in contract state')

  const result = { approved: 0, rejected: 0 }
  votesMap.forEach((vote) => {
    const approved = vote.boolValue()

    if (approved) result.approved++
    else result.rejected++
  })

  return result
}

const builderToBytesBe = (rpc: FnRpcBuilder) => {
  const bitOutput = new BigEndianByteOutput()
  const abiOutputBits = new AbiOutputBytes(bitOutput)
  rpc.write(abiOutputBits)

  return bitOutput.toBuffer()
}
