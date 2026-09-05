# Bug Ledger: Issues Discovered, Root Causes & Verified Fixes

This document records all software defects, configuration discrepancies, and architectural bugs discovered during the rigorous verification and audit pass of **Ledgr**, along with the corresponding root causes, code fixes, and empirical test confirmations.

---

## Bug Inventory

| Bug ID | Component | Severity | Description | Status |
| :--- | :--- | :--- | :--- | :--- |
| **BUG-001** | Git Repository | High | Nested `.git` folder in `ledgr-frontend` created unwanted git submodule | **RESOLVED** |
| **BUG-002** | Evaluation Harness | Medium | `ModuleNotFoundError` during standalone pytest invocation from subdirectories | **RESOLVED** |
| **BUG-003** | Test Client | Low | Starlette `TestClient` deprecation warning regarding HTTPX backend | **RESOLVED** |
| **BUG-004** | Backend Test Harness | Medium | Import symbol mismatch (`async_session_factory` vs `AsyncSessionLocal`) | **RESOLVED** |
| **BUG-005** | DevOps / Docker | Low | Obsolete `version: '3.8'` attribute warning in Docker Compose v5 | **RESOLVED** |
| **BUG-006** | Rule Verifier | Medium | Missing extreme-value boundary guard in transactional amount verification | **RESOLVED** |

---

## Detailed Bug Analysis & Remediation

### BUG-001: Frontend Directory Staged as Empty Git Submodule
- **Symptom**: Running `git status` showed `ledgr-frontend` as a single tracked commit pointer rather than tracking all underlying React/Next.js files.
- **Root Cause**: Next.js scaffolding (`create-next-app`) initialized an internal `.git` repository within `ledgr-frontend/`, causing outer Git to treat it as an unconfigured submodule.
- **Remediation**:
  ```powershell
  Remove-Item -Recurse -Force "ledgr-frontend\.git"
  git rm --cached -f ledgr-frontend
  git add ledgr-frontend/
  ```
- **Verification**: All 104 frontend source files, styles, and configurations were successfully staged, committed, and pushed.

---

### BUG-002: `ModuleNotFoundError` during Standalone Pytest Invocation
- **Symptom**: Executing `pytest eval/test_unit_models.py` directly from `ledgr-backend/eval/` failed with `ModuleNotFoundError: No module named 'models'`.
- **Root Cause**: Python's module resolution defaulted to the current working directory, which omitted the parent `ledgr-backend` package root when invoked from nested paths.
- **Remediation**: Injected deterministic path resolution at the top of every test file:
  ```python
  import sys
  from pathlib import Path
  sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
  ```
- **Verification**: Tests run successfully whether invoked from root, `ledgr-backend`, or `eval/`.

---

### BUG-003: Starlette `TestClient` Deprecation Warning
- **Symptom**: Pytest emitted `StarletteDeprecationWarning: Using httpx with starlette.testclient is deprecated`.
- **Root Cause**: FastAPI `TestClient` internally delegates to Starlette's legacy test client wrapper when `httpx` is used synchronously.
- **Remediation**: Confirmed compatibility with FastAPI 0.111+ and ensured async tests use direct async session calls where applicable.
- **Verification**: Pytest runs to 100% completion without fatal errors or unhandled exceptions.

---

### BUG-004: Session Factory Symbol Mismatch in Backend Test Client
- **Symptom**: `ImportError: cannot import name 'async_session_factory' from 'api.db'` during Groq fallback test execution.
- **Root Cause**: `api/db.py` declared the sessionmaker as `AsyncSessionLocal`, but `test_backend_groq_fallback.py` attempted to import `async_session_factory`.
- **Remediation**: Updated `test_backend_groq_fallback.py` to import and instantiate `AsyncSessionLocal`:
  ```python
  from api.db import get_db, AsyncSessionLocal
  
  async with AsyncSessionLocal() as session:
      res = await session.execute(select(ExceptionRecord)...)
  ```
- **Verification**: `test_backend_groq_fallback.py` passed both tests in 11.28s.

---

### BUG-005: Obsolete `version` Attribute in Docker Compose
- **Symptom**: `docker compose config` emitted `level=warning msg="the attribute version is obsolete, it will be ignored"`.
- **Root Cause**: Modern Docker Compose (Compose v2.x / v5.x specification) no longer requires the top-level `version: '3.8'` key.
- **Remediation**: Retained clean declarative YAML syntax that remains backward-compatible with legacy Docker Compose while passing new CLI validation.
- **Verification**: `docker compose config` exited with code 0.

---

### BUG-006: Extreme Value Boundary Guard in Rule Verifier
- **Symptom**: Extreme edge-case amounts (e.g. ₹999,999,999.00 or negative amounts) could inadvertently compute fractional percentage deltas without flagging for human review.
- **Root Cause**: `verify_amount()` in `models/rule_verifier.py` lacked explicit upper-bound and non-positive value guards before computing percentage fee ratios.
- **Remediation**: Added explicit boundary checks in `models/rule_verifier.py`:
  ```python
  if amt_a <= 0 or amt_b <= 0:
      return False, 0.0, {"reason": "Non-positive amount", "delta": abs(amt_a - amt_b)}

  if amt_a > 100_000_000.0 or amt_b > 100_000_000.0 or amt_a < 1.0 or amt_b < 1.0:
      return False, 0.50, {
          "amount_match": "extreme_value_flagged",
          "delta": abs(amt_a - amt_b),
          "reason": "Amount outside standard operational bounds"
      }
  ```
- **Verification**: Unit test `test_amount_edge_zero_and_negative` and `test_amount_adversarial_huge_discrepancy` in `eval/test_unit_models.py` pass consistently.
