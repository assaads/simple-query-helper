from playwright.async_api import async_playwright, Browser, Page
from typing import Optional, Dict, Any
import base64
from io import BytesIO
import asyncio
import logging
from ..models.state import BrowserState, BrowserAction
from ..models.messages import BrowserActionRequest, BrowserActionResponse, BrowserActionType

logger = logging.getLogger(__name__)

class BrowserController:
    def __init__(self):
        self._browser: Optional[Browser] = None
        self._page: Optional[Page] = None
        self._context = None
        self._initialized = False

    async def initialize(self):
        """Initialize the browser instance"""
        if not self._initialized:
            playwright = await async_playwright().start()
            self._browser = await playwright.chromium.launch(headless=True)
            self._context = await self._browser.new_context()
            self._page = await self._context.new_page()
            self._initialized = True
            logger.info("Browser controller initialized")

    async def close(self):
        """Clean up browser resources"""
        if self._initialized:
            await self._context.close()
            await self._browser.close()
            self._initialized = False
            logger.info("Browser controller closed")

    async def get_screenshot(self) -> str:
        """Capture screenshot and return as base64"""
        if not self._initialized:
            await self.initialize()
        
        screenshot_bytes = await self._page.screenshot()
        return base64.b64encode(screenshot_bytes).decode('utf-8')

    async def get_state(self) -> BrowserState:
        """Get current browser state"""
        if not self._initialized:
            await self.initialize()

        return BrowserState(
            url=self._page.url,
            title=await self._page.title(),
            screenshot=await self.get_screenshot(),
            form_data={}  # TODO: Implement form data collection
        )

    async def execute_action(self, action: BrowserActionRequest) -> BrowserActionResponse:
        """Execute a browser action and return the response"""
        if not self._initialized:
            await self.initialize()

        try:
            result: Dict[str, Any] = {}
            
            if action.action == BrowserActionType.NAVIGATE:
                await self._page.goto(action.params["url"])
                result["title"] = await self._page.title()
                
            elif action.action == BrowserActionType.CLICK:
                selector = action.params["selector"]
                await self._page.click(selector)
                
            elif action.action == BrowserActionType.TYPE:
                selector = action.params["selector"]
                text = action.params["text"]
                await self._page.fill(selector, text)
                
            elif action.action == BrowserActionType.WAIT:
                if "selector" in action.params:
                    await self._page.wait_for_selector(action.params["selector"])
                else:
                    await asyncio.sleep(action.params.get("timeout", 1))
                    
            elif action.action == BrowserActionType.SCREENSHOT:
                result["screenshot"] = await self.get_screenshot()
                
            elif action.action == BrowserActionType.SCROLL:
                if "selector" in action.params:
                    element = await self._page.query_selector(action.params["selector"])
                    await element.scroll_into_view_if_needed()
                else:
                    await self._page.evaluate(
                        f"window.scrollBy(0, {action.params.get('amount', 100)})"
                    )
                    
            elif action.action == BrowserActionType.SELECT:
                selector = action.params["selector"]
                value = action.params["value"]
                await self._page.select_option(selector, value)

            # Capture screenshot after action
            result["screenshot"] = await self.get_screenshot()
            result["url"] = self._page.url
            result["title"] = await self._page.title()

            return BrowserActionResponse(
                success=True,
                action=action.action,
                result=result
            )

        except Exception as e:
            logger.error(f"Error executing browser action: {str(e)}")
            return BrowserActionResponse(
                success=False,
                action=action.action,
                error=str(e)
            )

    async def __aenter__(self):
        """Async context manager entry"""
        await self.initialize()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        await self.close()
