import { FnRpcBuilder, type ContractAbi, AbiOutputBytes } from "@partisiablockchain/abi-client"
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

const builderToBytesBe = (rpc: FnRpcBuilder) => {
  const bitOutput = new BigEndianByteOutput()
  const abiOutputBits = new AbiOutputBytes(bitOutput)
  rpc.write(abiOutputBits)

  return bitOutput.toBuffer()
}
