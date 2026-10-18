# Volume 06: Cybersecurity & AI AppSec Defense Manual

**Author:** Lead AI Application Security & OWASP Auditor  
**Reference Frameworks:** OWASP Top 10 for Large Language Models (2025/2026), STRIDE Threat Model, NIST AI RMF

---

## 1. OWASP Top 10 for LLMs Defense Architecture

```mermaid
graph TD
    UntrustedInput["Untrusted User Input / Prompt"] --> RegexFilter["1. Regex Heuristic Classifier (DAN, Bypass Signatures)"]
    RegexFilter -->|"Score >= 50"| BlockTraffic["🚨 BLOCK Traffic & Log to audit_logs (HTTP 400)"]
    RegexFilter -->|"Score < 50"| DelimiterSanitizer["2. Delimiter Neutralization (&lt;/user_untrusted_input&gt;)"]
    DelimiterSanitizer --> XMLEnvelope["3. XML Isolation Envelope Framing"]
    XMLEnvelope --> DLPMasker["4. DLP PII & Secret Redaction (SSN, Keys, CC)"]
    DLPMasker --> CanaryInjector["5. High-Entropy Canary Token Injection"]
    CanaryInjector --> LLMInference["6. Model Inference (Node.js Engine)"]
    LLMInference --> CanaryAudit["7. Egress Canary & Leakage Verification"]
    CanaryAudit -->|"Canary Detected in Output"| ExfiltrationAlert["🚨 LEAK DETECTED: Strip Content & Revoke Token"]
    CanaryAudit -->|"Clean Output"| SafeResponse["✅ Transmit Verified Clean Stream to User"]
```

---

## 2. STRIDE Threat Model for AI Microservices

```mermaid
classDiagram
    class STRIDE_Threat_Model {
        +Spoofing: Jose Signed Stateless JWTs (HS256/RS256)
        +Tampering: XML Envelope Framing & SHA-256 Hashes
        +Repudiation: Immutable PostgreSQL audit_logs with IP
        +Information_Disclosure: DLP PII Masking & Canary Tokens
        +Denial_of_Service: Redis Token Rate Limiting & Semantic Cache
        +Elevation_of_Privilege: RBAC Claims & Zod Tool Sandboxes
        +runAudit(): StrideAuditReport
    }
```

---

## 3. Defense Mechanisms Implementation

### 3.1 OWASP LLM01: Prompt Injection Defense
In [`backend/src/security/promptInjectionFirewall.ts`](file:///p:/prabhu/projects/ai_ts_fullstack_mastery/backend/src/security/promptInjectionFirewall.ts):
- **XML Enveloping:** Untrusted inputs are enclosed inside `<user_untrusted_input>` tags. All closing delimiter attempts (`</user_untrusted_input>`, `<system>`) are escaped before reaching model context.
- **Canary Tokens:** A unique cryptographic token (`CANARY_<entropy>_<hmac>`) is embedded into privileged instructions. If the model echoes this token, the response is instantly aborted.

### 3.2 OWASP LLM02: Data Loss Prevention (DLP)
In [`backend/src/security/dlpMasker.ts`](file:///p:/prabhu/projects/ai_ts_fullstack_mastery/backend/src/security/dlpMasker.ts):
- Scrubbing rules neutralize SSNs (`\d{3}-\d{2}-\d{4}`), Credit Cards (Luhn/regex), Email addresses, AWS Access Keys (`AKIA...`), and OpenAI API keys (`sk-...`).
- Supports reversible mapping for authorized downstream re-hydration.

### 3.3 Password Storage: Argon2id Constant-Time Verification
In [`backend/src/security/passwordHasher.ts`](file:///p:/prabhu/projects/ai_ts_fullstack_mastery/backend/src/security/passwordHasher.ts):
- High-memory key derivation with 16-byte cryptographically secure random salts.
- Constant-time buffer verification using `crypto.timingSafeEqual` to eliminate timing side-channel attacks.
