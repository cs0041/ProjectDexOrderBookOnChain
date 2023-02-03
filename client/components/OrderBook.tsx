import React, { useContext } from 'react'
import { ContractContext } from '../context/ContratContext'

type Props = {}

function OrderBook({}: Props) {
  const {
    loadOrderBook,
    loadingOrderBuy,
    loadingOrderSell,
    orderBookBuy,
    orderBookSell,
  } = useContext(ContractContext)
  return (
    <div className="bg-black/20 flex flex-col flex-1 h-full">
      <header className="flex justify-between   p-5 h-[10%]">
        <div className="flex space-x-5 ">
          <button className="space-x-1 flex flex-row hover:opacity-70">
            <div className="space-y-1">
              <div className="w-[20px] h-[20px] bg-red-500" />
              <div className="w-[20px] h-[20px] bg-green-500" />
            </div>
            <div className="w-[20px] h-[44px] bg-gray-600 " />
          </button>

          <button className="space-x-1 flex flex-row hover:opacity-70">
            <div className="w-[20px] h-[44px] bg-green-500" />
            <div className="w-[20px] h-[44px] bg-gray-600 " />
          </button>

          <button className="space-x-1 flex flex-row hover:opacity-70">
            <div className="w-[20px] h-[44px] bg-red-500" />
            <div className="w-[20px] h-[44px] bg-gray-600 " />
          </button>
        </div>

        <span className="text-2xl">100</span>
      </header>

      <div className="grid grid-cols-3    px-5 pb-5">
        <div className="text-right">Price(USDT)</div>
        <div className="text-right">Amount(BTC)</div>
        <div className="text-right">Total</div>
      </div>

      <div className="h-[44%] text-red-500 px-5 ">
        {orderBookSell.map((item) => (
          <div className="grid grid-cols-3 ">
            <div className="text-right">{item.price}</div>
            <div className="text-right"> {item.amount}</div>
            <div className="text-right"> {item.amount * item.price}</div>
          </div>
        ))}
      </div>

      <div className="w-full h-[4%]  " />

      <div className="grid grid-cols-3   px-5 pb-5">
        <div className="text-right">Price(USDT)</div>
        <div className="text-right">Amount(BTC)</div>
        <div className="text-right">Total</div>
      </div>
      <div className="h-[44%]  text-green-500 px-5 ">
        {orderBookBuy.map((item) => (
          <div className="grid grid-cols-3 ">
            <div className="text-right">{item.price}</div>
            <div className="text-right"> {item.amount}</div>
            <div className="text-right"> {item.amount * item.price}</div>
          </div>
        ))}
      </div>

      <button
        className="text-black rounded-lg bg-red-500 p-2 px-8"
        onClick={loadOrderBook}
      >
        GetDataOrder
      </button>
    </div>
  )
}

export default OrderBook
