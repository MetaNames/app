
import { metaNamesSdk } from "$lib/server";
import { json } from "@sveltejs/kit";
import { proposalsWalletPrivateKey, tldMigrationProposalContractAddress } from "src/lib/server/config";
import { actionAddVotersPayload } from "src/lib/server/proposal";

export async function GET() {
  metaNamesSdk.setSigningStrategy('privateKey', proposalsWalletPrivateKey)

  const votingContractState = await metaNamesSdk.contractRepository.getState({ contractAddress: tldMigrationProposalContractAddress })
  const fields = votingContractState.fieldsMap

  const deadline = fields.get('deadline_utc_millis')?.asBN().toNumber()
  if (deadline && deadline < Date.now()) return json({ error: 'Voting has ended' }, { status: 400 })

  const owners = await metaNamesSdk.domainRepository.getOwners()
  const voters = fields.get('voters')?.setValue().values.map((voter) => voter.addressValue().value.toString('hex')) ?? []

  const newVoters = owners.filter((owner) => !voters.includes(owner))
  if (newVoters.length === 0) return json({ newVoters }, { status: 200 })

  const votingContract = await metaNamesSdk.contractRepository.getContract({ contractAddress: tldMigrationProposalContractAddress })
  const payload = actionAddVotersPayload(votingContract.abi, newVoters)

  const { transactionHash, fetchResult } = await metaNamesSdk.contractRepository.createTransaction({ contractAddress: tldMigrationProposalContractAddress, payload, gasCost: 'low' })

  metaNamesSdk.resetSigningStrategy()

  const result = await fetchResult


  return json({ newVoters, transactionHash, result })
}
