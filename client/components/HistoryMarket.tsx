import { time } from 'console'
import { ethers } from 'ethers'
import React, { useContext, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { ContractContext } from '../context/ContratContext'
import { ConvertDateTime } from '../utils/DateTime'

// interface Props {
//   order: EventMarketOrder[]
// }

function HistoryMarket() {
  const { marketEvent,loadOrderBook,loadOrderBookByAddress }=  useContext(ContractContext)
  const { address, isConnected } = useAccount()
  // useEffect(() => {
  //     const sorting = () => {
  //         marketEvent.sort(function (a, b) {
  //           return b.Date - a.Date
  //         })
  //     }
  //     sorting()
  //     loadOrderBook()
  //     loadOrderBookByAddress(address!)
  // }, [marketEvent])

  //helper
  const toEtherandFixFloatingPoint = (amount: ethers.BigNumber) => Number(ethers.utils.formatEther(amount)).toFixed(6)

  return (
    <div className="h-full p-5">
      <h1 className="text-xl text-yellow-400 font-bold">Market Trades</h1>
      <div className="grid grid-cols-3 py-5">
        <div>Time</div>
        <div>Price(USDT)</div>
        <div>Amount(BTC)</div>
      </div>
      <div className="overflow-y-auto max-h-full pb-10 ">
        {marketEvent.map((item, index) => (
          <div className=" grid grid-cols-3 text-base  py-2 ">
            <div>{ConvertDateTime(item.date.toNumber())}</div>
            <div
              className={` ${
                item.isBuy === 0 ? 'text-red-500' : 'text-green-500'
              }`}
            >
              {toEtherandFixFloatingPoint(item.price)}
            </div>
            <div>{toEtherandFixFloatingPoint(item.amount)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HistoryMarket