from pydantic import BaseModel

class SecurityReport(BaseModel):
    scanId: str
    static_issues: list
    dependency_flags: list
    secrets_detected: list
    owasp_flags: list
