from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Union
from enum import Enum
from datetime import datetime


class StepStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    ERROR = "error"


class BrowserAction(str, Enum):
    NAVIGATE = "navigate"
    CLICK = "click"
    TYPE = "type"
    SCREENSHOT = "screenshot"
    WAIT = "wait"


class Step(BaseModel):
    id: str
    content: str
    status: StepStatus
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None


class BrowserState(BaseModel):
    url: str
    title: Optional[str] = None
    screenshot: Optional[str] = None  # Base64 encoded image
    last_action: Optional[BrowserAction] = None
    last_action_timestamp: Optional[datetime] = None
    form_data: Dict[str, str] = Field(default_factory=dict)


class WorkflowState(BaseModel):
    session_id: str
    current_step: Optional[Step] = None
    completed_steps: List[Step] = Field(default_factory=list)
    browser_state: BrowserState
    requires_input: bool = False
    input_prompt: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Message(BaseModel):
    id: str
    content: Union[str, dict]
    type: str  # 'user', 'agent', 'system', 'browser'
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict = Field(default_factory=dict)


class WorkflowMessage(BaseModel):
    workflow_id: str
    message: Message
    state: WorkflowState


class UserInput(BaseModel):
    session_id: str
    content: str
    input_type: str = "text"  # Can be 'text', 'choice', 'confirmation'
    metadata: Dict = Field(default_factory=dict)
