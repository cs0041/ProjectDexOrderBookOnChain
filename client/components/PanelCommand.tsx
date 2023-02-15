import React, { useContext, useState } from 'react'
import { ContractContext } from '../context/ContratContext'
import { PlusCircleIcon } from '@heroicons/react/24/solid'
import router from 'next/router'

type Props = {}


enum LimitMarketStatus {
  Limit,
  Market
}


function PanelCommand({}: Props) {
const {
  sendTxLimitOrder,
  sendTxMarketOrder,
  balancesSpotToken0,
  balancesSpotToken1,
  balancesTradeToken0,
  balancesTradeToken1,
} = useContext(ContractContext)

  const [selectlimitMarket, setSelectlimitMarket] = useState<LimitMarketStatus>(LimitMarketStatus.Limit)
    
  const [inputBuyPriceTokenLimitOrder, setInputBuyPriceTokenLimitOrder] = useState<string>()
  const [inputBuyAmountTokenLimitOrder, setInputBuyAmountTokenLimitOrder] = useState<string>()

  const [inputSellPriceTokenLimitOrder, setInputSellPriceTokenLimitOrder] = useState<string>()
  const [inputSellAmountTokenLimitOrder, setInputSellAmountTokenLimitOrder] = useState<string>()
  return (
    <div className="h-full  p-5  bg-black/30">
      <div className="space-x-5">
        <button
          onClick={() => setSelectlimitMarket(LimitMarketStatus.Limit)}
          className={`${
            selectlimitMarket === LimitMarketStatus.Limit && 'text-yellow-300'
          } HeadSelectTypeOrder`}
        >
          Limit Order
        </button>
        <button
          onClick={() => setSelectlimitMarket(LimitMarketStatus.Market)}
          className={`${
            selectlimitMarket === LimitMarketStatus.Market && 'text-yellow-300'
          } HeadSelectTypeOrder`}
        >
          Market Order
        </button>
      </div>

      {/* 
      <div className="flex flex-row space-x-10 text-6xl">
        <div>
          <h1>Balances Spot</h1>
          <p>{`Token0 : ${balancesSpotToken0}`}</p>
          <p>{`Token1 : ${balancesSpotToken1}`}</p>
        </div>
        <div>
          <h1>Balances Trade</h1>
          <p>{`Token0 : ${balancesTradeToken0}`}</p>
          <p>{`Token1 : ${balancesTradeToken1}`}</p>
        </div>
      </div> */}

      <div className="mt-2 flex-row flex space-x-10 justify-center  ">
        <div className="space-y-4  w-1/2 ">
          <div className="flex flex-row space-x-5   ">
            <span className="text-xl text-gray-400">Balances</span>
            <span className="text-xl text-white flex flex-row">
              {balancesSpotToken1}
            </span>
            <div className=" flex  items-center ">
              <PlusCircleIcon
                onClick={() => router.push('/deposit')}
                className="h-6 w-6   hover:text-yellow-400 cursor-pointer"
              />
            </div>
          </div>
          {selectlimitMarket === LimitMarketStatus.Limit && (
            <div className="InputOrder">
              <span className="flex items-center pl-2 pr-5 text-gray-400">
                Price
              </span>
              <input
                type="number"
                onKeyPress={(event) => {
                  if (!/^[0-9]*[.,]?[0-9]*$/.test(event.key)) {
                    event.preventDefault()
                  }
                }}
                onChange={(e) => {
                  setInputBuyPriceTokenLimitOrder(e.target.value)
                }}
                className="  w-full py-2 pr-2 text-right  bg-transparent outline-none  text-white"
              />
              <span className="flex items-center  pr-5">USDT</span>
            </div>
          )}

          <div className="InputOrder">
            <span className="flex items-center pl-2 pr-5 text-gray-400">
              Amount
            </span>
            <input
              type="number"
              onKeyPress={(event) => {
                if (!/^[0-9]*[.,]?[0-9]*$/.test(event.key)) {
                  event.preventDefault()
                }
              }}
              onChange={(e) => {
                setInputBuyAmountTokenLimitOrder(e.target.value)
              }}
              className="  w-full py-2 pr-2 text-right  bg-transparent outline-none  "
            />
            <span className="flex items-center  pr-5">
              {selectlimitMarket === LimitMarketStatus.Limit ? 'BTC' : 'USDT'}
            </span>
          </div>

          {selectlimitMarket === LimitMarketStatus.Limit && (
            <div className="bg-gray-500 flex flex-row text-xl rounded-sm cursor-not-allowed">
              <span className="flex items-center pl-4 pr-5 ">Total</span>
              <div className="  w-full py-2 pr-2 text-right  ">
                {(
                  Number(inputBuyAmountTokenLimitOrder) *
                  Number(inputBuyPriceTokenLimitOrder)
                ).toFixed(4)}
              </div>
              <span className="flex items-center  pr-5">USDT</span>
            </div>
          )}

          <button
            onClick={() => {
              if (selectlimitMarket === LimitMarketStatus.Limit) {
                sendTxLimitOrder(
                  0,
                  inputBuyAmountTokenLimitOrder!,
                  inputBuyPriceTokenLimitOrder!
                )
              } else if (selectlimitMarket === LimitMarketStatus.Market) {
                sendTxMarketOrder(0, inputBuyAmountTokenLimitOrder!)
              }
            }}
            className=" w-full text-white rounded bg-green-500 py-3 font-semibold"
          >
            Buy BTC
          </button>
        </div>

        <div className="space-y-4  w-1/2">
          <div className="flex flex-row space-x-5   ">
            <span className="text-xl text-gray-400">Balances</span>
            <span className="text-xl text-white flex flex-row">
              {balancesSpotToken0}
            </span>
            <div className=" flex  items-center ">
              <PlusCircleIcon
                onClick={() => router.push('/deposit')}
                className="h-6 w-6   hover:text-yellow-400 cursor-pointer"
              />
            </div>
          </div>

          {selectlimitMarket === LimitMarketStatus.Limit && (
            <div className="InputOrder">
              <span className="flex items-center pl-2 pr-5 text-gray-400">
                Price
              </span>
              <input
                type="number"
                required
                onKeyPress={(event) => {
                  if (!/^[0-9]*[.,]?[0-9]*$/.test(event.key)) {
                    event.preventDefault()
                  }
                }}
                onChange={(e) => {
                  setInputSellPriceTokenLimitOrder(e.target.value)
                }}
                className=" w-full py-2 pr-2 text-right   bg-transparent outline-none text-xl text-white"
              />
              <span className="flex items-center  pr-5">USDT</span>
            </div>
          )}

          <div className="InputOrder">
            <span className="flex items-center pl-2 pr-5 text-gray-400">
              Amount
            </span>
            <input
              type="number"
              required
              onKeyPress={(event) => {
                if (!/^[0-9]*[.,]?[0-9]*$/.test(event.key)) {
                  event.preventDefault()
                }
              }}
              onChange={(e) => {
                setInputSellAmountTokenLimitOrder(e.target.value)
              }}
              className=" w-full py-2 pr-2 text-right   bg-transparent outline-none text-xl text-white"
            />
            <span className="flex items-center  pr-5">BTC</span>
          </div>

          {selectlimitMarket === LimitMarketStatus.Limit && (
            <div className="bg-gray-500 flex flex-row text-xl  rounded-sm cursor-not-allowed">
              <span className="flex items-center pl-4 pr-5 ">Total</span>
              <div className="  w-full py-2 pr-2 text-right  ">
                {(
                  Number(inputSellAmountTokenLimitOrder) *
                  Number(inputSellPriceTokenLimitOrder)
                ).toFixed(4)}
              </div>
              <span className="flex items-center  pr-5">USDT</span>
            </div>
          )}

          <button
            onClick={() => {
              if (selectlimitMarket === LimitMarketStatus.Limit) {
                sendTxLimitOrder(
                  1,
                  inputSellAmountTokenLimitOrder!,
                  inputSellPriceTokenLimitOrder!
                )
              } else if (selectlimitMarket === LimitMarketStatus.Market) {
                sendTxMarketOrder(1, inputSellAmountTokenLimitOrder!)
              }
            }}
            className="w-full text-white rounded bg-red-500 py-3 font-semibold"
          >
            Sell BTC
          </button>
        </div>
      </div>
    </div>
  )
}

export default PanelCommand