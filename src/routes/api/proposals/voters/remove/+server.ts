
import { metaNamesSdk } from "$lib/server";
import { json } from "@sveltejs/kit";
import { proposalsWalletPrivateKey, tldMigrationProposalContractAddress } from "src/lib/server/config";
import { actionRemoveVotersPayload } from "src/lib/server/proposal";

export async function GET() {
  metaNamesSdk.setSigningStrategy('privateKey', proposalsWalletPrivateKey)

  const votingContractState = await metaNamesSdk.contractRepository.getState({ contractAddress: tldMigrationProposalContractAddress })
  const fields = votingContractState.fieldsMap

  const deadline = fields.get('deadline_utc_millis')?.asBN().toNumber()
  if (deadline && deadline < Date.now()) return json({ error: 'Voting has ended' }, { status: 400 })

  const owners = await metaNamesSdk.domainRepository.getOwners()
  const voters = fields.get('voters')?.setValue().values.map((voter) => voter.addressValue().value.toString('hex')) ?? []

  const votersToRemove = voters.filter((voter) => !owners.includes(voter)).slice(0, 50)
  if (votersToRemove.length === 0) return json({ newVoters: votersToRemove }, { status: 200 })

  const votingContract = await metaNamesSdk.contractRepository.getContract({ contractAddress: tldMigrationProposalContractAddress })
  const payload = actionRemoveVotersPayload(votingContract.abi, votersToRemove)

  const { transactionHash } = await metaNamesSdk.contractRepository.createTransaction({ contractAddress: tldMigrationProposalContractAddress, payload, gasCost: 'low' })

  metaNamesSdk.resetSigningStrategy()

  return json({ newVoters: votersToRemove, transactionHash, result })
}
