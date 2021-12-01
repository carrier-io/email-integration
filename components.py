import base64

from flask import render_template

from plugins.reporter_email.models.integration_pd import IntegrationModel


def render_integration_create_modal(context, slot, payload):
    payload['default_template'] = base64.b64decode(IntegrationModel._default_template).decode('utf-8')
    return render_template(
        'email_integration.html',
        config=payload
    )


def render_integration_card(context, slot, payload):
    return render_template(
        'email_integration_card.html',
        config=payload
    )


def render_reporter_toggle(context, slot, payload):
    integrations = context.rpc_manager.call.integrations_get_project_integrations_by_name(
        payload['id'],
        'reporter_email'
    )
    payload['project_integrations'] = integrations
    return render_template(
        'email_reporter_toggle.html',
        config=payload
    )
