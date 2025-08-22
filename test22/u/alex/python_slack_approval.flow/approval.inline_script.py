from typing import Optional
import wmill

def main(
    slack_resource: str,
    channel_id: str,
    message: Optional[str],
    approver: Optional[str],
    default_args: Optional[dict],
    dynamic_enums: Optional[dict],
):
    """
    Sends an interactive approval request via Slack, allowing optional customization of the message, approver, and form fields.
    
    **[Enterprise Edition Only]** To include form fields in the Slack approval request, use the "Advanced -> Suspend -> Form" functionality.
    Learn more at: https://www.windmill.dev/docs/flows/flow_approval#form

    slack_resource_path (str): The path to the Slack resource in Windmill.
    channel_id (str): The Slack channel ID where the approval request will be sent.
    message (str): Optional custom message to include in the Slack approval request.
    approver (str): Optional user ID or name of the approver for the request.
    default_args_json (dict): Optional dictionary defining or overriding the default arguments for form fields.
    dynamic_enums_json (dict): Optional dictionary overriding the enum default values of enum form fields.

    **Input Example:** 
        slack_resource_path="/u/alex/my_slack_resource",
        channel_id="admins-slack-channel",
        message="Please approve this request",
        approver="approver123",
        default_args_json={"key1": "value1", "key2": 42},
        dynamic_enums_json={"foo": ["choice1", "choice2"], "bar": ["optionA", "optionB"]},
    """    
    wmill.request_interactive_slack_approval(
        slack_resource, 
        channel_id, 
        message, 
        approver, 
        default_args,
        dynamic_enums, 
    )

    return_object = {}

    if dynamic_enums:
        return_object["enums"] = dynamic_enums
    if default_args:
        return_object["default_args"] = default_args

    return return_object