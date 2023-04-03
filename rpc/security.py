from typing import Optional
from pylon.core.tools import log
from pylon.core.tools import web
from pydantic import parse_obj_as, ValidationError

from ..models.integration_pd import SecurityTestModel, PerformanceBackendTestModel

from tools import rpc_tools


class RPC:
    integration_name = 'reporter_email'

    @web.rpc(f'dusty_config_{integration_name}')
    @rpc_tools.wrap_exceptions(RuntimeError)
    def make_dusty_config(self, context, test_params, scanner_params) -> tuple:
        """ Prepare dusty config for this scanner """
        log.info("Test params: %s", test_params)
        log.info("Scanner params: %s", scanner_params)

        integration = self.context.rpc_manager.call.integrations_get_by_id(scanner_params['id'])
        result = integration.settings
        result['recipients'] = scanner_params['recipients']

        log.info("Result: %s", result)
        return "email", result

    @web.rpc(f'security_test_create_integration_validate_{integration_name}')
    @rpc_tools.wrap_exceptions(ValidationError)
    def security_test_create_integration_validate(self, data: dict, pd_kwargs: Optional[dict] = None, **kwargs) -> dict:
        if not pd_kwargs:
            pd_kwargs = {}
        pd_object = SecurityTestModel(**data)
        return pd_object.dict(**pd_kwargs)
