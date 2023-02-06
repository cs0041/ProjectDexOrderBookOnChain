import { time } from 'console'
import React, { useContext, useEffect } from 'react'
import { ContractContext } from '../context/ContratContext'
import { ConvertDateTime } from '../utils/DateTime'

type Props = {}

function HistoryMarket({}: Props) {
const { marketEvent }=  useContext(ContractContext)

useEffect(() => {
    const sorting = () => {
        marketEvent.sort(function (a, b) {
          return b.Date - a.Date
        })
    }
    sorting()
}, [marketEvent])

  return (
    <div className="h-full  ml-10 py-3">
      <h1 className='text-xl text-yellow-400'>Market Trades</h1>
      <div className="grid grid-cols-3 py-5">
        <div>Time</div>
        <div>Price(USDT)</div>
        <div>Amount(BTC)</div>
      </div>
      <div className="overflow-y-auto max-h-full pb-10 ">
        {marketEvent.map((item, index) => (
          <div className=" grid grid-cols-3 text-base  py-2 ">
            <div >{ConvertDateTime(item.Date)}</div>
            <div
              className={` ${
                item.Side === 0 ? 'text-red-500' : 'text-green-500'
              }`}
            >
              {item.price}
            </div>
            <div >{item.amount}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HistoryMarket