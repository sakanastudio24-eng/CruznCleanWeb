from __future__ import annotations

import os
from typing import Any

import resend


class TemplateAdminError(RuntimeError):
    """Represents a safe-to-return template-admin failure message."""

def _sanitize_error_message(error: Exception) -> str:
    """Normalizes provider failures into short, non-sensitive messages."""
    message = " ".join(str(error).split())
    if not message:
        return "Template provider request failed."

    return message[:280]

def _configure_resend() -> None:
    """Initializes the Resend SDK API key from environment configuration."""
    api_key = os.getenv("RESEND_API_KEY", "").strip()
    if not api_key:
        raise TemplateAdminError("Template provider is not configured.")

    resend.api_key = api_key

def _to_dict(value: Any) -> dict[str, Any]:
    """Converts SDK return payloads into serializable dictionaries."""
    if isinstance(value, dict):
        return value

    if hasattr(value, "to_dict") and callable(value.to_dict):
        converted = value.to_dict()
        if isinstance(converted, dict):
            return converted

    if hasattr(value, "data") and isinstance(value.data, dict):
        return value.data

    return {"result": str(value)}

def create_template(*, name: str, html: str, variables: list[dict[str, Any]]) -> dict[str, Any]:
    """Creates one provider-managed Resend template."""
    _configure_resend()
    try:
        response = resend.Templates.create(
            {
                "name": name,
                "html": html,
                "variables": variables,
            }
        )
        return _to_dict(response)
    except Exception as exc:
        raise TemplateAdminError(_sanitize_error_message(exc)) from exc

def get_template(template_id: str) -> dict[str, Any]:
    """Fetches one template by its provider identifier."""
    _configure_resend()
    try:
        response = resend.Templates.get(template_id)
        return _to_dict(response)
    except Exception as exc:
        raise TemplateAdminError(_sanitize_error_message(exc)) from exc

def update_template(*, template_id: str, name: str | None = None, html: str | None = None) -> dict[str, Any]:
    """Updates template name and/or HTML content by identifier."""
    _configure_resend()

    payload: dict[str, Any] = {"id": template_id}
    if name is not None:
        payload["name"] = name

    if html is not None:
        payload["html"] = html

    try:
        response = resend.Templates.update(payload)
        return _to_dict(response)
    except Exception as exc:
        raise TemplateAdminError(_sanitize_error_message(exc)) from exc

def publish_template(template_id: str) -> dict[str, Any]:
    """Publishes one template revision by identifier."""
    _configure_resend()
    try:
        response = resend.Templates.publish(template_id)
        return _to_dict(response)
    except Exception as exc:
        raise TemplateAdminError(_sanitize_error_message(exc)) from exc

def duplicate_template(template_id: str) -> dict[str, Any]:
    """Duplicates an existing template by identifier."""
    _configure_resend()
    try:
        response = resend.Templates.duplicate(template_id)
        return _to_dict(response)
    except Exception as exc:
        raise TemplateAdminError(_sanitize_error_message(exc)) from exc

def delete_template(template_id: str) -> dict[str, Any]:
    """Deletes one template by identifier."""
    _configure_resend()
    try:
        response = resend.Templates.remove(template_id)
        return _to_dict(response)
    except Exception as exc:
        raise TemplateAdminError(_sanitize_error_message(exc)) from exc

def list_templates(*, limit: int | None = None, after: str | None = None) -> dict[str, Any]:
    """Lists templates with optional pagination and page-size controls."""
    _configure_resend()

    payload: dict[str, Any] = {}
    if limit is not None:
        payload["limit"] = limit

    if after is not None:
        payload["after"] = after

    try:
        response = resend.Templates.list(payload)
        return _to_dict(response)
    except Exception as exc:
        raise TemplateAdminError(_sanitize_error_message(exc)) from exc
