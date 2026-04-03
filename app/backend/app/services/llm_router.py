from typing import Any, Dict, List, Optional, Tuple

from .gemini_service import gemini_service
from .kimi_service import kimi_service


# Clear service-to-provider distribution with automatic fallback to the other provider.
SERVICE_PROVIDER_MAP: Dict[str, Tuple[str, str]] = {
    "materials": ("gemini", "kimi"),
    "flashcards": ("gemini", "kimi"),
    "tests": ("gemini", "kimi"),
    "review": ("gemini", "kimi"),
    "interview": ("gemini", "kimi"),
}

DEFAULT_PROVIDER_ORDER: Tuple[str, str] = ("gemini", "kimi")


class LLMRouter:
    """Route education requests to Gemini or Kimi with safe failover."""

    def get_provider_order(self, service_name: Optional[str] = None) -> List[str]:
        key = (service_name or "").strip().lower()
        if key in SERVICE_PROVIDER_MAP:
            return list(SERVICE_PROVIDER_MAP[key])
        return list(DEFAULT_PROVIDER_ORDER)

    def _provider_available(self, provider: str) -> bool:
        if provider == "gemini":
            return gemini_service.has_credentials()
        if provider == "kimi":
            return bool(kimi_service.api_key)
        return False

    async def generate_content(
        self,
        prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 2048,
        service_name: Optional[str] = None,
    ) -> str:
        for provider in self.get_provider_order(service_name):
            if not self._provider_available(provider):
                continue
            try:
                if provider == "gemini":
                    return await gemini_service.generate_content(
                        prompt,
                        temperature=temperature,
                        max_tokens=max_tokens,
                        service_name=service_name,
                        allow_fallback=False,
                    )
                if provider == "kimi":
                    return await kimi_service.generate_content(
                        prompt,
                        temperature=temperature,
                        max_tokens=max_tokens,
                        service_name=service_name,
                        allow_fallback=False,
                    )
            except Exception:
                continue

        return gemini_service._get_fallback_response(prompt)

    async def generate_structured(
        self,
        prompt: str,
        output_schema: Dict[str, Any],
        temperature: float = 0.3,
        max_tokens: int = 2048,
        service_name: Optional[str] = None,
    ) -> Dict[str, Any]:
        for provider in self.get_provider_order(service_name):
            if not self._provider_available(provider):
                continue
            try:
                if provider == "gemini":
                    return await gemini_service.generate_structured(
                        prompt,
                        output_schema,
                        temperature=temperature,
                        max_tokens=max_tokens,
                        service_name=service_name,
                        allow_fallback=False,
                    )
                if provider == "kimi":
                    return await kimi_service.generate_structured(
                        prompt,
                        output_schema,
                        temperature=temperature,
                        service_name=service_name,
                        allow_fallback=False,
                    )
            except Exception:
                continue

        return await gemini_service.generate_structured(
            prompt,
            output_schema,
            temperature=temperature,
            max_tokens=max_tokens,
            service_name=service_name,
            allow_fallback=True,
        )


llm_router = LLMRouter()
