import logging
from typing import Protocol

logger=logging.getLogger("v4yt.email")

class EmailProvider(Protocol):
    async def send_password_reset(self, email: str, token: str) -> None: ...

class ConsoleEmailProvider:
    """Safe local fallback. It reports the delivery attempt without logging the reset token."""
    async def send_password_reset(self, email: str, token: str) -> None:
        logger.info("Password reset email is ready for delivery to %s; configure an email provider to deliver the link.", email)

def get_email_provider() -> EmailProvider:
    # Replace this selection with SMTP/transactional provider configuration in deployment.
    return ConsoleEmailProvider()
