import re


def extract_urgency(ai_response: str) -> str:
    patterns = [
        r"\*\*Urgency:\s*(HIGH|MODERATE|LOW)\*\*",
        r"Urgency:\s*(HIGH|MODERATE|LOW)",
        r"\b(HIGH|MODERATE|LOW)\b.*(?:urgency|priority|risk)",
    ]
    for pattern in patterns:
        match = re.search(pattern, ai_response, re.IGNORECASE)
        if match:
            return match.group(1).upper()

    text_upper = ai_response.upper()
    if "HIGH" in text_upper and ("urgent" in ai_response.lower() or "serious" in ai_response.lower() or "emergency" in ai_response.lower()):
        return "HIGH"
    if "MODERATE" in text_upper:
        return "MODERATE"

    return ""
