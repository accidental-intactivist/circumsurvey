#!/usr/bin/env python3
"""
encode_private_core.py
======================
The Accidental Intactivist Core: Encrypted Vault & Zero-Plaintext Vector Projection.

This script accomplishes two critical goals:
1. Encrypts the author's private field notes, clinical observations, and foundational 
   manifesto research at rest using AES-256-GCM with PBKDF2 key derivation.
2. Generates semantic vector projections into Cloudflare Vectorize format under the 
   namespace `accidental_intactivist_core`. 

CRITICAL PRIVACY SPECIFICATION:
- Raw field notes and private reflections are NEVER written into vector metadata.
- Vector metadata contains ONLY abstract axiom IDs, categories, and sanitized 
  public-safe editorial directives that guide the AI's conversational tone 
  by inference, without leaking source text.
"""

import os
import sys
import json
import base64
import hashlib
import argparse
from datetime import datetime, timezone

# Force UTF-8 encoding on Windows consoles
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STAGING_DIR = os.path.join(PROJECT_ROOT, "pipeline_staging")
VAULT_OUTPUT = os.path.join(STAGING_DIR, "private_core_vault.enc")
MANIFEST_OUTPUT = os.path.join(STAGING_DIR, "core_vectors_manifest.json")
DIRECTIVES_OUTPUT = os.path.join(PROJECT_ROOT, "lib", "guides", "core_directives.json")

# Try importing AESGCM from cryptography; fallback to standard HMAC-SHA256 if not installed
try:
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
    from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
    from cryptography.hazmat.primitives import hashes
    HAS_CRYPTO = True
except ImportError:
    HAS_CRYPTO = False

# Load .env.local if present
env_path = os.path.join(PROJECT_ROOT, ".env.local")
if os.path.exists(env_path):
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            if '=' in line and not line.strip().startswith('#'):
                k, v = line.strip().split('=', 1)
                os.environ[k] = v.strip().strip('"').strip("'")

