import React, { useContext, useState } from 'react'
import { ContractContext } from '../context/ContratContext'

type Props = {}

enum ShowOrderBookStatus {
  BS = "BuySell",
  S = "Sell",
  B = "Buy"
}

function OrderBook({}: Props) {
  const {
    loadOrderBook,
    loadingOrderBuy,
    loadingOrderSell,
    orderBookBuy,
    orderBookSell,
  } = useContext(ContractContext)

  const [statusShowOrderBook, setStatusShowOrderBook] = useState<ShowOrderBookStatus>(ShowOrderBookStatus.BS)
  return (
    <div className="bg-black/20 flex flex-col flex-1 h-full">
      <header className="flex justify-between   p-5 h-[10%]">
        <div className="flex space-x-5 ">
          <button
            onClick={() => setStatusShowOrderBook(ShowOrderBookStatus.BS)}
            className="space-x-1 flex flex-row hover:opacity-70"
          >
            <div className="space-y-1">
              <div className="w-[20px] h-[20px] bg-red-500" />
              <div className="w-[20px] h-[20px] bg-green-500" />
            </div>
            <div className="w-[20px] h-[44px] bg-gray-600 " />
          </button>

          <button
            onClick={() => setStatusShowOrderBook(ShowOrderBookStatus.B)}
            className="space-x-1 flex flex-row hover:opacity-70"
          >
            <div className="w-[20px] h-[44px] bg-green-500" />
            <div className="w-[20px] h-[44px] bg-gray-600 " />
          </button>

          <button
            onClick={() => setStatusShowOrderBook(ShowOrderBookStatus.S)}
            className="space-x-1 flex flex-row hover:opacity-70"
          >
            <div className="w-[20px] h-[44px] bg-red-500" />
            <div className="w-[20px] h-[44px] bg-gray-600 " />
          </button>
        </div>

        <span className="text-2xl">100</span>
      </header>

      <div className="text-sm grid grid-cols-3  gap-x-3 pr-5  pb-5 ">
        <div className="text-right">Price(USDT)</div>
        <div className="text-right">Amount(BTC)</div>
        <div className="text-right">Total</div>
      </div>

      {statusShowOrderBook === ShowOrderBookStatus.B ? null : (
        <div className="h-[44%] text-red-500   pr-5 text-base">
          {orderBookSell.map((item) => (
            <div className="grid grid-cols-3 gap-x-3">
              <div className="text-right ">{item.price}</div>
              <div className="text-right "> {item.amount - item.filled}</div>
              <div className="text-right "> {item.amount * item.price}</div>
            </div>
          ))}
        </div>
      )}

      {statusShowOrderBook === ShowOrderBookStatus.BS && (
        <div className="w-full h-[4%] text-3xl border-y-2 my-5 border-gray-500" />
      )}

      {statusShowOrderBook === ShowOrderBookStatus.S ? null : (
        <div className="h-[44%]  text-green-500  pr-5 text-base">
          {orderBookBuy.map((item) => (
            <div className="grid grid-cols-3 gap-x-3">
              <div className="text-right">{item.price}</div>
              <div className="text-right"> {item.amount - item.filled}</div>
              <div className="text-right"> {item.amount * item.price}</div>
            </div>
          ))}
        </div>
      )}

      <button
        className="text-black rounded-lg bg-red-500 p-2 px-8 mb-5"
        onClick={() => {
          loadOrderBook()
          console.log(statusShowOrderBook)
        }}
      >
        GetDataOrder
      </button>
    </div>
  )
}

export default OrderBook
