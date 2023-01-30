import { ConnectButton } from '@rainbow-me/rainbowkit'
import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useAccount, useSigner } from 'wagmi'
import useIsMounted from '../hooks/useIsMounted'
import { polygonMumbai } from 'wagmi/chains'
import { ethers } from 'ethers'
import Loader from '../components/Loader'
// import { contractFaucetABI, contractFaucetAddress } from '../utils/FaucetABI'

import { useContractRead } from 'wagmi'
import { useContext, useEffect, useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import artifact from '../../artifacts/contracts/PairOrder.sol/PairNewOrder.json'
import {PairNewOrder,PairNewOrder__factory,Token0,Token0__factory,Token1,Token1__factory} from '../../typechain-types'
import {ContractContext} from '../context/ContratContext'

  
    
interface Inputs {
  data: number
}
// const wagmigotchiContract = {
//   address: contractFaucetAddress,
//   abi: contractFaucetABI,
// }

const Home = () => {
  const {
    loadOrderBook,
    loadingOrderBuy,
    loadingOrderSell,
    orderBookBuy,
    orderBookSell,
    priceToken,
    sendTxMarketOrder,
    balancesSpotToken0,
    balancesTradeToken0,
    balancesSpotToken1,
    balancesTradeToken1,
    sendTxLimitOrder,
  } = useContext(ContractContext)


  const [inputBuyToken, setInputBuyToken] = useState<string>()
  const [inputSellToken, setInputSellToken] = useState<string>()

  const [inputBuyPriceTokenLimitOrder, setInputBuyPriceTokenLimitOrder] = useState<string>()
  const [inputBuyAmountTokenLimitOrder, setInputBuyAmountTokenLimitOrder] = useState<string>()

  const [inputSellPriceTokenLimitOrder, setInputSellPriceTokenLimitOrder] = useState<string>()
  const [inputSellAmountTokenLimitOrder, setInputSellAmountTokenLimitOrder] = useState<string>()

  const mounted = useIsMounted()

  const { address, isConnected } = useAccount()
  const { data: signer } = useSigner({
    chainId: polygonMumbai.id,
  })

  return (
    mounted && (
      <div>
        <ConnectButton
          label="connect web3"
          accountStatus={'full'}
          chainStatus={'full'}
        />

        {address && <p>My address is {address}</p>}

        <span>Price</span>
        <p>{priceToken ? priceToken : 'wait Price ...'}</p>

        <div className="text-red-500 text-3xl">
          <p>Sell</p>
          <p>
            {loadingOrderSell
              ? 'Load...'
              : orderBookSell
                  .slice(0)
                  .reverse()
                  .map((item) => (
                    <p>{` ${item.price} - ${item.amount - item.filled}`}</p>
                  ))}
          </p>
        </div>
        <div className="text-green-500 text-3xl">
          <p>Buy</p>
          <p>
            {loadingOrderBuy
              ? 'Load...'
              : orderBookBuy?.map((item) => (
                  <p>{` ${item.price} - ${item.amount - item.filled}`}</p>
                ))}
          </p>
          <button
            className="text-black rounded-lg bg-red-500 p-2 px-8"
            onClick={loadOrderBook}
          >
            GetDataOrder
          </button>
        </div>

        <h1 className="text-4xl mt-10">Market Order</h1>

        <div className="mt-10 flex-row flex space-x-10 justify-center">
          <div className="max-w-[800px] min-w-[400px] space-y-8 rounded bg-black/40 py-10 px-6 ">
            <div className="bg-black/40 flex flex-row text-xl">
              <span className="flex items-center pl-2 pr-5">Total</span>
              <input
                type="number"
                onKeyPress={(event) => {
                  if (!/^[0-9]*[.,]?[0-9]*$/.test(event.key)) {
                    event.preventDefault()
                  }
                }}
                onChange={(e) => {
                  setInputBuyToken(e.target.value)
                }}
                className="  w-full py-2 pr-2 text-right  bg-transparent outline-none  text-white"
              />
              <span className="flex items-center  pr-5">USDT</span>
            </div>
            <button
              onClick={() => {
                sendTxMarketOrder(0, inputBuyToken!)
              }}
              className="w-full text-white rounded bg-green-500 py-3 font-semibold"
            >
              Buy BTC
            </button>
          </div>

          <div className="max-w-[800px] min-w-[400px]  space-y-8 rounded bg-black/40 py-10 px-6 ">
            <div className="bg-black/40 flex flex-row text-xl">
              <span className="flex items-center pl-2 pr-5">Amount</span>
              <input
                type="number"
                required
                onKeyPress={(event) => {
                  if (!/^[0-9]*[.,]?[0-9]*$/.test(event.key)) {
                    event.preventDefault()
                  }
                }}
                onChange={(e) => {
                  setInputSellToken(e.target.value)
                }}
                className=" w-full py-2 pr-2 text-right   bg-transparent outline-none text-xl text-white"
              />
              <span className="flex items-center  pr-5">BTC</span>
            </div>
            <button
              onClick={() => {
                sendTxMarketOrder(1, inputSellToken!)
              }}
              className="w-full text-white rounded bg-red-500 py-3 font-semibold"
            >
              Sell BTC
            </button>
          </div>
        </div>


        <h1 className="text-4xl mt-10">Limit Order</h1>

        <div className="mt-10 flex-row flex space-x-10 justify-center">
          <div className="max-w-[800px] min-w-[400px] space-y-8 rounded bg-black/40 py-10 px-6 ">
            <div className="bg-black/40 flex flex-row text-xl">

              <span className="flex items-center pl-2 pr-5">Price</span>
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

            <div className="bg-black/40 flex flex-row text-xl">
              <span className="flex items-center pl-2 pr-5">Amount</span>
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
                className="  w-full py-2 pr-2 text-right  bg-transparent outline-none  text-white"
              />
              <span className="flex items-center  pr-5">BTC</span>
            </div>
            <button
              onClick={() => {
                 sendTxLimitOrder(0,inputBuyAmountTokenLimitOrder!,inputBuyPriceTokenLimitOrder!)
              }}
              className="w-full text-white rounded bg-green-500 py-3 font-semibold"
            >
              Buy BTC
            </button>
          </div>

          <div className="max-w-[800px] min-w-[400px]  space-y-8 rounded bg-black/40 py-10 px-6 ">
            <div className="bg-black/40 flex flex-row text-xl">
              <span className="flex items-center pl-2 pr-5">Price</span>
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
            <div className="bg-black/40 flex flex-row text-xl">
              <span className="flex items-center pl-2 pr-5">Amount</span>
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
            <button
              onClick={() => {
                sendTxLimitOrder(1, inputSellAmountTokenLimitOrder!,inputSellPriceTokenLimitOrder!)
              }}
              className="w-full text-white rounded bg-red-500 py-3 font-semibold"
            >
              Sell BTC
            </button>
          </div>
        </div>





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
        </div>
      </div>
    )
  )
}

export default Home
