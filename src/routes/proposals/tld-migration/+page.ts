import { config } from 'src/lib';
import { getDeadline } from 'src/lib/proposal';
import { metaNamesSdkFactory } from 'src/lib/sdk.js';

export async function load() {
  const state = await metaNamesSdkFactory().contractRepository.getState({ contractAddress: config.tldMigrationProposalContractAddress });

  const deadlineInSeconds = getDeadline(state) / 1000;
  return { deadlineInSeconds };
}
