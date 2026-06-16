from pydantic import BaseModel

class CodeStructure(BaseModel):
    routes: list
    functions: list
    models: list
    raw_file_map: dict
