import { FnRpcBuilder, type ContractAbi, AbiOutputBytes } from "@partisiablockchain/abi-client"
import { BigEndianByteOutput } from "@secata-public/bitmanipulation-ts"

export const actionAddVotersPayload = (contractAbi: ContractAbi, voters: string[]): Buffer => {
  if (!contractAbi.getFunctionByName('add_voters')) throw new Error('Function add_voters not found in contract abi')

  const rpc = new FnRpcBuilder('add_voters', contractAbi)
  const addresses = rpc.addVec()
  voters.map(voter => addresses.addAddress(Buffer.from(voter, 'hex')))

  return builderToBytesBe(rpc)
}

const builderToBytesBe = (rpc: FnRpcBuilder) => {
  const bitOutput = new BigEndianByteOutput()
  const abiOutputBits = new AbiOutputBytes(bitOutput)
  rpc.write(abiOutputBits)

  return bitOutput.toBuffer()
}
