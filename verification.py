from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    try:
        page.goto("http://localhost:4173")

        # Wait for the search component to be visible
        page.wait_for_selector(".search-container")

        # Check if results container has aria-live
        results_container = page.locator(".search-results")
        aria_live = results_container.get_attribute("aria-live")
        print(f"aria-live attribute: {aria_live}")

        if aria_live != "polite":
            print("ERROR: aria-live attribute is missing or incorrect")
        else:
            print("SUCCESS: aria-live attribute is present and correct")

        # Check search button
        search_button = page.get_by_label("search")
        if search_button.is_visible():
            print("SUCCESS: Search button is visible")

        # Type something to trigger search (and potentially loading state)
        page.get_by_label("Domain name").fill("test")

        # Wait a bit for UI to update (loading spinner)
        page.wait_for_timeout(2000)

        # Take screenshot
        page.screenshot(path="verification.png")
        print("Screenshot saved to verification.png")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        browser.close()

if __name__ == "__main__":
    with sync_playwright() as playwright:
        run(playwright)
