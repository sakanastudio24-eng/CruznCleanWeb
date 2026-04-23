from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field, model_validator


class TemplateVariablePayload(BaseModel):
    key: str = Field(min_length=1)
    type: Literal["string", "number", "boolean"]
    fallback_value: str | int | float | bool


class TemplateCreateRequest(BaseModel):
    name: str = Field(min_length=1)
    html: str = Field(min_length=1)
    variables: list[TemplateVariablePayload] = Field(min_length=1)


class TemplateUpdateRequest(BaseModel):
    name: str | None = None
    html: str | None = None

    @model_validator(mode="after")
    def validate_update_payload(self) -> "TemplateUpdateRequest":
        """Ensures at least one mutable field is provided for updates."""
        has_name = self.name is not None and self.name.strip() != ""
        has_html = self.html is not None and self.html.strip() != ""

        if not (has_name or has_html):
            raise ValueError("At least one of name or html is required.")

        return self


class TemplateOperationResponse(BaseModel):
    status: Literal["ok"]
    operation: str
    data: dict[str, Any]


class TemplateListResponse(BaseModel):
    status: Literal["ok"]
    operation: Literal["list"]
    templates: list[dict[str, Any]]
    pagination: dict[str, Any]
