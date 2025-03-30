from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Union, Any
from datetime import datetime
from enum import Enum

class MessageType(str, Enum):
    BROWSER_ACTION = "browser_action"
    WORKFLOW_UPDATE = "workflow_update"
    USER_INPUT = "user_input"
    AGENT_THOUGHT = "agent_thought"
    SYSTEM_EVENT = "system_event"
    ERROR = "error"
    PING = "ping"
    PONG = "pong"

class BrowserActionType(str, Enum):
    NAVIGATE = "navigate"
    CLICK = "click"
    TYPE = "type"
    WAIT = "wait"
    SCREENSHOT = "screenshot"
    SCROLL = "scroll"
    SELECT = "select"

class BrowserActionRequest(BaseModel):
    action: BrowserActionType
    params: Dict[str, Any]
    timeout: Optional[int] = 30  # Timeout in seconds

class BrowserActionResponse(BaseModel):
    success: bool
    action: BrowserActionType
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class AgentThought(BaseModel):
    thought: str
    plan: Optional[List[str]] = None
    reasoning: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class SystemEvent(BaseModel):
    event_type: str
    details: Dict[str, Any]
    severity: str = "info"  # info, warning, error
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class UserInputRequest(BaseModel):
    prompt: str
    input_type: str = "text"  # text, choice, confirmation
    options: Optional[List[str]] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    timeout: Optional[int] = None  # Timeout in seconds

class UserInputResponse(BaseModel):
    input_id: str
    content: Union[str, bool, int]  # Support different input types
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class WebSocketMessage(BaseModel):
    type: MessageType
    session_id: str
    payload: Union[
        BrowserActionRequest,
        BrowserActionResponse,
        AgentThought,
        SystemEvent,
        UserInputRequest,
        UserInputResponse,
        Dict[str, Any]  # For generic messages
    ]
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    message_id: str = Field(default_factory=lambda: f"{datetime.utcnow().timestamp()}")

class ErrorMessage(BaseModel):
    code: str
    message: str
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

def create_error_message(code: str, message: str, details: Optional[Dict[str, Any]] = None) -> WebSocketMessage:
    """Helper function to create error messages"""
    return WebSocketMessage(
        type=MessageType.ERROR,
        session_id="system",
        payload=ErrorMessage(
            code=code,
            message=message,
            details=details
        ).dict()
    )

def create_system_event(event_type: str, details: Dict[str, Any], severity: str = "info") -> WebSocketMessage:
    """Helper function to create system events"""
    return WebSocketMessage(
        type=MessageType.SYSTEM_EVENT,
        session_id="system",
        payload=SystemEvent(
            event_type=event_type,
            details=details,
            severity=severity
        ).dict()
    )
