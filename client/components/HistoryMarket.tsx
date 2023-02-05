import { time } from 'console'
import React, { useContext, useEffect } from 'react'
import { ContractContext } from '../context/ContratContext'

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
    <div className="h-full  p-3 ">
      HistoryMarket
      <div className="overflow-y-auto max-h-full pb-10">
        {marketEvent.map((item, index) => (
          <>
            {index != 1 && (
              <p>
                {item.Date} - {item.Side} - {item.amount}
              </p>
            )}
          </>
        ))}
      </div>
    </div>
  )
}

export default HistoryMarket