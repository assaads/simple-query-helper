from typing import Dict, Optional
import asyncio
import logging
from datetime import datetime
from .controller import BrowserController
from ..models.messages import (
    BrowserActionRequest,
    BrowserActionResponse,
    WebSocketMessage,
    MessageType,
    create_error_message
)

logger = logging.getLogger(__name__)

class BrowserManager:
    def __init__(self):
        self._sessions: Dict[str, BrowserController] = {}
        self._locks: Dict[str, asyncio.Lock] = {}

    async def get_controller(self, session_id: str) -> BrowserController:
        """Get or create a browser controller for a session"""
        if session_id not in self._sessions:
            self._sessions[session_id] = BrowserController()
            self._locks[session_id] = asyncio.Lock()
            await self._sessions[session_id].initialize()
        return self._sessions[session_id]

    async def close_session(self, session_id: str):
        """Close a browser session and clean up resources"""
        if session_id in self._sessions:
            await self._sessions[session_id].close()
            del self._sessions[session_id]
            del self._locks[session_id]

    async def handle_action(self, message: WebSocketMessage) -> WebSocketMessage:
        """Handle a browser action request"""
        session_id = message.session_id
        request = BrowserActionRequest(**message.payload)
        
        try:
            # Get session lock
            lock = self._locks.get(session_id)
            if not lock:
                return create_error_message(
                    "SESSION_NOT_FOUND",
                    f"No active session found for ID: {session_id}"
                )

            async with lock:
                controller = await self.get_controller(session_id)
                response = await controller.execute_action(request)

                return WebSocketMessage(
                    type=MessageType.BROWSER_ACTION,
                    session_id=session_id,
                    payload=response.dict()
                )

        except Exception as e:
            logger.error(f"Error handling browser action for session {session_id}: {str(e)}")
            return create_error_message(
                "ACTION_ERROR",
                f"Failed to execute browser action: {str(e)}"
            )

    async def get_screenshot(self, session_id: str) -> Optional[str]:
        """Get the current screenshot for a session"""
        try:
            controller = await self.get_controller(session_id)
            return await controller.get_screenshot()
        except Exception as e:
            logger.error(f"Error getting screenshot for session {session_id}: {str(e)}")
            return None

    async def get_state(self, session_id: str) -> WebSocketMessage:
        """Get the current browser state for a session"""
        try:
            controller = await self.get_controller(session_id)
            state = await controller.get_state()
            
            return WebSocketMessage(
                type=MessageType.BROWSER_ACTION,
                session_id=session_id,
                payload={
                    "action": "get_state",
                    "state": state.dict(),
                    "timestamp": datetime.utcnow().isoformat()
                }
            )
        except Exception as e:
            logger.error(f"Error getting state for session {session_id}: {str(e)}")
            return create_error_message(
                "STATE_ERROR",
                f"Failed to get browser state: {str(e)}"
            )

# Global browser manager instance
browser_manager = BrowserManager()
