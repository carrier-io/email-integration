from pylon.core.tools import log  # pylint: disable=E0611,E0401
from pydantic import parse_obj_as, ValidationError
from pylon.core.tools import web

from ..models.integration_pd import SecurityTestModel, PerformanceBackendTestModel

from tools import rpc_tools


class RPC:
    integration_name = 'reporter_email'

    @web.rpc(f'dusty_config_{integration_name}')
    @rpc_tools.wrap_exceptions(RuntimeError)
    def make_dusty_config(self, context, test_params, scanner_params):
        """ Prepare dusty config for this scanner """
        log.info("Test params: %s", test_params)
        log.info("Scanner params: %s", scanner_params)

        integration = context.rpc_manager.call.integrations_get_by_id(scanner_params['id'])
        result = integration.settings
        result['recipients'] = scanner_params['recipients']

        log.info("Result: %s", result)
        return "email", result

    @web.rpc(f'security_test_create_integration_validate_{integration_name}')
    @rpc_tools.wrap_exceptions(ValidationError)
    def security_test_create_integration_validate(self, data: dict, **kwargs) -> dict:
        pd_object = SecurityTestModel(**data)
        return pd_object.dict(**kwargs)

    @web.rpc(f'backend_performance_test_create_integration_validate_{integration_name}')
    @rpc_tools.wrap_exceptions(ValidationError)
    def backend_performance_test_create_integration_validate(self, data: dict, **kwargs) -> dict:
        pd_object = PerformanceBackendTestModel(**data)
        return pd_object.dict(**kwargs)

    @web.rpc(f'execution_json_config_{integration_name}')
    @rpc_tools.wrap_exceptions(RuntimeError)
    def make_execution_json_config(self, integration_id: int) -> dict:
        """ Prepare execution_json for this integration """
        integration = self.context.rpc_manager.call.integrations_get_by_id(integration_id)
        return {'integration_settings': integration.settings, 'task_id': integration.task_id}
