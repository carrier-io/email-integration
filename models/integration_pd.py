import binascii
from smtplib import SMTP
from typing import Optional

from pydantic import BaseModel
from pydantic.class_validators import validator
from pydantic.fields import ModelField
from pylon.core.tools import log

import base64


class IntegrationModel(BaseModel):

    _default_template = 'PGRpdj5EZWZhdWx0IHRlbXBsYXRlPC9kaXY+'

    host: str
    port: int
    user: str
    passwd: str
    sender: Optional[str]
    template: Optional[str] = _default_template

    def check_connection(self) -> bool:
        try:
            smtp = SMTP(self.host, self.port)
            smtp.login(self.user, self.passwd)
            smtp.quit()
            return True
        except Exception as e:
            log.exception(e)
            return False

    @validator('template')
    def validate_base64(cls, value: str, field: ModelField):
        if value:
            try:
                base64.b64decode(value, validate=True)
            except binascii.Error:
                log.error('Email template must be base64-encoded')
                raise
            return value
        else:
            return field.default
