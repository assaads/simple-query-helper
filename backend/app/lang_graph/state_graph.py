from typing import Dict, Any, Optional, List, Callable, Awaitable
import asyncio
from datetime import datetime
from pydantic import BaseModel
import logging
from ..models.state import WorkflowState, Step, StepStatus
from ..models.messages import AgentThought, WebSocketMessage, MessageType

logger = logging.getLogger(__name__)

class StateNode(BaseModel):
    id: str
    name: str
    type: str
    handler: Optional[Callable[[Dict[str, Any], WorkflowState], Awaitable[Dict[str, Any]]]] = None
    requires_input: bool = False
    input_prompt: Optional[str] = None
    completion_criteria: Optional[Callable[[Dict[str, Any]], bool]] = None
    error_handler: Optional[Callable[[Exception, Dict[str, Any]], Awaitable[Dict[str, Any]]]] = None

class StateEdge(BaseModel):
    source: str
    target: str
    condition: Optional[Callable[[Dict[str, Any]], bool]] = None

class StateGraph:
    def __init__(self):
        self.nodes: Dict[str, StateNode] = {}
        self.edges: List[StateEdge] = []
        self.current_state: Dict[str, Any] = {}
        self.workflow_state: Optional[WorkflowState] = None

    def add_node(self, node: StateNode):
        """Add a node to the graph"""
        self.nodes[node.id] = node

    def add_edge(self, edge: StateEdge):
        """Add an edge to the graph"""
        self.edges.append(edge)

    def get_next_nodes(self, current_node_id: str) -> List[StateNode]:
        """Get available next nodes based on current state"""
        next_nodes = []
        for edge in self.edges:
            if edge.source == current_node_id:
                if edge.condition is None or edge.condition(self.current_state):
                    next_nodes.append(self.nodes[edge.target])
        return next_nodes

    async def execute_node(self, node: StateNode, websocket_callback: Optional[Callable] = None) -> bool:
        """Execute a node's handler and update state"""
        try:
            logger.info(f"Executing node: {node.name}")
            
            # Create step for tracking
            step = Step(
                id=f"{node.id}_{datetime.utcnow().timestamp()}",
                content=node.name,
                status=StepStatus.PROCESSING
            )
            
            if self.workflow_state:
                self.workflow_state.current_step = step
            
            # Send thought process if callback provided
            if websocket_callback:
                thought = AgentThought(
                    thought=f"Executing step: {node.name}",
                    plan=[n.name for n in self.get_next_nodes(node.id)]
                )
                await websocket_callback(WebSocketMessage(
                    type=MessageType.AGENT_THOUGHT,
                    session_id=self.workflow_state.session_id if self.workflow_state else "system",
                    payload=thought.dict()
                ))

            # Execute handler if present
            if node.handler:
                result = await node.handler(self.current_state, self.workflow_state)
                self.current_state.update(result)

            # Update step status
            step.status = StepStatus.COMPLETED
            if self.workflow_state:
                self.workflow_state.completed_steps.append(step)
                self.workflow_state.current_step = None

            return True

        except Exception as e:
            logger.error(f"Error executing node {node.name}: {str(e)}")
            
            if node.error_handler:
                try:
                    error_result = await node.error_handler(e, self.current_state)
                    self.current_state.update(error_result)
                except Exception as error_e:
                    logger.error(f"Error handler failed for node {node.name}: {str(error_e)}")
            
            # Update step status to error
            if step:
                step.status = StepStatus.ERROR
                if self.workflow_state:
                    self.workflow_state.completed_steps.append(step)
                    self.workflow_state.current_step = None
            
            return False

    async def execute_workflow(self, 
                             initial_node_id: str, 
                             initial_state: Dict[str, Any],
                             workflow_state: WorkflowState,
                             websocket_callback: Optional[Callable] = None) -> Dict[str, Any]:
        """Execute the workflow starting from a specific node"""
        self.current_state = initial_state
        self.workflow_state = workflow_state
        current_node_id = initial_node_id

        while current_node_id and current_node_id in self.nodes:
            current_node = self.nodes[current_node_id]
            
            # Check if node requires user input
            if current_node.requires_input:
                if websocket_callback:
                    # Update workflow state to indicate input needed
                    self.workflow_state.requires_input = True
                    self.workflow_state.input_prompt = current_node.input_prompt
                    
                    # Wait for input through websocket
                    return self.current_state

            # Execute current node
            success = await self.execute_node(current_node, websocket_callback)
            if not success:
                break

            # Find next node
            next_nodes = self.get_next_nodes(current_node_id)
            current_node_id = next_nodes[0].id if next_nodes else None

        return self.current_state
