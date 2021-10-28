import {BigNumber} from "bignumber.js"
import {CapitalProvider, PoolData} from "../ethereum/pool"
import {InfoIcon} from "../ui/icons"
import {displayDollars, displayPercent} from "../utils"
import AnnualGrowthTooltipContent from "./AnnualGrowthTooltipContent"

interface DepositStatusProps {
  poolData: PoolData | undefined
  capitalProvider: CapitalProvider | undefined
}

function DepositStatus(props: DepositStatusProps) {
  if (props.poolData && props.capitalProvider) {
    const portfolioBalance = props.capitalProvider.totalSeniorPoolBalanceInDollars
    const portfolioBalanceDisplay = displayDollars(portfolioBalance)

    const globalEstimatedApyFromSupplying = props.poolData.estimatedApy
    const estimatedApyFromSupplying = globalEstimatedApyFromSupplying

    const globalEstimatedApyFromGfi = props.poolData.estimatedApyFromGfi || new BigNumber(0)
    const balancePortionEarningGfi = portfolioBalance.gt(0)
      ? props.capitalProvider.stakedSeniorPoolBalanceInDollars.div(portfolioBalance)
      : new BigNumber(0)
    // NOTE: Because our frontend does not currently support staking with lockup, we do not
    // worry here about adjusting for the portion of the user's balance that is not only earning
    // GFI from staking, but is earning that GFI at a boosted rate due to having staked-with-lockup
    // (which they could have achieved by interacting with the contract directly, rather than using
    // our frontend).
    const userEstimatedApyFromGfi = balancePortionEarningGfi.multipliedBy(globalEstimatedApyFromGfi)
    const estimatedApyFromGfi = portfolioBalance.gt(0) ? userEstimatedApyFromGfi : globalEstimatedApyFromGfi

    const estimatedApy = estimatedApyFromSupplying.plus(estimatedApyFromGfi)
    const apyDisplay = `${displayPercent(estimatedApy)}`

    const estimatedGrowth = portfolioBalance.multipliedBy(estimatedApy)
    const estimatedGrowthDisplay = displayDollars(estimatedGrowth)

    let unrealizedGainsPrefix = props.capitalProvider.unrealizedGainsInDollars.gte(0) ? "+" : ""
    let unrealizedGainsDisplay = displayDollars(props.capitalProvider.unrealizedGainsInDollars)
    let unrealizedGainsPercentDisplay = displayPercent(props.capitalProvider.unrealizedGainsPercentage)

    return (
      <div className="deposit-status background-container-inner">
        <div className="deposit-status-item">
          <div className="label">Portfolio balance</div>
          <div className="value">{portfolioBalanceDisplay}</div>
          <div className="sub-value">
            {unrealizedGainsPrefix}
            {unrealizedGainsDisplay} ({unrealizedGainsPercentDisplay})
          </div>
        </div>
        <div className="deposit-status-item">
          <div className="deposit-status-item-flex">
            <div className="label">Est. Annual Growth</div>
            <span data-tip="" data-for="annual-growth-tooltip" data-offset="{'top': 0, 'left': 0}" data-place="bottom">
              <InfoIcon />
            </span>
          </div>
          <div className="value">{estimatedGrowthDisplay}</div>
          <div className="sub-value">{`${apyDisplay} APY${estimatedApyFromGfi?.gt(0) ? " (with GFI)" : ""}`}</div>
        </div>
        <AnnualGrowthTooltipContent
          supplyingCombined={false}
          estimatedApyFromSupplying={estimatedApyFromSupplying}
          estimatedApyFromGfi={estimatedApyFromGfi}
          estimatedApy={estimatedApy}
        />
      </div>
    )
  } else {
    return (
      <div className="deposit-status background-container-inner">
        <div className="deposit-status-item">
          <div className="label">Portfolio balance</div>
          <div className="value">{displayDollars(null, 2)}</div>
        </div>
        <div className="deposit-status-item">
          <div className="label">Est. Annual Growth</div>
          <div className="value">{`${displayPercent(undefined, 2)} APY`}</div>
        </div>
      </div>
    )
  }
}

export default DepositStatus