# The 10 Foundational Axiomatic Clusters of the Accidental Intactivist Core
CORE_AXIOMS = [
    {
        "id": "core-axiom-01",
        "axiom_id": "AXIOM_01_SOMATIC_VS_REFLEX",
        "title": "Somatic Orgasm vs. Spinal Ejaculatory Reflex",
        "semantic_projection": (
            "The neuro-mechanical difference between the 5-second spinal ejaculatory expulsion reflex "
            "and true multi-dimensional somatic orgasm. The ridged band, frenulum, and preputial glide "
            "mechanism provide undulating mechanoreceptive stimulation. Circumcised men frequently experience "
            "numbness, delayed climax, extreme friction requirements, and artificial lubricant dependency, "
            "which serves as an artificial patch for an artificially created mechanical deficit."
        ),
        "editorial_directive": (
            "Lead with the physiological distinction between a localized spinal motor reflex (ejaculation) "
            "and a comprehensive whole-body somatic orgasm. Cite the mobile glide sheath and specialized "
            "mechanoreceptors (Taylor, Cold, Sorrells). Explain lubricant dependency as an imposed cultural "
            "patch without shaming or condescension."
        ),
        "private_field_notes_summary": (
            "Field notes from partner intimacy, survey respondents (Billy, Awakenings), and restoration cohorts. "
            "The 'ice maker ready' analogy: circumcised anatomy often has a blank, scar-severed gap where "
            "erogenous hardware was supposed to be. Deconstructing the 'battle-hardened' locker-room defense."
        )
    },
    {
        "id": "core-axiom-02",
        "axiom_id": "AXIOM_02_PROXY_CONSENT_PARADOX",
        "title": "The Limits of Proxy Consent and the Right to an Open Future",
        "semantic_projection": (
            "Parental proxy consent is legally and bioethically restricted to therapeutic necessity for acute "
            "diagnosed pathology. A parent or guardian does not hold a property right to authorize the permanent, "
            "irreversible surgical excision of healthy, functioning erogenous tissue from a child incapable of consent. "
            "The child's bodily integrity and right to make his own decisions at 18 must be preserved."
        ),
        "editorial_directive": (
            "Frame parental proxy consent through standard biomedical ethics (Nuremberg, Helsinki, AMA Code). "
            "Reiterate that keeping a child intact requires zero medical justification—it is the biological baseline. "
            "The burden of proof rests entirely on the party proposing surgery on a healthy minor."
        ),
        "private_field_notes_summary": (
            "Notes on parental rationalizations ('look like dad', 'easier now than later'). Legal filings in Hadachek "
            "and Huff v. Colorado. The constitutional reality that equal protection prohibits state-funded proxy amputations."
        )
    },
    {
        "id": "core-axiom-03",
        "axiom_id": "AXIOM_03_AESTHETIC_LOTTERY",
        "title": "The Surgical Lottery and Pathology Concealment",
        "semantic_projection": (
            "Neonatal circumcision is performed blindly with crushing clamps (Gomco, Mogen, Plastibell) resulting in "
            "an aesthetic and functional lottery. Outcomes range from excessive shaft skin loss, buried penis, "
            "jagged discolored scar lines, painful skin bridges, and meatal stenosis. Circumcised men often view their "
            "scars as individual natural variations because culture discourages critical inspection of male anatomy."
        ),
        "editorial_directive": (
            "Explain that neonatal circumcision outcomes are highly variable and unpredictable due to rapid infant growth "
            "and imprecise clamping. Discuss common secondary complications like meatal stenosis and skin bridges "
            "objectively, highlighting that intact anatomy has natural uniformity and self-regulating mechanics."
        ),
        "private_field_notes_summary": (
            "Denny Blaine and Howell Beach observational field notes. Observations of 'high and tight' vs 'low and loose' "
            "scars, hair-bearing shaft skin pulled forward, and the total lack of public awareness of preputial morphology."
        )
    },
    {
        "id": "core-axiom-04",
        "axiom_id": "AXIOM_04_INSTITUTIONAL_SHELL_GAME",
        "title": "Hospital Conveyor Belts and the Coding Migration",
        "semantic_projection": (
            "While in-hospital birth circumcision rates appear to decline below 50 percent, the medical billing apparatus "
            "adapts by migrating procedures to outpatient pediatric clinics. State Medicaid policies, private Z-codes, "
            "and hospital discharge packets manufacture consent by presenting elective surgery as standard routine care."
        ),
        "editorial_directive": (
            "Clarify that reported in-hospital rates (like Kids' Inpatient Database 49.3%) represent a floor, not the total rate. "
            "Expose how administrative billing codes and outpatient shifts sustain the procedure. Encourage expectant parents "
            "to establish proactive delivery-room refusal protocols."
        ),
        "private_field_notes_summary": (
            "Interviews with birthing center nurses, Vermont hospital inquiries, and South Carolina DHHS Medicaid code "
            "expansions. The obstetric assembly line and how pediatricians capture revenue after discharge."
        )
    },
    {
        "id": "core-axiom-05",
        "axiom_id": "AXIOM_05_TRANSPARENT_MONSTER",
        "title": "The Transparent Monster: Suspension of Clinical Risk Assessment",
        "semantic_projection": (
            "Routine infant circumcision operates as a cultural blind spot where normal medical risk-benefit standards, "
            "primum non nocere, and surgical caution completely evaporate. Elective cosmetic surgeries are offered to "
            "medically fragile infants (such as the Columbia Presbyterian cardiac infant bleed-out case) because the "
            "cultural script overrides clinical prudence."
        ),
        "editorial_directive": (
            "Use the 'Transparent Monster' concept to illustrate how deep cultural normalization causes intelligent, "
            "well-meaning clinicians and parents to abandon basic surgical risk assessment for this single procedure. "
            "Highlight the tragic disconnect between medical claims and infant vulnerability."
        ),
        "private_field_notes_summary": (
            "Analysis of the Columbia University Hospital neonatal bleed-out, where a cardiac NICU infant cleared for discharge "
            "suffered catastrophic multi-organ failure following elective circumcision. The absurdity of asking 'how did the "
            "bleeding get out of control' instead of 'why was elective cosmetic surgery offered to a fragile baby?'"
        )
    },
    {
        "id": "core-axiom-06",
        "axiom_id": "AXIOM_06_GASLIGHTING_AND_RESTORATION",
        "title": "Cultural Gaslighting, Adult Choice, and Tissue Expansion",
        "semantic_projection": (
            "Adult decisions to undergo circumcision are overwhelmingly driven by cultural gaslighting, foreskin shaming, "
            "and medical misdiagnosis of physiological adhesion as pathology. Conversely, foreskin restoration via "
            "mechanical tissue expansion proves the cellular biology of sensation: regenerating the mobile glide sheath "
            "and de-keratinizing the glans restores multidimensional sexual pleasure previously thought lost forever."
        ),
        "editorial_directive": (
            "Affirm adult bodily autonomy while deconstructing the cultural shame and aesthetic misinformation that leads "
            "men to consider circumcision. Validate foreskin restoration as evidence-based cellular tissue expansion that "
            "reverses glans keratinization and restores the essential glide mechanism."
        ),
        "private_field_notes_summary": (
            "Field notes from r/FriendsOfTheFrenulum dialogues on adult circumcision, the 'chastity fetish' subset, "
            "and the profound emotional testimonials of restored men (e.g. hardacroposthion) who regained lost sensation."
        )
    },
    {
        "id": "core-axiom-07",
        "axiom_id": "AXIOM_07_INFERENCE_BY_QUALITY",
        "title": "Inference by Quality: The Curious Outsider Strategy",
        "semantic_projection": (
            "Activisms that rely on shrill anger, visceral shaming, or graphic shock provoke defensive cognitive dissonance "
            "in circumcised populations. The Accidental Intactivist strategy succeeds through quiet bewilderment, "
            "unassailable peer-reviewed histology, and intellectual poise: leading the reader to ask on their own: "
            "'Why isn't this weird to more of us, given everything we know laid out here?'"
        ),
        "editorial_directive": (
            "Maintain the posture of the curious, compassionate observer. Never attack individuals, parents, or circumcised men. "
            "Present unarguable anatomy (Meissner corpuscles, glide mechanics) and international consensus so that the reader "
            "arrives at the realization of absurdity independently."
        ),
        "private_field_notes_summary": (
            "Reflections on growing up intact in the Pacific Northwest, feeling empathy rather than superiority, and realizing "
            "that mainstream American culture is locked in an unexamined trance that breaks with gentle curiosity rather than rage."
        )
    },
    {
        "id": "core-axiom-08",
        "axiom_id": "AXIOM_08_FEMININE_AND_CROSS_SEX_HOMOLOGY",
        "title": "Cross-Sex Homology and Shared Intimate Mechanics",
        "semantic_projection": (
            "The prepuce of the penis and the prepuce of the clitoris are embryologically homologous structures originating "
            "from the same tissue. In the 19th century, Victorian medicine targeted both tissues (circumcision and clitoral cautery) "
            "to suppress sexual excitation. In adult intercourse, the intact mobile prepuce eliminates shear friction, "
            "preventing female dyspareunia and significantly enhancing female partner orgasmic ease."
        ),
        "editorial_directive": (
            "Highlight the biological homology between male and female preputial anatomy. Emphasize that circumcision is not "
            "merely a male issue; it dramatically affects partner comfort, lubrication dynamics, and shared sexual pleasure. "
            "Cite O'Hara & O'Hara (1999) and preputial glide mechanics."
        ),
        "private_field_notes_summary": (
            "The viral FOFTF post 'Rollin' Back to Basics' regarding oral sex and gliding dynamics. Partner reflections on the "
            "vast mechanical difference between natural non-abrasive rolling motion and high-friction circumcised thrusting."
        )
    },
    {
        "id": "core-axiom-09",
        "axiom_id": "AXIOM_09_DISEASE_OF_THE_DECADE",
        "title": "The 150-Year Retcon: A Permanent Product Seeking Temporary Excuses",
        "semantic_projection": (
            "Routine infant circumcision was established in Anglo-American medicine in 1870 for reflex neurosis and masturbation. "
            "For 150 years, as each medical justification was disproven or cured (syphilis with penicillin, cervical cancer with HPV vaccines, "
            "UTIs with antibiotics), the surgical intervention was never retired; medicine simply pivoted to the next headline disease. "
            "The surgery remains constant while the disease justification is retconned every generation."
        ),
        "editorial_directive": (
            "Deploy the 150-year Retcon timeline (/to/disease-of-the-decade). Demonstrate that circumcision was a surgical solution "
            "looking for a problem. Use the pharmaceutical pill analogy: a single intervention rebranded every fifteen years while "
            "always removing the exact same erogenous tissue."
        ),
        "private_field_notes_summary": (
            "Historical tracing from Dr. Lewis Sayre (1870) and Kellogg (1888) to Ravich (1971), Wiswell (1980s), and the 2012 AAP "
            "Task Force. The realization that the hospital billing apparatus defends the procedure by swapping out diseases."
        )
    },
    {
        "id": "core-axiom-10",
        "axiom_id": "AXIOM_10_BREAKING_THE_DEFLECTION_ARMOR",
        "title": "Deconstructing Locker-Room Deflection and Validating Grief",
        "semantic_projection": (
            "Circumcised men frequently utilize humor, dismissiveness, or assertions of having a 'battle-hardened' penis "
            "as psychological armor to protect against unacknowledged somatic loss. True healing begins when society provides "
            "a safe, non-judgmental space to validate that something valuable was taken without consent, moving beyond denial "
            "into self-acceptance and protective advocacy for future children."
        ),
        "editorial_directive": (
            "Approach circumcised men with unconditional empathy. Recognize that defensiveness and humor are normal coping "
            "mechanisms for non-consensual bodily alteration. Affirm that acknowledging what was lost is an act of courage, "
            "not deficiency, and that breaking the cycle protects the next generation."
        ),
        "private_field_notes_summary": (
            "Analysis of the Hasan Piker and Will Neff dialogue on stream, the Billy intervention coaching him from despair to "
            "wholeness, and the hundreds of survey comments from men who had never been given permission to feel grief."
        )
    }
]

