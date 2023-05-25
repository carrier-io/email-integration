from pylon.core.tools import log, web
from tools import TaskManager, data_tools, constants

from ..models.integration_pd import TaskSettingsModel


class Event:
    integration_name = "reporter_email"

    @staticmethod
    def _prepare_task(integration_data: dict) -> dict:
        env_vars = TaskSettingsModel.parse_obj({
            **integration_data['settings'],
            'project_id': integration_data["project_id"]
        })
        return {
            'funcname': f'email_integration_{integration_data["id"]}',
            'invoke_func': 'lambda_function.lambda_handler',
            'runtime': 'Python 3.7',
            'env_vars': env_vars.json(),
            'region': 'default'
        }

    @web.event(f"{integration_name}_created_or_updated")
    def _created_or_updated(self, context, event, payload):
        project = context.rpc_manager.call.project_get_or_404(project_id=payload["project_id"])
        log.info('reporter email %s', payload['settings'])
        if not payload['task_id']:
            context.rpc_manager.call.integrations_update_attrs(
                integration_id=payload['id'],
                project_id=payload["project_id"],
                update_dict={'status': 'pending'},
                return_result=False
            )
            try:
                email_task = TaskManager(project.id).create_task(
                    self.descriptor.config['task_path'],
                    Event._prepare_task(payload),
                )
                log.info('reporter task id %s', email_task.task_id)
                # updated_data = self.context.rpc_manager.call.integrations_set_task_id(
                #     integration_data['id'],
                #     email_task.task_id,
                #     'success'
                # )
                updated_data = context.rpc_manager.call.integrations_update_attrs(
                    integration_id=payload['id'],
                    project_id=payload["project_id"],
                    update_dict={'status': 'success', 'task_id': email_task.task_id},
                    return_result=True
                )
                # self.context.rpc_manager.call.integrations_update_attrs(payload['id'], {'status': 'pending'})

                context.sio.emit('task_creation', {
                    'ok': True,
                    **updated_data
                })
            except Exception as e:
                # updated_data = self.context.rpc_manager.call.integrations_set_task_id(payload['id'], None, 'error')
                updated_data = context.rpc_manager.call.integrations_update_attrs(
                    integration_id=payload['id'],
                    project_id=payload["project_id"],
                    update_dict={'status': str(e)},
                    return_result=True
                )
                log.error('Couldn\'t create task. %s', e)
                context.sio.emit("task_creation", {
                    'ok': False,
                    'msg': f'Couldn\'t create task for {updated_data["name"]} with id: {updated_data["id"]}. {e}',
                    **updated_data
                })
        else:  # task already created
            updated_env_vars = Event._prepare_task(payload)['env_vars']
            context.rpc_manager.call.tasks_update_env(
                task_id=payload['task_id'],
                env_vars=updated_env_vars,
                rewrite=True
            )
            context.sio.emit('task_creation', {
                'ok': True,
                'msg': 'Email task updated'
            })
