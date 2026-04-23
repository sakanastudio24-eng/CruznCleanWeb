from pydantic import BaseModel, EmailStr


class ContactMessageRequest(BaseModel):
    fullName: str
    email: EmailStr
    phone: str
    message: str
