from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, Set
import json
from datetime import datetime

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.session_info: Dict[str, dict] = {}
    
    async def connect(self, session_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[session_id] = websocket
        self.session_info[session_id] = {
            "connected_at": datetime.utcnow().isoformat(),
            "last_activity": datetime.utcnow().isoformat()
        }
    
    def disconnect(self, session_id: str):
        self.active_connections.pop(session_id, None)
        self.session_info.pop(session_id, None)
    
    async def send_message(self, session_id: str, message: dict):
        if session_id in self.active_connections:
            await self.active_connections[session_id].send_json(message)
            self.session_info[session_id]["last_activity"] = datetime.utcnow().isoformat()
    
    async def broadcast(self, message: dict, exclude: Set[str] = None):
        exclude = exclude or set()
        for session_id in self.active_connections:
            if session_id not in exclude:
                await self.send_message(session_id, message)

# Create a global connection manager instance
manager = ConnectionManager()

@router.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await manager.connect(session_id, websocket)
    
    try:
        while True:
            # Receive and parse message
            data = await websocket.receive_json()
            
            # Update session activity
            manager.session_info[session_id]["last_activity"] = datetime.utcnow().isoformat()
            
            # Process message based on type
            message_type = data.get("type")
            payload = data.get("payload", {})
            
            if message_type == "ping":
                await manager.send_message(session_id, {
                    "type": "pong",
                    "timestamp": datetime.utcnow().isoformat()
                })
            else:
                # Echo back for now, will be replaced with actual handlers
                await manager.send_message(session_id, {
                    "type": "received",
                    "original_type": message_type,
                    "timestamp": datetime.utcnow().isoformat(),
                    "payload": payload
                })
                
    except WebSocketDisconnect:
        manager.disconnect(session_id)
    except Exception as e:
        # Log error and clean up connection
        print(f"Error in websocket connection {session_id}: {str(e)}")
        manager.disconnect(session_id)
        raise

@router.get("/sessions")
async def get_sessions():
    """Get information about active sessions"""
    return {
        "active_sessions": len(manager.active_connections),
        "sessions": manager.session_info
    }
