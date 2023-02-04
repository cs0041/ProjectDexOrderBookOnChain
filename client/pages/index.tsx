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
import UpdateModal from '../components/Modal'
import Header from '../components/Header'
import OrderBook from '../components/OrderBook'
import PanelCommand from '../components/PanelCommand'
import TradingviewGraph from '../components/TradingviewGraph'
import History from '../components/History'
  
    
interface Inputs {
  data: number
}
// const wagmigotchiContract = {
//   address: contractFaucetAddress,
//   abi: contractFaucetABI,
// }

const Home = () => {
  const {

    balancesSpotToken0,
    balancesTradeToken0,
    balancesSpotToken1,
    balancesTradeToken1,
    isLoadingOrderBookByAddress,
    orderBookByAddress,
    loadOrderBookByAddress,
    sendTxCancelOrder,
  } = useContext(ContractContext)


  // for update modal
  const [sideBuyOrSell, setSideBuyOrSell] = useState<number>(-1)
  const [idUpdate, setIdUpdate] = useState<number>(-1)

  const mounted = useIsMounted()

  const [showUpdateModal, setShowUpdateModal] = useState(false)

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

        <Header />
        <section className="flex h-screen flex-col flex-1 ">
          <div className="flex flex-row h-4/6">
            <div className="w-2/12 min-w-fit ">
              <OrderBook />
            </div>
            <div className="w-10/12 border-x-2 border-gray-600 ">
              <div className=" h-[65%]">
                <TradingviewGraph />
              </div>
              <div className=" h-[35%]">
                <PanelCommand />
              </div>
            </div>
            <div className="w-2/12">Market Trades</div>
          </div>
          <div className="h-2/6 border-gray-600 border-t-2 ">
            <History />
          </div>
        </section>

        {address && <p>My address is {address}</p>}

        <div>
          <h1>OPEN ORDER</h1>
          {address
            ? isLoadingOrderBookByAddress
              ? 'Loading....... '
              : orderBookByAddress.map((item) => (
                  <div className="flex flex-row mb-5 space-x-5">
                    <p>{`${item.BuyOrSell == 0 ? 'Buy' : 'Sell'} - price : ${
                      item.price
                    } - amount :  ${item.amount} - filled :  ${
                      item.filled
                    } ---id : ${item.id}`}</p>
                    <button
                      onClick={() => sendTxCancelOrder(item.BuyOrSell, item.id)}
                      className=" text-white rounded bg-red-500 px-3 py-2 font-semibold"
                    >
                      cancel order
                    </button>
                    <button
                      onClick={() => {
                        setIdUpdate(item.id)
                        setSideBuyOrSell(item.BuyOrSell)
                        setShowUpdateModal(true)
                      }}
                      className=" text-white rounded bg-orange-500 px-3 py-2 font-semibold"
                    >
                      update order
                    </button>
                  </div>
                ))
            : 'PLS CONNECT WALLET'}

          <button
            onClick={() => {
              if (address) {
                loadOrderBookByAddress(address)
              } else {
                console.log('No address')
              }
            }}
            className="w-full text-white rounded bg-red-500 py-3 font-semibold"
          >
            Get Order By Address
          </button>
        </div>
        {showUpdateModal && (
          <UpdateModal
            id={idUpdate}
            side={sideBuyOrSell}
            onClose={() => setShowUpdateModal(false)}
          />
        )}
      </div>
    )
  )
}

export default Home
