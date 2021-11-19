from smtplib import SMTP
from typing import Optional

from pydantic import BaseModel
from pydantic.class_validators import validator
from pydantic.fields import ModelField
from pylon.core.tools import log


class IntegrationModel(BaseModel):
    host: str
    port: int
    user: str
    passwd: str
    sender: Optional[str]
    template: Optional[str] = 'data:text/html;base64,PGRpdj5EZWZhdWx0IHRlbXBsYXRlPC9kaXY+'

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
            assert value.startswith('data:text/html;base64,'), 'value must start with "data:text/html;base64,"'
            return value
        else:
            return field.default
