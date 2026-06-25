"""
L AI Backend — Web Search Service

Provides real-time internet search capabilities using DuckDuckGo.
No API key required. Results are formatted as structured context
for injection into the LLM prompt.
"""

import logging
from typing import Optional

from duckduckgo_search import DDGS

logger = logging.getLogger(__name__)


class WebSearchService:
    """Executes web searches and formats results for LLM context injection."""

    def __init__(self):
        self.ddgs = DDGS()

    def search(self, query: str, max_results: int = 5) -> list[dict]:
        """
        Search DuckDuckGo for the given query.

        Args:
            query: The search query string.
            max_results: Maximum number of results to return.

        Returns:
            List of dicts with 'title', 'snippet', and 'url' keys.
        """
        try:
            raw_results = self.ddgs.text(query, max_results=max_results)
            results = []
            for r in raw_results:
                results.append({
                    "title": r.get("title", ""),
                    "snippet": r.get("body", ""),
                    "url": r.get("href", ""),
                })
            logger.info(f"Web search for '{query}' returned {len(results)} results.")
            return results
        except Exception as e:
            logger.warning(f"Web search failed for '{query}': {e}")
            return []

    @staticmethod
    def format_search_context(results: list[dict]) -> str:
        """
        Format search results into a structured context block
        suitable for injection into the LLM system prompt.

        Args:
            results: List of search result dicts.

        Returns:
            Formatted string with numbered results, or empty string if no results.
        """
        if not results:
            return ""

        lines = [
            "## Web Search Results",
            "The following are real-time search results retrieved from the internet. "
            "Use these to answer the user's question accurately. Cite sources using "
            "[1], [2], etc. when referencing specific information.",
            "",
        ]
        for i, r in enumerate(results, 1):
            title = r.get("title", "Untitled")
            snippet = r.get("snippet", "")
            url = r.get("url", "")
            lines.append(f"[{i}] **{title}**")
            lines.append(f"    {snippet}")
            lines.append(f"    Source: {url}")
            lines.append("")

        return "\n".join(lines)
