import json
import logging
from typing import Any, Dict, Optional

import httpx

from ..core.config import get_settings
from .gemini_service import gemini_service

settings = get_settings()
logger = logging.getLogger(__name__)


class KimiService:
    """OpenAI-compatible Kimi/Moonshot client with safe fallback behavior."""

    def __init__(self) -> None:
        self.api_key = settings.KIMI_API_KEY
        self.base_url = settings.KIMI_BASE_URL.rstrip("/")
        self.model = settings.KIMI_MODEL

    async def generate_content(
        self,
        prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 2048,
        service_name: Optional[str] = None,
        allow_fallback: bool = True,
    ) -> str:
        if not self.api_key:
            if allow_fallback:
                return gemini_service._get_fallback_response(prompt)
            raise RuntimeError(f"Kimi API key is not configured for {service_name or 'general'}")

        payload = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": temperature,
            "max_tokens": max_tokens,
        }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(self.base_url, headers=headers, json=payload)
        except Exception as exc:
            logger.warning("Kimi API error for %s: %s", service_name or "general", exc)
            if allow_fallback:
                return gemini_service._get_fallback_response(prompt)
            raise RuntimeError(f"Kimi API request failed for {service_name or 'general'}") from exc

        if response.status_code != 200:
            logger.warning(
                "Kimi API returned %s for %s: %s",
                response.status_code,
                service_name or "general",
                response.text[:500],
            )
            if allow_fallback:
                return gemini_service._get_fallback_response(prompt)
            raise RuntimeError(f"Kimi API returned HTTP {response.status_code} for {service_name or 'general'}")

        try:
            data = response.json()
        except ValueError as exc:
            if allow_fallback:
                return gemini_service._get_fallback_response(prompt)
            raise RuntimeError(f"Kimi API returned invalid JSON for {service_name or 'general'}") from exc

        content = self._extract_content(data)
        if content:
            return content

        if allow_fallback:
            return gemini_service._get_fallback_response(prompt)
        raise RuntimeError(f"Kimi API returned no usable content for {service_name or 'general'}")

    async def generate_structured(
        self,
        prompt: str,
        output_schema: Dict[str, Any],
        temperature: float = 0.3,
        service_name: Optional[str] = None,
        allow_fallback: bool = True,
    ) -> Dict[str, Any]:
        structured_prompt = f"""
{prompt}

You must respond with a valid JSON object following this exact schema:
{json.dumps(output_schema, indent=2)}

Respond ONLY with the JSON object, no additional text.
"""

        response_text = await self.generate_content(
            structured_prompt,
            temperature=temperature,
            service_name=service_name,
            allow_fallback=allow_fallback,
        )

        try:
            json_start = response_text.find("{")
            json_end = response_text.rfind("}") + 1
            if json_start >= 0 and json_end > json_start:
                return json.loads(response_text[json_start:json_end])
            return json.loads(response_text)
        except json.JSONDecodeError:
            if allow_fallback:
                return output_schema
            raise ValueError(f"Kimi returned non-JSON output for {service_name or 'general'}")

    @staticmethod
    def _extract_content(data: Dict[str, Any]) -> str:
        choices = data.get("choices") or []
        if choices:
            message = choices[0].get("message") or {}
            content = message.get("content")
            if isinstance(content, str):
                return content.strip()

        if isinstance(data.get("output_text"), str):
            return data["output_text"].strip()

        if isinstance(data.get("content"), str):
            return data["content"].strip()

        return ""


kimi_service = KimiService()
