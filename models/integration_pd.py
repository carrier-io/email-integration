import binascii
import smtplib
from typing import Optional, List

from pydantic import BaseModel, EmailStr
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
            with smtplib.SMTP_SSL(host=self.host, port=self.port) as server:
                server.ehlo()
                server.login(self.user, self.passwd)
            # smtp = SMTP(self.host, self.port, timeout=10)
            # smtp.ehlo()
            # smtp.login(self.user, self.passwd)
            # smtp.quit()
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


class SecurityTestModel(BaseModel):
    id: int
    recipients: List[EmailStr]


class PerformanceBackendTestModel(SecurityTestModel):
    error_rate: int = 10
    performance_degradation_rate: int = 20
    missed_thresholds: int = 50


class PerformanceUiTestModel(SecurityTestModel):
    ...