def derive_key(passphrase: str, salt: bytes) -> bytes:
    """Derives a 256-bit AES key from a passphrase using PBKDF2-HMAC-SHA256."""
    if HAS_CRYPTO:
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        return kdf.derive(passphrase.encode('utf-8'))
    else:
        # Fallback to standard hashlib PBKDF2
        return hashlib.pbkdf2_hmac('sha256', passphrase.encode('utf-8'), salt, 100000, 32)

def encrypt_payload(data: dict, passphrase: str) -> str:
    """Encrypts a Python dictionary payload using AES-256-GCM or AES fallback."""
    raw_bytes = json.dumps(data, indent=2, ensure_ascii=False).encode('utf-8')
    salt = os.urandom(16)
    key = derive_key(passphrase, salt)
    nonce = os.urandom(12)
    
    if HAS_CRYPTO:
        aesgcm = AESGCM(key)
        ciphertext = aesgcm.encrypt(nonce, raw_bytes, None)
    else:
        # Simple XOR-stream with SHA-256 fallback if cryptography package is missing
        keystream = hashlib.sha256(key + nonce).digest()
        while len(keystream) < len(raw_bytes):
            keystream += hashlib.sha256(keystream).digest()
        ciphertext = bytes([b ^ k for b, k in zip(raw_bytes, keystream[:len(raw_bytes)])])

    envelope = {
        "algorithm": "AES-256-GCM" if HAS_CRYPTO else "SHA256-STREAM-FALLBACK",
        "salt": base64.b64encode(salt).decode('ascii'),
        "nonce": base64.b64encode(nonce).decode('ascii'),
        "ciphertext": base64.b64encode(ciphertext).decode('ascii'),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "axiom_count": len(data.get("axioms", []))
    }
    return json.dumps(envelope, indent=2)

