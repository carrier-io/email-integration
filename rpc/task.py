import json
from typing import Optional

from pylon.core.tools import log
from pylon.core.tools import web


from tools import rpc_tools, task_tools, data_tools, constants


class RPC:
    integration_name = 'reporter_email'

    # todo: change rpc to event listener
    @web.rpc(f'{integration_name}_created_or_updated')
    @rpc_tools.wrap_exceptions(RuntimeError)
    def handle_create_task(self, integration_data: dict) -> Optional[str]:
        project = self.context.rpc_manager.call.project_get_or_404(project_id=integration_data["project_id"])
        log.info('reporter email %s', integration_data['settings'])
        integration_data['settings'].pop('email_notification_args', None)
        integration_data['settings']['galloper_url'] = '{{secret.galloper_url}}'
        integration_data['settings']['token'] = '{{secret.auth_token}}'

        if not integration_data['task_id']:
            email_notification_args = {
                'funcname': f'email_integration_{integration_data["id"]}',
                'invoke_func': 'lambda_function.lambda_handler',
                'runtime': 'Python 3.7',
                'env_vars': json.dumps(integration_data['settings']),
                'region': 'default'
            }

            try:
                email_task = task_tools.create_task(
                    project,
                    data_tools.files.File(constants.EMAIL_NOTIFICATION_PATH),
                    email_notification_args,
                )
                log.info('reporter task id %s', email_task.task_id)
                return email_task.task_id
            except Exception as e:
                log.error('Couldn\'t create task. %s', e)

        # todo: update task