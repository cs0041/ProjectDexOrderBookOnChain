import React from 'react'

type Props = {}

function Header({}: Props) {
  return (
    <div className="flex flex-1 items-center   bg-black/40 p-8 space-x-10">
      <h1 className="border-r-2 pr-10 text-3xl  flex  items-center">BTC/USD</h1>
      <div className="text-3xl flex flex-col pr-10  ">
        <span>23,400$</span>
      </div>
      <div className=" flex flex-col   ">
        <span>24h Change</span>
        <span>-412 -2.64%</span>
      </div>
      <div className=" flex flex-col  ">
        <span>24h Hight</span>
        <span>-412 -2.64%</span>
      </div>
      <div className=" flex flex-col  ">
        <span>24h Low</span>
        <span>-412 -2.64%</span>
      </div>
      <div className=" flex flex-col  ">
        <span>24h Volume(BTC)</span>
        <span>312.32</span>
      </div>
      <div className=" flex flex-col  ">
        <span>24h Volume(USDT)</span>
        <span>871242.42</span>
      </div>
    </div>
  )
}

export default Header
