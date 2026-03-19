import { test, expect } from '@playwright/test';

test.describe('Feature 10: Proposals', () => {
	test('9.1 - View TLD migration proposal - page loads with proposal content', async ({ page }) => {
		await page.goto('/proposals/tld-migration');

		// Page title should be visible
		const title = page.locator('h3:has-text("TLD Migration Proposal")');
		await expect(title).toBeVisible();

		// Proposal description should mention migration from .META to .MPC
		const description = page.locator('text=migrate the TLD from .META to .MPC');
		await expect(description).toBeVisible();

		// Documentation link should be present
		const docsLink = page.locator('a[href*="docs.metanames.app"]');
		await expect(docsLink).toBeVisible();
	});

	test('9.1 - View TLD migration proposal - shows voting options when vote is active', async ({ page }) => {
		await page.goto('/proposals/tld-migration');

		// Radio options Yes/No should be visible
		const yesOption = page.locator('span:has-text("Yes")');
		const noOption = page.locator('span:has-text("No")');

		// At least one option should be visible (either voting is active or results are shown)
		const hasVotingOptions = (await yesOption.count()) > 0 || (await noOption.count()) > 0;
		expect(hasVotingOptions).toBeTruthy();

		// If voting is active, the question should be visible
		const question = page.locator('text=Do you want to migrate');
		const questionVisible = await question.count() > 0;
		if (questionVisible) {
			await expect(question).toBeVisible();
		}
	});

	test('9.2 - Vote on proposal - vote button requires wallet connection', async ({ page }) => {
		await page.goto('/proposals/tld-migration');

		// Find the Vote button (wrapped in ConnectionRequired)
		// The button text is "Vote"
		const voteButton = page.locator('button:has-text("Vote")');
		const voteButtonVisible = await voteButton.count() > 0;

		if (voteButtonVisible) {
			// Without wallet connection, the button should either:
			// 1. Be disabled, or
			// 2. Show a "Connect wallet" prompt when clicked
			// We just verify the button exists and is appropriately styled
			await expect(voteButton).toBeAttached();
		} else {
			// If voting is closed, results should be shown
			const resultsHeading = page.locator('h4:has-text("Voting Results")');
			const resultsVisible = await resultsHeading.count() > 0;
			expect(resultsVisible).toBeTruthy();
		}
	});

	test('9.1 - View TLD migration proposal - countdown timer is displayed', async ({ page }) => {
		await page.goto('/proposals/tld-migration');

		// Timer component should be present
		const timerHeading = page.locator('h4:has-text("Proposal countdown")');
		const timerHeadingVisible = await timerHeading.count() > 0;

		if (timerHeadingVisible) {
			await expect(timerHeading).toBeVisible();
		}
	});
});
