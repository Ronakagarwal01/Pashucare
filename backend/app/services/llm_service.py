import re
import logging
import openai
from app.config import settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are PashuCare AI, an animal health information assistant. You help users understand animal health concerns and decide on next steps.

IMPORTANT RULES:
1. You understand and respond in English, Hindi, and Hinglish naturally. Match the user's language.
2. You are NOT a veterinarian. Never claim to be one.
3. Never provide a definitive diagnosis.
4. Never prescribe specific medications or dosages.
5. Never provide dangerous treatment instructions.
6. Always recommend consulting a qualified veterinarian for serious, worsening, or persistent symptoms.
7. When important information is missing, ask relevant follow-up questions (age, duration, water intake, temperature, other symptoms).
8. Use the provided knowledge context to give grounded, informative responses.
9. Keep responses clear and understandable. Avoid unnecessary medical jargon.
10. Communicate uncertainty honestly.
11. Classify every response with an urgency level: LOW, MODERATE, or HIGH.

URGENCY CLASSIFICATION:
- LOW: Minor concern, general observation, routine question. Animal appears generally healthy.
- MODERATE: Symptoms that need monitoring. Could worsen if not addressed. Vet visit recommended if symptoms persist.
- HIGH: Potentially serious symptoms requiring prompt veterinary attention. Multiple concerning symptoms, sudden onset of severe symptoms, or emergency signs.

RESPONSE FORMAT:
When you have enough information to assess the situation, structure your response as:

**Urgency: [LOW/MODERATE/HIGH]**

**Observations:** Brief summary of the reported symptoms and situation.

**Information:** Relevant educational information about the symptoms or condition.

**Guidance:** General care guidance and what to monitor.

**Next Step:** Recommended action (monitor, schedule vet visit, seek immediate vet care, etc.).

**Disclaimer:** AI guidance only — not a veterinary diagnosis. Consult a qualified veterinarian for professional assessment.

When you need more information, ask clear follow-up questions first before providing an assessment.

KNOWLEDGE CONTEXT (use this to ground your responses):
{rag_context}
"""


def get_client() -> openai.OpenAI:
    if not settings.openai_api_key:
        raise ValueError("OpenAI API key is not configured. Set OPENAI_API_KEY in your .env file.")
    return openai.OpenAI(api_key=settings.openai_api_key)


def _detect_hinglish(text: str) -> bool:
    hindi_keywords = [
        "kya", "hai", "nahi", "raha", "rahi", "rahe", "hota", "hoti", "bhookh", "bukhar",
        "khana", "ulti", "dast", "kamzor", "susti", "peena", "paani", "kaise", "pashu", "gai", "bhains"
    ]
    words = [w.lower() for w in re.findall(r"\w+", text)]
    return any(w in words for w in hindi_keywords)


def _offline_triage_reply(last_user_message: str, chat_history: list[dict], rag_context: str) -> str:
    msg_lower = last_user_message.lower()
    is_hinglish = _detect_hinglish(last_user_message)

    # Urgency detection
    high_signs = ["blood", "bloody", "khoon", "khun", "seizure", "collapse", "choke", "breathing hard", "severe pain", "unconscious", "behosh", "not breathing"]
    moderate_signs = ["fever", "bukhar", "diarrhea", "dast", "vomit", "ulti", "reduced appetite", "not eating", "khana nahi", "bhookh nahi", "cough", "khansi", "limping", "swelling", "sujan", "lethargic", "susti"]

    if any(s in msg_lower for s in high_signs):
        urgency = "HIGH"
    elif any(s in msg_lower for s in moderate_signs):
        urgency = "MODERATE"
    else:
        urgency = "LOW"

    # Context snippet
    kb_snippet = ""
    if rag_context:
        first_chunk = rag_context.split("---")[0].strip()
        lines = [line.strip() for line in first_chunk.split("\n") if line.strip() and not line.startswith("=")]
        if lines:
            kb_snippet = " ".join(lines[:3])

    if is_hinglish:
        if urgency == "HIGH":
            return f"""**Urgency: HIGH**

**Observations:** Aapne bataya: "{last_user_message}". Yeh lakshan gambhir ho sakte hain aur turant dhyan dene ki zaroorat hai.

**Information:** {kb_snippet or "Pashuon mein achanak gambhir lakshan ya bleeding/severe weakness emergency sthiti darshata hai."}

**Guidance:** Pashu ko aaramdayak aur shaant jagah par rakhein. Paani ki uplabdhata banaye rakhein lekin zabardasti kuch na khilayein.

**Next Step:** Turant kisi nikatatam veterinary doctor (pashu chikitsak) se sampark karein.

**Disclaimer:** AI guidance only — yeh veterinary diagnosis nahi hai. Professional treatment ke liye kripya certified pashu chikitsak se salah lein."""
        else:
            return f"""**Urgency: {urgency}**

**Observations:** Pashu mein lakshan dekhe gaye: "{last_user_message}".

**Information:** {kb_snippet or "Pashuon mein khaan-paan ki kami ya susti pachan tantra mein badlav ya halka sankraman ka sanket ho sakti hai."}

