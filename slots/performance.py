from pylon.core.tools import log, web
from tools import auth, theme


class Slot:
    integration_name = 'reporter_email'
    section_name = 'reporters'

    @web.slot(f'backend_performance_{section_name}_content')
    # @auth.decorators.check_slot(["configuration.integrations.integrations.reporter_email"])
    def backend_toggle_content(self, context, slot, payload):
        if payload is None:
            payload = {}
        project_id = self.context.rpc_manager.call.project_get_id()
        integrations = context.rpc_manager.call.integrations_get_all_integrations_by_name(
            project_id,
            Slot.integration_name
        )
        with context.app.app_context():
            return self.descriptor.render_template(
                'test_toggle/content.html',
                project_integrations=integrations,
                instance_name_prefix=payload.get('instance_name_prefix', '')
            )

    @web.slot(f'backend_performance_{section_name}_scripts')
    def backend_toggle_scripts(self, context, slot, payload):
        with context.app.app_context():
            return self.descriptor.render_template(
                'test_toggle/scripts_performance.html',
            )

    @web.slot(f'ui_performance_{section_name}_content')
    def ui_toggle_content(self, context, slot, payload):
        if payload is None:
            payload = {}
        project_id = self.context.rpc_manager.call.project_get_id()
        integrations = context.rpc_manager.call.integrations_get_all_integrations_by_name(
            project_id,
            Slot.integration_name
        )
        with context.app.app_context():
            return self.descriptor.render_template(
                'test_toggle/content.html',
                project_integrations=integrations,
                instance_name_prefix=payload.get('instance_name_prefix', '')
            )

    @web.slot(f'ui_performance_{section_name}_scripts')
    def ui_toggle_scripts(self, context, slot, payload):
        with context.app.app_context():
            return self.descriptor.render_template(
                'test_toggle/scripts.html',
            )
