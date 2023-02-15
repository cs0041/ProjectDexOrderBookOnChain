import { ConnectButton } from '@rainbow-me/rainbowkit'
import type { GetServerSideProps, NextPage } from 'next'
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
import HeaderData from '../components/HeaderData'
import OrderBook from '../components/OrderBook'
import PanelCommand from '../components/PanelCommand'
import TradingviewGraph from '../components/TradingviewGraph'
import History from '../components/History'
import HistoryMarket from '../components/HistoryMarket'
import { GetMarketOrder } from '../utils/GetMarketOrder'
import Header from '../components/Header'
import Footer from '../components/Footer'
  
    
// interface Props {
//    MarketOrder:EventMarketOrder[]
// }

// const wagmigotchiContract = {
//   address: contractFaucetAddress,
//   abi: contractFaucetABI,
// }

const Home = () => {


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
        <Header />
        <HeaderData />
        <section className="flex h-screen flex-col flex-1 ">
          <div className="flex flex-row h-4/6">
            <div className="w-2/12 min-w-fit ">
              <OrderBook />
            </div>
            <div className="w-10/12 border-x-2 border-gray-600 ">
              <div className=" h-[65%]">
                <TradingviewGraph />
              </div>
              <div className=" h-[35%] ">
                <PanelCommand />
              </div>
            </div>
            <div className="w-2/12  min-w-fit ">
              <HistoryMarket />
            </div>
          </div>
          <div className="h-2/6 border-gray-600 border-t-2 max-h-fit">
            <History />
          </div>
        </section>
        {/* {address && <p>My address is {address}</p>} */}
        <Footer/>
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

// Backend Code
// export const getServerSideProps: GetServerSideProps<Props> = async () => {
//   const [
//     MarketOrder,
//   ] = await Promise.all([
//     GetMarketOrder()
//   ])

//   return {
//     props: {
//       MarketOrder
//     },
//   }
// }
