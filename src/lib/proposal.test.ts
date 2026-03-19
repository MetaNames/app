import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	actionAddVotersPayload,
	actionRemoveVotersPayload,
	actionVotePayload,
	getDeadline,
	getVotesResult
} from './proposal';
import type { ContractAbi, ScValueStruct } from '@partisiablockchain/abi-client';

// Mock the ABI client
vi.mock('@partisiablockchain/abi-client', async () => {
	const actual = await vi.importActual('@partisiablockchain/abi-client');
	return {
		...actual,
		RpcBuilder: vi.fn().mockImplementation(() => ({
			addVec: vi.fn().mockReturnValue({
				addAddress: vi.fn()
			}),
			addBool: vi.fn(),
			write: vi.fn()
		})),
		AbiByteOutput: vi.fn().mockImplementation(() => ({
			write: vi.fn()
		}))
	};
});

// Mock bitmanipulation
vi.mock('@secata-public/bitmanipulation-ts', () => ({
	BigEndianByteOutput: vi.fn().mockImplementation(() => ({
		toBuffer: vi.fn().mockReturnValue(Buffer.from('mocked-buffer'))
	}))
}));

describe('Proposal - Action Payloads', () => {
	let mockContractAbi: Partial<ContractAbi>;

	beforeEach(() => {
		mockContractAbi = {
			getFunctionByName: vi.fn().mockReturnValue({ name: 'add_voters' })
		};
	});

	describe('actionAddVotersPayload', () => {
		it('should throw error when add_voters function not found in ABI', () => {
			const invalidAbi = {
				getFunctionByName: vi.fn().mockReturnValue(undefined)
			} as unknown as ContractAbi;

			expect(() => actionAddVotersPayload(invalidAbi, ['0x1234'])).toThrow(
				'Function add_voters not found in contract abi'
			);
		});

		it('should return Buffer when valid ABI and voters provided', () => {
			const result = actionAddVotersPayload(mockContractAbi as ContractAbi, ['0x1234567890abcdef']);
			
			expect(result).toBeDefined();
			expect(Buffer.isBuffer(result)).toBe(true);
		});

		it('should handle empty voters array', () => {
			const result = actionAddVotersPayload(mockContractAbi as ContractAbi, []);
			
			expect(result).toBeDefined();
			expect(Buffer.isBuffer(result)).toBe(true);
		});

		it('should handle multiple voters', () => {
			const voters = ['0x1234567890abcdef', '0xfedcba0987654321', '0x0a0a0a0a0a0a0a0a'];
			const result = actionAddVotersPayload(mockContractAbi as ContractAbi, voters);
			
			expect(result).toBeDefined();
			expect(Buffer.isBuffer(result)).toBe(true);
		});
	});

	describe('actionRemoveVotersPayload', () => {
		it('should throw error when remove_voters function not found in ABI', () => {
			const invalidAbi = {
				getFunctionByName: vi.fn().mockReturnValue(undefined)
			} as unknown as ContractAbi;

			expect(() => actionRemoveVotersPayload(invalidAbi, ['0x1234'])).toThrow(
				'Function add_voters not found in contract abi'
			);
		});

		it('should return Buffer when valid ABI and voters provided', () => {
			const result = actionRemoveVotersPayload(mockContractAbi as ContractAbi, ['0x1234567890abcdef']);
			
			expect(result).toBeDefined();
			expect(Buffer.isBuffer(result)).toBe(true);
		});

		it('should handle empty voters array', () => {
			const result = actionRemoveVotersPayload(mockContractAbi as ContractAbi, []);
			
			expect(result).toBeDefined();
			expect(Buffer.isBuffer(result)).toBe(true);
		});
	});

	describe('actionVotePayload', () => {
		let voteAbi: Partial<ContractAbi>;

		beforeEach(() => {
			voteAbi = {
				getFunctionByName: vi.fn().mockReturnValue({ name: 'vote' })
			};
		});

		it('should throw error when vote function not found in ABI', () => {
			const invalidAbi = {
				getFunctionByName: vi.fn().mockReturnValue(undefined)
			} as unknown as ContractAbi;

			expect(() => actionVotePayload(invalidAbi, true)).toThrow(
				'Function vote not found in contract abi'
			);
		});

		it('should return Buffer when voting true', () => {
			const result = actionVotePayload(voteAbi as ContractAbi, true);
			
			expect(result).toBeDefined();
			expect(Buffer.isBuffer(result)).toBe(true);
		});

		it('should return Buffer when voting false', () => {
			const result = actionVotePayload(voteAbi as ContractAbi, false);
			
			expect(result).toBeDefined();
			expect(Buffer.isBuffer(result)).toBe(true);
		});
	});
});

