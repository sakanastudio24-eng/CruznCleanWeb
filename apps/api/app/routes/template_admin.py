from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.models.template_admin import (
    TemplateCreateRequest,
    TemplateListResponse,
    TemplateOperationResponse,
    TemplateUpdateRequest,
)
from app.services.admin_auth import require_template_admin_auth
from app.services.template_admin import (
    TemplateAdminError,
    create_template,
    delete_template,
    duplicate_template,
    get_template,
    list_templates,
    publish_template,
    update_template,
)

router = APIRouter(
    prefix="/template-admin",
    tags=["template-admin"],
    dependencies=[Depends(require_template_admin_auth)],
)

def _provider_error_to_http_error(error: TemplateAdminError) -> HTTPException:
    """Converts service-layer provider failures to stable HTTP responses."""
    return HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail=str(error),
    )

def _build_operation_response(operation: str, data: dict[str, Any]) -> TemplateOperationResponse:
    """Builds a stable response envelope for non-list template operations."""
    return TemplateOperationResponse(status="ok", operation=operation, data=data)


@router.post("/templates", response_model=TemplateOperationResponse)
def create_template_route(payload: TemplateCreateRequest) -> TemplateOperationResponse:
    """Creates a provider-managed email template using Resend."""
    try:
        data = create_template(
            name=payload.name.strip(),
            html=payload.html,
            variables=[item.model_dump() for item in payload.variables],
        )
    except TemplateAdminError as exc:
        raise _provider_error_to_http_error(exc) from exc

    return _build_operation_response("create", data)


@router.get("/templates/{template_id}", response_model=TemplateOperationResponse)
def get_template_route(template_id: str) -> TemplateOperationResponse:
    """Returns one template by provider identifier."""
    try:
        data = get_template(template_id.strip())
    except TemplateAdminError as exc:
        raise _provider_error_to_http_error(exc) from exc

    return _build_operation_response("get", data)


@router.patch("/templates/{template_id}", response_model=TemplateOperationResponse)
def update_template_route(template_id: str, payload: TemplateUpdateRequest) -> TemplateOperationResponse:
    """Updates one template's mutable fields by identifier."""
    try:
        data = update_template(
            template_id=template_id.strip(),
            name=payload.name.strip() if payload.name is not None else None,
            html=payload.html,
        )
    except TemplateAdminError as exc:
        raise _provider_error_to_http_error(exc) from exc

    return _build_operation_response("update", data)


@router.post("/templates/{template_id}/publish", response_model=TemplateOperationResponse)
def publish_template_route(template_id: str) -> TemplateOperationResponse:
    """Publishes one template revision by identifier."""
    try:
        data = publish_template(template_id.strip())
    except TemplateAdminError as exc:
        raise _provider_error_to_http_error(exc) from exc

    return _build_operation_response("publish", data)


@router.post("/templates/{template_id}/duplicate", response_model=TemplateOperationResponse)
def duplicate_template_route(template_id: str) -> TemplateOperationResponse:
    """Duplicates an existing template by identifier."""
    try:
        data = duplicate_template(template_id.strip())
    except TemplateAdminError as exc:
        raise _provider_error_to_http_error(exc) from exc

    return _build_operation_response("duplicate", data)


@router.delete("/templates/{template_id}", response_model=TemplateOperationResponse)
def delete_template_route(template_id: str) -> TemplateOperationResponse:
    """Deletes one template by identifier."""
    try:
        data = delete_template(template_id.strip())
    except TemplateAdminError as exc:
        raise _provider_error_to_http_error(exc) from exc

    return _build_operation_response("delete", data)


@router.get("/templates", response_model=TemplateListResponse)
def list_templates_route(
    limit: int | None = Query(default=None, ge=1, le=100),
    after: str | None = Query(default=None, min_length=1),
) -> TemplateListResponse:
    """Lists templates with optional pagination arguments."""
    try:
        data = list_templates(limit=limit, after=after.strip() if after else None)
    except TemplateAdminError as exc:
        raise _provider_error_to_http_error(exc) from exc

    templates = data.get("data") if isinstance(data.get("data"), list) else []
    pagination = {
        "after": data.get("after"),
        "next": data.get("next"),
        "has_more": data.get("has_more"),
        "object": data.get("object"),
    }

    return TemplateListResponse(
        status="ok",
        operation="list",
        templates=templates,
        pagination=pagination,
    )
