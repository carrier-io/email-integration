#!/usr/bin/python3
# coding=utf-8

#   Copyright 2022 getcarrier.io
#
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.

""" Slot """
import json
from pylon.core.tools import log  # pylint: disable=E0611,E0401
from pylon.core.tools import web  # pylint: disable=E0611,E0401
from tools import task_tools, data_tools, constants
from time import sleep


class Event:  # pylint: disable=E1101,R0903
    """
        Event Resource
    """
    integration_name = "reporter_email"

    @web.event(f"{integration_name}_created_or_updated")
    def _created_or_updated(self, context, event, payload):
        try:
            integration_data = payload
            project = self.context.rpc_manager.call.project_get_or_404(project_id=integration_data["project_id"])
            log.info('reporter email %s', integration_data['settings'])
            integration_data['settings'].pop('email_notification_args', None)
            integration_data['settings']['galloper_url'] = '{{secret.galloper_url}}'
            integration_data['settings']['token'] = '{{secret.auth_token}}'
            integration_data['settings']['project_id'] = integration_data["project_id"]
            integration_id = integration_data['id']
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
                    self.context.rpc_manager.call\
                            .integrations_set_task_id(integration_id, email_task.task_id)

                    context.sio.emit("task_creation", {"ok":True, "name": payload['name'], 'id':integration_id, "img_src": "/reporter_email/static/logo_white.png"})
                except Exception as e:
                    log.error('Couldn\'t create task. %s', e)
                    context.sio.emit("task_creation", {"ok":False, "msg": f'Couldn\'t create task for {Event.integration_name} with {payload["id"]}. {e}'})
        except Exception as e:
            log.error('Error occurred in task creation event. %s', e)
            context.sio.emit("task_creation", {"ok":False, "msg": f'Couldn\'t create task for {Event.integration_name} with {payload["id"]}. {e}'})