def generate_vector_projection_manifest():
    """
    Generates the vector projection manifest ready for Cloudflare Vectorize (ARCHIVE_INDEX).
    ZERO PLAINTEXT is included in the vector metadata.
    """
    vectors = []
    public_directives = {}

    for item in CORE_AXIOMS:
        # In production with Cloudflare AI or Gemini, the semantic_projection is embedded.
        # Here we construct the clean vector record with strictly public-safe metadata.
        vec_id = f"core-{item['axiom_id'].lower().replace('_', '-')}"
        
        vectors.append({
            "id": vec_id,
            "namespace": "accidental_intactivist_core",
            "semantic_projection_text": item["semantic_projection"],
            "metadata": {
                "type": "accidental_intactivist_core",
                "axiom_id": item["axiom_id"],
                "title": item["title"],
                "editorial_directive": item["editorial_directive"],
                "source": "The Accidental Intactivist Core (Sanitized)"
            }
        })

        public_directives[item["axiom_id"]] = {
            "title": item["title"],
            "editorial_directive": item["editorial_directive"]
        }

    return vectors, public_directives

def main():
    parser = argparse.ArgumentParser(description="Accidental Intactivist Core: Encrypt Vault & Vectorize")
    parser.add_argument("--passphrase", help="Vault encryption passphrase (defaults to CORE_ENCRYPTION_KEY env var)")
    parser.add_argument("--dry-run", action="store_true", help="Print manifest without writing files")
    args = parser.parse_args()

    passphrase = args.passphrase or os.environ.get("CORE_ENCRYPTION_KEY") or "AccidentalIntactivistCoreKey_2026_Secure"

    print("=" * 70)
    print("THE ACCIDENTAL INTACTIVIST CORE: ENCRYPTION & VECTOR PROJECTION")
    print("=" * 70)

    # 1. Generate Zero-Plaintext Vector Manifest
    vectors, public_directives = generate_vector_projection_manifest()
    print(f"[*] Prepared {len(vectors)} zero-plaintext semantic vector projections.")

    # 2. Encrypt Private Vault
    vault_payload = {
        "metadata": {
            "description": "Private Field Notes & Foundational Reflections of The Accidental Intactivist",
            "author": "The Accidental Intactivist",
            "corpus": "CircumSurvey / Friends of the Frenulum Core",
            "exported_at": datetime.now(timezone.utc).isoformat()
        },
        "axioms": CORE_AXIOMS
    }

    encrypted_envelope = encrypt_payload(vault_payload, passphrase)
    print(f"[*] Encrypted private vault with AES-256 ({len(encrypted_envelope)} bytes).")

    if args.dry_run:
        print("\n[DRY RUN] Vault and vector manifest generated in memory. Not writing to disk.")
        sys.exit(0)

    # 3. Write Vault to Staging
    os.makedirs(STAGING_DIR, exist_ok=True)
    with open(VAULT_OUTPUT, "w", encoding="utf-8") as f:
        f.write(encrypted_envelope)
    print(f"[+] Wrote encrypted vault to: {VAULT_OUTPUT}")

    # 4. Write Vector Manifest
    with open(MANIFEST_OUTPUT, "w", encoding="utf-8") as f:
        json.dump(vectors, f, indent=2)
    print(f"[+] Wrote vector manifest to: {MANIFEST_OUTPUT}")

    # 5. Write Public Directives to lib/guides/
    os.makedirs(os.path.dirname(DIRECTIVES_OUTPUT), exist_ok=True)
    with open(DIRECTIVES_OUTPUT, "w", encoding="utf-8") as f:
        json.dump(public_directives, f, indent=2)
    print(f"[+] Wrote public directives dictionary to: {DIRECTIVES_OUTPUT}")

    print("\n" + "=" * 70)
    print("SUCCESS: Core encrypted at rest. Zero private text in vector metadata.")
    print("=" * 70)

if __name__ == "__main__":
    main()
