from typing import Dict, Any, Optional, List, Callable, Awaitable
import asyncio
import logging
from datetime import datetime
from uuid import uuid4
from .state_graph import StateGraph, StateNode, StateEdge
from .nodes import NODE_TYPES
from ..models.state import WorkflowState, BrowserState
from ..models.messages import (
    WebSocketMessage,
    MessageType,
    AgentThought,
    create_system_event
)

logger = logging.getLogger(__name__)

class WorkflowManager:
    def __init__(self):
        self.active_workflows: Dict[str, StateGraph] = {}
        self.workflow_states: Dict[str, WorkflowState] = {}

    async def create_workflow(self,
                            session_id: str,
                            goal: str,
                            websocket_callback: Callable[[WebSocketMessage], Awaitable[None]]) -> str:
        """Create a new workflow instance"""
        workflow_id = str(uuid4())
        
        # Initialize workflow state
        workflow_state = WorkflowState(
            session_id=session_id,
            browser_state=BrowserState(url="about:blank"),
            current_step=None,
            completed_steps=[],
            requires_input=False
        )
        
        # Create state graph with standard node types
        graph = StateGraph()
        
        # Add nodes for each stage
        nodes = [
            StateNode(
                id="planning_node",
                name="Planning Actions",
                type="planning",
                handler=NODE_TYPES["planning"]["handler"],
                requires_input=False
            ),
            StateNode(
                id="browser_action_node",
                name="Executing Browser Actions",
                type="browser_action",
                handler=NODE_TYPES["browser_action"]["handler"],
                requires_input=False
            ),
            StateNode(
                id="validation_node",
                name="Validating Actions",
                type="validation",
                handler=NODE_TYPES["validation"]["handler"],
                requires_input=False
            ),
            StateNode(
                id="user_input_node",
                name="Requesting User Input",
                type="user_input",
                handler=NODE_TYPES["user_input"]["handler"],
                requires_input=True
            )
        ]
        
        for node in nodes:
            graph.add_node(node)
        
        # Add edges to create the workflow
        edges = [
            StateEdge(source="planning_node", target="browser_action_node"),
            StateEdge(source="browser_action_node", target="validation_node"),
            StateEdge(
                source="validation_node",
                target="planning_node",
                condition=lambda state: state.get("needs_retry", False)
            ),
            StateEdge(
                source="validation_node",
                target="user_input_node",
                condition=lambda state: state.get("needs_user_input", False)
            ),
            StateEdge(source="user_input_node", target="planning_node")
        ]
        
        for edge in edges:
            graph.add_edge(edge)
        
        # Store workflow
        self.active_workflows[workflow_id] = graph
        self.workflow_states[workflow_id] = workflow_state
        
        # Initialize workflow with goal
        initial_state = {
            "goal": goal,
            "start_time": datetime.utcnow().isoformat(),
            "browser_state": workflow_state.browser_state.dict()
        }
        
        # Notify about workflow creation
        await websocket_callback(create_system_event(
            "workflow_created",
            {
                "workflow_id": workflow_id,
                "goal": goal,
                "initial_state": initial_state
            }
        ))
        
        return workflow_id

    async def execute_workflow(self,
                             workflow_id: str,
                             websocket_callback: Callable[[WebSocketMessage], Awaitable[None]]) -> Dict[str, Any]:
        """Execute a workflow"""
        if workflow_id not in self.active_workflows:
            raise ValueError(f"Workflow {workflow_id} not found")
        
        graph = self.active_workflows[workflow_id]
        workflow_state = self.workflow_states[workflow_id]
        
        # Start execution from planning node
        result = await graph.execute_workflow(
            initial_node_id="planning_node",
            initial_state={"goal": workflow_state.browser_state.dict()},
            workflow_state=workflow_state,
            websocket_callback=websocket_callback
        )
        
        return result

    async def handle_user_input(self,
                              workflow_id: str,
                              input_data: Dict[str, Any],
                              websocket_callback: Callable[[WebSocketMessage], Awaitable[None]]) -> None:
        """Handle user input for a workflow"""
        if workflow_id not in self.active_workflows:
            raise ValueError(f"Workflow {workflow_id} not found")
        
        workflow_state = self.workflow_states[workflow_id]
        
        # Clear input request state
        workflow_state.requires_input = False
        workflow_state.input_prompt = None
        
        # Update state with user input
        graph = self.active_workflows[workflow_id]
        graph.current_state.update({
            "user_input": input_data,
            "input_received": True,
            "input_timestamp": datetime.utcnow().isoformat()
        })
        
        # Resume execution from planning node
        await self.execute_workflow(workflow_id, websocket_callback)

    async def cleanup_workflow(self, workflow_id: str) -> None:
        """Clean up workflow resources"""
        if workflow_id in self.active_workflows:
            del self.active_workflows[workflow_id]
        if workflow_id in self.workflow_states:
            del self.workflow_states[workflow_id]

# Global workflow manager instance
workflow_manager = WorkflowManager()
