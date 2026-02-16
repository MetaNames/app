from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        blockchain_requests = []
        def handle_request(request):
            if "partisiablockchain.com" in request.url:
                print(f"BLOCKCHAIN REQUEST: {request.url}")
                blockchain_requests.append(request.url)

        page.on("request", handle_request)

        print("Navigating to home page...")
        page.goto("http://localhost:5173/")
        page.wait_for_load_state("networkidle")

        input_selector = "input[type='text']"
        page.wait_for_selector(input_selector)

        print("Typing 'bolt'...")
        page.fill(input_selector, "bolt")

        # Wait for debounce + network using Playwright method
        page.wait_for_timeout(8000)

        count_1 = len(blockchain_requests)
        print(f"Blockchain requests after 1st type: {count_1}")

        print("Clearing input...")
        page.fill(input_selector, "")
        page.wait_for_timeout(1000)

        print("Typing 'bolt' again...")
        page.fill(input_selector, "bolt")

        # Wait for potential new requests
        page.wait_for_timeout(5000)

        count_2 = len(blockchain_requests)
        print(f"Blockchain requests after 2nd type: {count_2}")

        if count_1 > 0 and count_2 == count_1:
             print("SUCCESS: Caching works! No new requests.")
        elif count_1 == 0:
             print("WARNING: No requests at all.")
        else:
             print(f"FAILURE: New requests detected. ({count_2 - count_1} new)")

        page.screenshot(path="verification_success.png")
        browser.close()

if __name__ == "__main__":
    run()
