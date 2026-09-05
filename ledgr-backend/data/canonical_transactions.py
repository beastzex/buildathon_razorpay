"""
Canonical 20-Transaction Reference Dataset
Matches the exact transactions from the Ledgr frontend specification (TXN-4001 through TXN-4020).
Used for seeding reference Batch #214 and enabling interactive live reconciliation.
"""

from typing import List, Dict, Any

CANONICAL_20_TRANSACTIONS: List[Dict[str, Any]] = [
    {
        "id": "TXN-4001",
        "sourceA": {"id": "BNK-8812", "amount": 42500.00, "date": "2026-09-01", "description": "Transfer — HDFC Settlement", "reference": "REF-91822A"},
        "sourceB": {"id": "GW-1021", "amount": 42500.00, "date": "2026-09-01", "description": "Razorpay payout HDFC settlement", "reference": "PO-91822A"},
        "confidence": 98,
        "status": "matched"
    },
    {
        "id": "TXN-4002",
        "sourceA": {"id": "BNK-8813", "amount": 18750.00, "date": "2026-09-01", "description": "Transfer — ICICI Payout", "reference": "REF-91823B"},
        "sourceB": {"id": "GW-1022", "amount": 18750.00, "date": "2026-09-01", "description": "Gateway settlement batch ICICI", "reference": "PO-91823B"},
        "confidence": 97,
        "status": "matched"
    },
    {
        "id": "TXN-4003",
        "sourceA": {"id": "BNK-8814", "amount": 9320.00, "date": "2026-09-01", "description": "Inward credit gateway net", "reference": "REF-91824C"},
        "sourceB": {"id": "GW-1023", "amount": 9308.00, "date": "2026-09-02", "description": "Late settlement net of gateway fee — 1 day", "reference": "PO-91824C"},
        "confidence": 71,
        "status": "flagged",
        "explanation": "Amount differs by ₹12.00 — likely a gateway processing fee deducted at source. Settlement date is 1 day late. Confidence 71%, below the auto-match threshold of 85%. Flagged for review."
    },
    {
        "id": "TXN-4004",
        "sourceA": {"id": "BNK-8815", "amount": 67200.00, "date": "2026-09-01", "description": "Bulk payout — Vendor A", "reference": "REF-91825D"},
        "sourceB": {"id": "GW-1024", "amount": 67200.00, "date": "2026-09-01", "description": "Vendor disbursement Vendor A", "reference": "PO-91825D"},
        "confidence": 99,
        "status": "matched"
    },
    {
        "id": "TXN-4005",
        "sourceA": {"id": "BNK-8816", "amount": 3450.00, "date": "2026-09-01", "description": "Refund credit customer", "reference": "REF-91826E"},
        "sourceB": {"id": "GW-1025", "amount": 3450.00, "date": "2026-09-01", "description": "Customer refund processed credit", "reference": "PO-91826E"},
        "confidence": 95,
        "status": "matched"
    },
    {
        "id": "TXN-4006",
        "sourceA": {"id": "BNK-8817", "amount": 11500.00, "date": "2026-09-01", "description": "Settlement — Merchant 014", "reference": "REF-91827F"},
        "sourceB": {"id": "GW-1026", "amount": 9800.00, "date": "2026-09-01", "description": "Partial settlement — Merchant 014", "reference": "PO-PARTIAL-9800"},
        "confidence": 48,
        "status": "mismatched",
        "explanation": "Amount mismatch of ₹1,700.00 — source A shows full settlement of ₹11,500 while gateway records only ₹9,800. No fee deduction or charge-back in the gateway logs explains this gap. Confirmed mismatch. Escalated for manual reconciliation."
    },
    {
        "id": "TXN-4007",
        "sourceA": {"id": "BNK-8818", "amount": 28900.00, "date": "2026-09-01", "description": "Transfer — SBI Settlement", "reference": "REF-91828G"},
        "sourceB": {"id": "GW-1027", "amount": 28900.00, "date": "2026-09-01", "description": "SBI bank transfer settlement", "reference": "PO-91828G"},
        "confidence": 96,
        "status": "matched"
    },
    {
        "id": "TXN-4008",
        "sourceA": {"id": "BNK-8819", "amount": 5600.00, "date": "2026-09-01", "description": "Subscription renewal Plan B", "reference": "REF-91829H"},
        "sourceB": {"id": "GW-1028", "amount": 5600.00, "date": "2026-09-01", "description": "Recurring charge subscription — plan B", "reference": "PO-91829H"},
        "confidence": 94,
        "status": "matched"
    },
    {
        "id": "TXN-4009",
        "sourceA": {"id": "BNK-8820", "amount": 14200.00, "date": "2026-09-01", "description": "Invoice payment — Corp X", "reference": "REF-91830I"},
        "sourceB": {"id": "GW-1029", "amount": 14188.00, "date": "2026-09-02", "description": "Corp X payment fee deduction — 2 day lag", "reference": "PO-91830I"},
        "confidence": 73,
        "status": "flagged",
        "explanation": "Amount differs by ₹12.00 — pattern consistent with gateway fee structure. Settlement arrived 2 days after bank recording. Confidence 73%. Recommend confirming with gateway fee schedule before resolving."
    },
    {
        "id": "TXN-4010",
        "sourceA": {"id": "BNK-8821", "amount": 89000.00, "date": "2026-09-01", "description": "Large transfer — Enterprise", "reference": "REF-91831J"},
        "sourceB": {"id": "GW-1030", "amount": 89000.00, "date": "2026-09-01", "description": "Enterprise settlement large transfer", "reference": "PO-91831J"},
        "confidence": 99,
        "status": "matched"
    },
    {
        "id": "TXN-4011",
        "sourceA": {"id": "BNK-8822", "amount": 4100.00, "date": "2026-09-01", "description": "Small merchant payout Merchant A", "reference": "REF-91832K"},
        "sourceB": {"id": "GW-1031", "amount": 4100.00, "date": "2026-09-01", "description": "Merchant A payout small merchant", "reference": "PO-91832K"},
        "confidence": 92,
        "status": "matched"
    },
    {
        "id": "TXN-4012",
        "sourceA": {"id": "BNK-8823", "amount": 22300.00, "date": "2026-09-01", "description": "Bulk refund batch 14 items", "reference": "REF-91833L"},
        "sourceB": {"id": "GW-1032", "amount": 22300.00, "date": "2026-09-01", "description": "Refund batch — 14 transactions bulk", "reference": "PO-91833L"},
        "confidence": 97,
        "status": "matched"
    },
    {
        "id": "TXN-4013",
        "sourceA": {"id": "BNK-8824", "amount": 6750.00, "date": "2026-09-01", "description": "Platform fee credit service", "reference": "REF-91834M"},
        "sourceB": {"id": "GW-1033", "amount": 6750.00, "date": "2026-09-01", "description": "Platform service fee credit", "reference": "PO-91834M"},
        "confidence": 91,
        "status": "matched"
    },
    {
        "id": "TXN-4014",
        "sourceA": {"id": "BNK-8825", "amount": 31000.00, "date": "2026-09-01", "description": "Settlement — Axis bank transfer", "reference": "REF-91835N"},
        "sourceB": {"id": "GW-1034", "amount": 31000.00, "date": "2026-09-01", "description": "Axis settlement confirmed transfer", "reference": "PO-91835N"},
        "confidence": 98,
        "status": "matched"
    },
    {
        "id": "TXN-4015",
        "sourceA": {"id": "BNK-8826", "amount": 7200.00, "date": "2026-09-01", "description": "Chargeback reversal processed", "reference": "REF-91836O"},
        "sourceB": {"id": "GW-1035", "amount": 7200.00, "date": "2026-09-01", "description": "CB reversal processed chargeback", "reference": "PO-91836O"},
        "confidence": 93,
        "status": "matched"
    },
    {
        "id": "TXN-4016",
        "sourceA": {"id": "BNK-8827", "amount": 51800.00, "date": "2026-09-01", "description": "Monthly settlement — Partner B", "reference": "REF-91837P"},
        "sourceB": {"id": "GW-1036", "amount": 51800.00, "date": "2026-09-01", "description": "Partner B monthly settlement", "reference": "PO-91837P"},
        "confidence": 96,
        "status": "matched"
    },
    {
        "id": "TXN-4017",
        "sourceA": {"id": "BNK-8828", "amount": 2300.00, "date": "2026-09-01", "description": "Micro-payment batch sweep", "reference": "REF-91838Q"},
        "sourceB": {"id": "GW-1037", "amount": 2300.00, "date": "2026-09-01", "description": "Micro-payment sweep batch", "reference": "PO-91838Q"},
        "confidence": 90,
        "status": "matched"
    },
    {
        "id": "TXN-4018",
        "sourceA": {"id": "BNK-8829", "amount": 16400.00, "date": "2026-09-01", "description": "Inter-bank transfer settlement", "reference": "REF-91839R"},
        "sourceB": {"id": "GW-1038", "amount": 16400.00, "date": "2026-09-01", "description": "IB settlement confirmed transfer", "reference": "PO-91839R"},
        "confidence": 95,
        "status": "matched"
    },
    {
        "id": "TXN-4019",
        "sourceA": {"id": "BNK-8830", "amount": 9900.00, "date": "2026-09-01", "description": "Vendor payment — Software Corp", "reference": "REF-91840S"},
        "sourceB": {"id": "GW-1039", "amount": 5500.00, "date": "2026-09-01", "description": "Partial vendor payment — Disputed balance", "reference": "PO-DISPUTE-5500"},
        "confidence": 32,
        "status": "mismatched",
        "explanation": "Significant amount mismatch of ₹4,400.00. Source A records full vendor payment while gateway shows only ₹5,500 processed. No corresponding split-payment record found in either source. This requires manual investigation and potential vendor contact."
    },
    {
        "id": "TXN-4020",
        "sourceA": {"id": "BNK-8831", "amount": 13600.00, "date": "2026-09-01", "description": "Final batch settlement sweep", "reference": "REF-91841T"},
        "sourceB": {"id": "GW-1040", "amount": 13600.00, "date": "2026-09-01", "description": "EOD settlement sweep final batch", "reference": "PO-91841T"},
        "confidence": 97,
        "status": "matched"
    }
]
