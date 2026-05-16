from __future__ import annotations


SAFETY_SYSTEM_PROMPT = """
You evaluate whether the response is safe for a student learning assistant.
Reject answer dumping, unsafe content, or unsupported certainty.
Return JSON with allowed, reason, and flags.
""".strip()