describe('Proposal - State Parsing', () => {
	describe('getDeadline', () => {
		it('should extract deadline from contract state', () => {
			const mockBN = {
				toNumber: vi.fn().mockReturnValue(1700000000000)
			};
			
			const mockField = {
				asBN: vi.fn().mockReturnValue(mockBN)
			};
			
			const mockFieldsMap = new Map([['deadline_utc_millis', mockField]]);
			
			const mockContractState = {
				fieldsMap: {
					get: (key: string) => mockFieldsMap.get(key)
				}
			} as unknown as ScValueStruct;

			const result = getDeadline(mockContractState);
			
			expect(result).toBe(1700000000000);
		});

		it('should throw error when deadline not found in contract state', () => {
			const mockContractState = {
				fieldsMap: {
					get: vi.fn().mockReturnValue(undefined)
				}
			} as unknown as ScValueStruct;

			expect(() => getDeadline(mockContractState)).toThrow(
				'Deadline not found in contract state'
			);
		});
	});

	describe('getVotesResult', () => {
		it('should count approved and rejected votes', () => {
			const mockVotes = [
				{ boolValue: vi.fn().mockReturnValue(true) },
				{ boolValue: vi.fn().mockReturnValue(true) },
				{ boolValue: vi.fn().mockReturnValue(false) },
				{ boolValue: vi.fn().mockReturnValue(false) },
				{ boolValue: vi.fn().mockReturnValue(true) }
			];
			
			const mockMap = new Map(mockVotes.map((v, i) => [i, v]));
			
			const mockAvlTree = {
				map: mockMap
			};
			
			const mockField = {
				avlTreeMapValue: vi.fn().mockReturnValue(mockAvlTree)
			};
			
			const mockFieldsMap = new Map([['votes', mockField]]);
			
			const mockContractState = {
				fieldsMap: {
					get: (key: string) => mockFieldsMap.get(key)
				}
			} as unknown as ScValueStruct;

			const result = getVotesResult(mockContractState);
			
			expect(result.approved).toBe(3);
			expect(result.rejected).toBe(2);
		});

		it('should throw error when votes field not found', () => {
			const mockContractState = {
				fieldsMap: {
					get: vi.fn().mockReturnValue(undefined)
				}
			} as unknown as ScValueStruct;

			expect(() => getVotesResult(mockContractState)).toThrow(
				'Results not found in contract state'
			);
		});

		it('should throw error when votes map not found', () => {
			const mockField = {
				avlTreeMapValue: vi.fn().mockReturnValue({})
			};
			
			const mockFieldsMap = new Map([['votes', mockField]]);
			
			const mockContractState = {
				fieldsMap: {
					get: (key: string) => mockFieldsMap.get(key)
				}
			} as unknown as ScValueStruct;

			expect(() => getVotesResult(mockContractState)).toThrow(
				'Results map not found in contract state'
			);
		});

		it('should handle empty votes', () => {
			const mockMap = new Map();
			
			const mockAvlTree = {
				map: mockMap
			};
			
			const mockField = {
				avlTreeMapValue: vi.fn().mockReturnValue(mockAvlTree)
			};
			
			const mockFieldsMap = new Map([['votes', mockField]]);
			
			const mockContractState = {
				fieldsMap: {
					get: (key: string) => mockFieldsMap.get(key)
				}
			} as unknown as ScValueStruct;

			const result = getVotesResult(mockContractState);
			
			expect(result.approved).toBe(0);
			expect(result.rejected).toBe(0);
		});
	});
});
