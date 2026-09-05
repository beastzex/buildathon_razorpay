"""
Portfolio API Router (Tier 3D)
Provides platform-level vantage point across all merchants on the Razorpay platform.
"""

from fastapi import APIRouter, HTTPException
from analytics.portfolio_view import get_portfolio_overview, PortfolioOverview

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


@router.get("/overview", response_model=PortfolioOverview)
async def get_portfolio():
    """
    Returns platform-wide multi-merchant summary with statistical outlier flags.
    Enables Razorpay risk teams to monitor systemic gateway health and reconciliation variance.
    """
    try:
        overview = get_portfolio_overview()
        return overview
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate portfolio overview: {str(e)}")
