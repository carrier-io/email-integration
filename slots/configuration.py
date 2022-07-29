from pylon.core.tools import log, web
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

    @web.slot(f'integrations_{section_name}_scripts')
    def integration_create_modal_scripts(self, context, slot, payload):
        with context.app.app_context():
            return self.descriptor.render_template(
                'integration/scripts.html',
            )

    # @web.slot(f'integrations_{section_name}_styles')
    # def integration_create_modal_styles(self, context, slot, payload):
    #     with context.app.app_context():
    #         return self.descriptor.render_template(
    #             'integration/styles.html',
    #         )

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
