"""
Tests for the entity harvest cleanup pipeline.
Run with: python -m pytest scripts/test_sync_entities.py -v
"""
import sys
import os
import re

# Add the scripts dir to path so we can import from sync_entities
sys.path.insert(0, os.path.dirname(__file__))

# Import the functions we want to test
from sync_entities import (
    strip_credentials,
    normalize_key,
    is_valid_person_name,
    is_valid_org_name,
    deduplicate_names,
)


class TestStripCredentials:
    """Test credential suffix removal from person names."""

    def test_strips_rn(self):
        assert strip_credentials("Marilyn Fayre Milos, R.N.") == "Marilyn Fayre Milos"

    def test_strips_rn_no_dots(self):
        assert strip_credentials("Marilyn Fayre Milos, RN") == "Marilyn Fayre Milos"

    def test_strips_md(self):
        assert strip_credentials("George C. Denniston, M.D.") == "George C. Denniston"

    def test_strips_phd(self):
        assert strip_credentials("Jim Bigelow, Ph.D.") == "Jim Bigelow"

    def test_strips_multiple_credentials(self):
        assert strip_credentials("George C. Denniston, M.D., M.P.H.") == "George C. Denniston"

    def test_strips_jd_llm(self):
        assert strip_credentials("John V. Geisheker, J.D., LL.M.") == "John V. Geisheker"

    def test_strips_md_ms(self):
        assert strip_credentials("Robert S. Van Howe, M.D., M.S.") == "Robert S. Van Howe"

    def test_strips_leading_dr(self):
        assert strip_credentials("Dr. Rebecca Steinfeld") == "Rebecca Steinfeld"

    def test_strips_leading_dr_no_dot(self):
        assert strip_credentials("Dr Rebecca Steinfeld") == "Rebecca Steinfeld"

    def test_preserves_names_without_credentials(self):
        assert strip_credentials("Brian D. Earp") == "Brian D. Earp"

    def test_preserves_names_with_jr(self):
        # Jr is a suffix we strip, but the base name should remain
        result = strip_credentials("William B. Weil, Jr., MD")
        assert "William B. Weil" in result

    def test_does_not_destroy_short_names(self):
        # Edge case: name is so short that stripping leaves < 3 chars
        # strip_credentials returns original when cleaned result is too short
        assert strip_credentials("Dr. Jo") == "Dr. Jo"
        # But a normal-length name after Dr. works fine
        assert strip_credentials("Dr. Johnson") == "Johnson"


class TestNormalizeKey:
    """Test dedup key normalization."""

    def test_removes_trailing_period(self):
        assert normalize_key("Brian D. Earp") == normalize_key("Brian D Earp")

    def test_collapses_whitespace(self):
        assert normalize_key("J.  Steven  Svoboda") == normalize_key("J. Steven Svoboda")

    def test_case_insensitive(self):
        assert normalize_key("brian d. earp") == normalize_key("Brian D. Earp")

    def test_handles_multiple_initials(self):
        assert normalize_key("R. S. Van Howe") == normalize_key("R.S. Van Howe")
        assert normalize_key("R. S. Van Howe") == normalize_key("R S Van Howe")

    def test_preserves_meaningful_differences(self):
        # These should NOT match — different people
        assert normalize_key("John Smith") != normalize_key("Jane Smith")


class TestIsValidPersonName:
    """Test person name validation."""

    def test_accepts_normal_names(self):
        assert is_valid_person_name("Brian D. Earp") is True
        assert is_valid_person_name("Robert Darby") is True
        assert is_valid_person_name("J. Steven Svoboda") is True

    def test_rejects_urls(self):
        assert is_valid_person_name("http://example.com") is False
        assert is_valid_person_name("www.example.org") is False

    def test_rejects_short_names(self):
        assert is_valid_person_name("AB") is False
        assert is_valid_person_name("") is False
        assert is_valid_person_name(None) is False

    def test_rejects_just_initials(self):
        assert is_valid_person_name("A. B.") is False
        assert is_valid_person_name("J.P.") is False

    def test_rejects_generic_terms(self):
        assert is_valid_person_name("editors") is False
        assert is_valid_person_name("anonymous") is False
        assert is_valid_person_name("unknown") is False
        assert is_valid_person_name("et al") is False

    def test_rejects_org_names_as_people(self):
        assert is_valid_person_name("American Academy of Pediatrics") is False
        assert is_valid_person_name("University of Oxford") is False
        assert is_valid_person_name("Department of Surgery") is False

    def test_rejects_doi_references(self):
        assert is_valid_person_name("doi:10.1234/5678") is False

    def test_rejects_date_strings(self):
        assert is_valid_person_name("January 2020") is False
        assert is_valid_person_name("September issue") is False

    def test_rejects_numbers_only(self):
        assert is_valid_person_name("12345") is False