**Guidance:** Pashu ke paani peene, ruminate karne (jugaali), aur mal-mutra par gaur karein. Taaza paani aur saaf chaara dein. Agar bukhaar ya doosre lakshan 24 ghante se adhik bane rahein toh dhyan dein.

**Next Step:** Agle 12-24 ghante lakshano ki nigrani karein. Agar sthiti sudhar na ho toh nikatatam veterinary clinic ya pashu chikitsak se jaanch karwayein.

**Disclaimer:** AI guidance only — yeh veterinary diagnosis nahi hai. Certified pashu chikitsak ki jaanch hamesha prathmikta hai."""
    else:
        if urgency == "HIGH":
            return f"""**Urgency: HIGH**

**Observations:** Symptoms reported: "{last_user_message}". These indicators suggest a potentially serious or acute situation.

**Information:** {kb_snippet or "In veterinary medicine, rapid onset of severe weakness, bleeding, respiratory distress, or severe lethargy warrants immediate professional intervention."}

**Guidance:** Keep the animal in a secure, calm, and well-ventilated resting environment. Ensure fresh drinking water is accessible, but do not force-feed.

**Next Step:** Seek immediate examination by a qualified veterinary doctor or local veterinary hospital.

**Disclaimer:** AI guidance only — not a veterinary diagnosis. Consult a qualified veterinarian for professional assessment and emergency care."""
        else:
            return f"""**Urgency: {urgency}**

**Observations:** Reported observations: "{last_user_message}".

**Information:** {kb_snippet or "Variations in feed intake, energy levels, or mild digestive changes are common initial indicators of environmental stress, diet shifts, or early infection."}

**Guidance:** Monitor water intake, rumination (chewing cud if ruminant), body temperature, and fecal consistency over the next 12 to 24 hours. Keep clean water and easily digestible forage available.

**Next Step:** Continue close observation. If symptoms persist beyond 24 hours or if new signs like high fever or severe lethargy develop, arrange an in-person veterinary checkup.

**Disclaimer:** AI guidance only — not a veterinary diagnosis. Consult a qualified veterinarian for professional assessment."""


def chat_completion(messages: list[dict], rag_context: str = "") -> str:
    if not settings.openai_api_key:
        last_user = next((m["content"] for m in reversed(messages) if m.get("role") == "user"), "")
        return _offline_triage_reply(last_user, messages, rag_context)

    client = get_client()
    system = SYSTEM_PROMPT.replace("{rag_context}", rag_context or "No specific context available.")
    full_messages = [{"role": "system", "content": system}] + messages

    response = client.chat.completions.create(
        model=settings.openai_model,
        messages=full_messages,
        temperature=0.4,
        max_tokens=1500,
    )
    return response.choices[0].message.content


def generate_case_summary(animal_info: str, conversation: str, rag_context: str = "") -> str:
    if not settings.openai_api_key:
        # Generate rich structured case summary from available details
        urgency = "MODERATE"
        if "HIGH" in conversation.upper() or "URGENT" in conversation.upper():
            urgency = "HIGH"
        elif "LOW" in conversation.upper() and "MODERATE" not in conversation.upper():
            urgency = "LOW"

        user_lines = [line.replace("USER:", "").strip() for line in conversation.split("\n") if line.startswith("USER:")]
        symptoms_reported = "; ".join(user_lines) if user_lines else "General health inquiry"

        return f"""1. **Animal Information**
{animal_info}

2. **Reported Symptoms**
{symptoms_reported}

3. **Conversation Summary**
The consultation covered health concerns regarding {symptoms_reported}. The assistant provided triage categorization and educational guidance grounded in veterinary best practices.

4. **Important Observations**
- Clinical signs discussed: {symptoms_reported}
- Hydration and rumination monitoring recommended
- Vital signs to track: appetite, stool consistency, temperature

5. **Urgency Level**
**{urgency}** — Symptoms require systematic observation and standard veterinary monitoring.

6. **Relevant Information**
{rag_context[:400] if rag_context else "Knowledge base indicates that timely observation of feed intake, water balance, and body temperature prevents complication of early infections."}

7. **Suggested Next Step**
Maintain observation log for 24 hours. Schedule an in-person veterinary examination if symptoms persist or deteriorate.

8. **Disclaimer**
This is AI-generated educational information, not a veterinary diagnosis. For professional assessment, consult a qualified veterinarian."""

    client = get_client()
    prompt = f"""Generate a professional case summary for the following animal health consultation.

Animal Information:
{animal_info}

Consultation Conversation:
{conversation}

Relevant Knowledge Context:
{rag_context or "None available."}

Format the summary with these sections:
1. **Animal Information** — species, breed, age, gender, weight
2. **Reported Symptoms** — what the user described
3. **Conversation Summary** — key points from the conversation
4. **Important Observations** — notable findings from the discussion
5. **Urgency Level** — LOW, MODERATE, or HIGH with reasoning
6. **Relevant Information** — educational context from knowledge base
7. **Suggested Next Step** — recommended action
8. **Disclaimer** — "This is AI-generated educational information, not a veterinary diagnosis. For professional assessment, consult a qualified veterinarian."

Keep the summary clear, professional, and factual. Do not invent information not discussed in the consultation."""

    response = client.chat.completions.create(
        model=settings.openai_model,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=2000,
    )
    return response.choices[0].message.content
