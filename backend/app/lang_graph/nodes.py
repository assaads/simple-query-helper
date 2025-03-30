from typing import Dict, Any, List, Optional
import asyncio
from datetime import datetime
from ..models.state import WorkflowState, Step
from ..browser.actions import browser_manager
from ..models.messages import (
    BrowserActionRequest,
    BrowserActionType,
    AgentThought,
    UserInputRequest
)
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain.chains import LLMChain
from langchain_openai import ChatOpenAI
import json

async def planning_node_handler(state: Dict[str, Any], workflow_state: WorkflowState) -> Dict[str, Any]:
    """Plan next actions based on current state and goals"""
    planning_prompt = PromptTemplate(
        input_variables=["current_state", "goal", "browser_state"],
        template="""Given the current state and goal, plan the next browser automation steps.
        
Current State:
{current_state}

Goal:
{goal}

Browser State:
{browser_state}

Plan the next steps as a JSON array of actions. Each action should have:
- action_type: The type of browser action (navigate, click, type, etc.)
- params: Parameters for the action
- reasoning: Why this action is needed

Response Format:
{
    "actions": [
        {
            "action_type": "action_name",
            "params": {"param1": "value1"},
            "reasoning": "explanation"
        }
    ],
    "thought_process": "overall reasoning"
}"""
    )

    # Create planning chain
    llm = ChatOpenAI(temperature=0)
    planning_chain = LLMChain(llm=llm, prompt=planning_prompt)

    # Execute planning
    result = await planning_chain.arun(
        current_state=json.dumps(state, indent=2),
        goal=state.get("goal", "Complete the task"),
        browser_state=json.dumps(state.get("browser_state", {}), indent=2)
    )

    # Parse and validate the response
    try:
        plan = json.loads(result)
        return {
            "planned_actions": plan["actions"],
            "thought_process": plan["thought_process"]
        }
    except Exception as e:
        raise ValueError(f"Invalid planning result format: {str(e)}")

async def browser_action_node_handler(state: Dict[str, Any], workflow_state: WorkflowState) -> Dict[str, Any]:
    """Execute planned browser actions"""
    planned_actions = state.get("planned_actions", [])
    results = []
    
    for action in planned_actions:
        request = BrowserActionRequest(
            action=BrowserActionType[action["action_type"].upper()],
            params=action["params"],
            timeout=30
        )
        
        # Execute action through browser manager
        response = await browser_manager.handle_action(
            message=request.dict(),
            session_id=workflow_state.session_id
        )
        
        results.append({
            "action": action,
            "success": response.get("success", False),
            "result": response.get("result", {}),
            "error": response.get("error")
        })

    # Update state with results
    return {
        "action_results": results,
        "last_action_timestamp": datetime.utcnow().isoformat()
    }

async def user_input_node_handler(state: Dict[str, Any], workflow_state: WorkflowState) -> Dict[str, Any]:
    """Handle user input requests"""
    input_request = UserInputRequest(
        prompt=state.get("input_prompt", "Please provide input"),
        input_type=state.get("input_type", "text"),
        options=state.get("input_options"),
        metadata=state.get("input_metadata", {})
    )
    
    # Update workflow state to require input
    workflow_state.requires_input = True
    workflow_state.input_prompt = input_request.prompt
    
    # Return current state and wait for input
    return state

async def validation_node_handler(state: Dict[str, Any], workflow_state: WorkflowState) -> Dict[str, Any]:
    """Validate results and determine next steps"""
    action_results = state.get("action_results", [])
    all_successful = all(result.get("success", False) for result in action_results)
    
    if not all_successful:
        # Analyze failures and plan recovery
        failed_actions = [
            result for result in action_results 
            if not result.get("success", False)
        ]
        
        return {
            "validation_success": False,
            "failed_actions": failed_actions,
            "needs_retry": True,
            "retry_strategy": "simple_retry"  # Can be enhanced with more sophisticated strategies
        }
    
    return {
        "validation_success": True,
        "needs_retry": False
    }

# Node type definitions for the workflow
NODE_TYPES = {
    "planning": {
        "handler": planning_node_handler,
        "requires_input": False
    },
    "browser_action": {
        "handler": browser_action_node_handler,
        "requires_input": False
    },
    "user_input": {
        "handler": user_input_node_handler,
        "requires_input": True
    },
    "validation": {
        "handler": validation_node_handler,
        "requires_input": False
    }
}