class TestIsValidOrgName:
    """Test organization name validation."""

    def test_accepts_normal_orgs(self):
        assert is_valid_org_name("University of Oxford") is True
        assert is_valid_org_name("American Medical Association") is True
        assert is_valid_org_name("Attorneys for the Rights of the Child") is True

    def test_rejects_company_suffixes(self):
        assert is_valid_org_name("FileMaker, Inc.") is False
        assert is_valid_org_name("John Wiley & Sons, Inc.") is False
        assert is_valid_org_name("Platigo Solutions Pty Ltd.") is False
        assert is_valid_org_name("Men's Studies Press, LLC") is False
        assert is_valid_org_name("Elsevier Inc.") is False

    def test_rejects_country_codes(self):
        assert is_valid_org_name("USA-NY") is False
        assert is_valid_org_name("UK-EN") is False

    def test_rejects_short_abbreviations(self):
        assert is_valid_org_name("BMJ") is False
        assert is_valid_org_name("NBC") is False
        assert is_valid_org_name("PBS") is False
        assert is_valid_org_name("CNN") is False

    def test_keeps_known_abbreviations(self):
        # These are in our KNOWN_ABBREVIATIONS set
        assert is_valid_org_name("ACLU") is True
        assert is_valid_org_name("WHO") is True

    def test_rejects_long_names(self):
        long_name = "Department of Urology, University of Washington School of Medicine, Seattle, WA, USA"
        assert is_valid_org_name(long_name) is False  # > 80 chars

    def test_rejects_department_strings(self):
        assert is_valid_org_name("Department of Surgery") is False
        assert is_valid_org_name("Division of Urology") is False

    def test_rejects_urls(self):
        assert is_valid_org_name("http://example.com") is False
        assert is_valid_org_name("www.example.org") is False

    def test_rejects_numbered_addresses(self):
        assert is_valid_org_name("9 Mile Clinic, Hope Worldwide, Port Moresby") is False

    def test_accepts_legit_numbered_orgs(self):
        # Doesn't have comma + location pattern
        assert is_valid_org_name("21st Century Healing Arts Foundation") is True

    def test_rejects_too_short(self):
        assert is_valid_org_name("AB") is False
        assert is_valid_org_name("XY") is False


class TestDeduplicateNames:
    """Test the deduplication merge logic."""

    def test_merges_period_variants(self):
        from collections import Counter
        names = Counter({
            "Brian D. Earp": 115,
            "Brian D Earp": 16,
        })
        result, merges = deduplicate_names(names)
        assert merges == 1
        # Should pick the higher-count variant as canonical
        assert "Brian D. Earp" in result
        assert "Brian D Earp" not in result
        # Total count should be summed
        assert result["Brian D. Earp"] == 131

    def test_merges_triple_variants(self):
        from collections import Counter
        names = Counter({
            "R. S. Van Howe": 3,
            "R S Van Howe": 4,
            "R.S. Van Howe": 1,
        })
        result, merges = deduplicate_names(names)
        assert merges == 1
        assert len(result) == 1
        canonical = list(result.keys())[0]
        assert result[canonical] == 8  # 3 + 4 + 1

    def test_no_false_merges(self):
        from collections import Counter
        names = Counter({
            "John Smith": 5,
            "Jane Smith": 3,
            "Bob Jones": 2,
        })
        result, merges = deduplicate_names(names)
        assert merges == 0
        assert len(result) == 3

    def test_prefers_dotted_initials_on_tie(self):
        from collections import Counter
        names = Counter({
            "J. Steven Svoboda": 10,
            "J Steven Svoboda": 10,
        })
        result, merges = deduplicate_names(names)
        assert merges == 1
        # Should prefer the dotted version on count tie
        assert "J. Steven Svoboda" in result


class TestEndToEnd:
    """Integration-style tests for the full harvest pipeline."""

    def test_credential_then_dedup(self):
        """Marilyn Milos appears 3 ways — after credential strip + dedup should merge."""
        from collections import Counter
        raw = Counter({
            "Marilyn Fayre Milos, R.N.": 18,
            "Marilyn Fayre Milos, RN": 12,
            "Marilyn Fayre Milos": 5,
        })
        # Step 1: strip credentials
        cleaned = Counter()
        for name, count in raw.items():
            stripped = strip_credentials(name)
            cleaned[stripped] += count
        # Step 2: dedup
        result, merges = deduplicate_names(cleaned)
        # All three should collapse to one entry
        assert len(result) == 1
        assert "Marilyn Fayre Milos" in result
        assert result["Marilyn Fayre Milos"] == 35  # 18 + 12 + 5

    def test_full_person_pipeline(self):
        """Test that a garbage name gets rejected and a good name passes through."""
        # Garbage
        assert is_valid_person_name("et al") is False
        assert is_valid_person_name("Department of Surgery") is False

        # Good name, with credentials
        cleaned = strip_credentials("George C. Denniston, M.D., M.P.H.")
        assert cleaned == "George C. Denniston"
        assert is_valid_person_name(cleaned) is True


if __name__ == "__main__":
    # Allow running directly: python test_sync_entities.py
    import subprocess
    result = subprocess.run(
        [sys.executable, "-m", "pytest", __file__, "-v"],
        cwd=os.path.dirname(__file__)
    )
    sys.exit(result.returncode)
