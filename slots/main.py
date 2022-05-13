from pylon.core.tools import log, web
from flask import g
import base64


from ..models.integration_pd import IntegrationModel


class Slot:
    integration_name = 'reporter_email'
    section_name = 'reporters'

    @web.slot(f'integrations_{section_name}_content')
    def integration_create_modal_content(self, context, slot, payload):
        default_template = base64.b64decode(IntegrationModel._default_template).decode('utf-8')
        with context.app.app_context():
            return self.descriptor.render_template(
                'integration/content.html',
                default_template=default_template
            )

    @web.slot(f'integrations_{section_name}_styles')
    def integration_create_modal_styles(self, context, slot, payload):
        with context.app.app_context():
            return self.descriptor.render_template(
                'integration/styles.html',
            )

    @web.slot(f'integrations_{section_name}_scripts')
    def integration_create_modal_scripts(self, context, slot, payload):
        with context.app.app_context():
            return self.descriptor.render_template(
                'integration/scripts.html',
            )

    @web.slot(f'integration_card_{integration_name}')
    def integration_card(self, context, slot, payload):
        """
        :param payload: Holds pydantic model of the integration
        """
        with context.app.app_context():
            return self.descriptor.render_template(
                'integration/card.html',
                integration_data=payload
            )

    @web.slot(f'security_{section_name}')
    def toggle(self, context, slot, payload):
        integrations = context.rpc_manager.call.integrations_get_project_integrations_by_name(
            g.project.id,
            self.integration_name
        )
        project_integrations = integrations
        with context.app.app_context():
            return self.descriptor.render_template(
                'test_toggle.html',
                project_integrations=project_integrations
            )
