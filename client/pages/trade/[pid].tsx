import { useAccount, useSigner } from 'wagmi'
import useIsMounted from '../../hooks/useIsMounted'
import { polygonMumbai } from 'wagmi/chains'
// import { contractFaucetABI, contractFaucetAddress } from '../utils/FaucetABI'

import { useContext, useEffect, useState } from 'react'
import { ContractContext } from '../../context/ContratContext'
import UpdateModal from '../../components/Modal'
import HeaderData from '../../components/HeaderData'
import OrderBook from '../../components/OrderBook'
import PanelCommand from '../../components/PanelCommand'
import TradingviewGraph from '../../components/TradingviewGraph'
import History from '../../components/History'
import HistoryMarket from '../../components/HistoryMarket'
import NotificationModal from '../../components/NotificationModal'
import { GetServerSideProps, NextPageContext } from 'next'
import { ParsedUrlQuery } from 'querystring'

interface Props {
  query: ParsedUrlQuery
}


// const wagmigotchiContract = {
//   address: contractFaucetAddress,
//   abi: contractFaucetABI,
// }

const Home = ({ query }: Props) => {
  const { pid, contractaddress, addresstoken0, addresstoken1 } = query 

  // for update modal
  const [sideBuyOrSell, setSideBuyOrSell] = useState<number>(-1)
  const [idUpdate, setIdUpdate] = useState<number>(-1)

  const mounted = useIsMounted()

  const [showUpdateModal, setShowUpdateModal] = useState(false)

  const { address, isConnected } = useAccount()
  const { data: signer } = useSigner({
    chainId: polygonMumbai.id,
  })
  const {
    notification,
    txNotification,
    setNotification,
    setContractPairOrderAddress,
    setContractToken0Address,
    setContractToken1Address,
  } = useContext(ContractContext)

  useEffect(() => {
    console.log('query', query)
    setContractPairOrderAddress(contractaddress as string)
    setContractToken0Address(addresstoken0 as string)
    setContractToken1Address(addresstoken1 as string)
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log('notification close')
      setNotification(false)
    }, 5000)

    return () => clearTimeout(timeout)
  }, [notification])

  return (
    mounted && (
      <div className=" relative ">
        <div className="border-b-[1px]  border-gray-600 ">
          <HeaderData />
        </div>
        <section className="  max-h-[1000px] min-h-[82vh]  ">
          <div className="flex flex-row ">
            <div className=" w-2/12 max-h-[1000px] min-h-[82vh]  min-w-fit border-r-[1px] border-gray-600 ">
              <OrderBook />
            </div>
            <div className="w-10/12 ">
              <div className=" h-[654px] border-b-[1px] border-gray-600 max-w-[0px] min-w-full ">
                <TradingviewGraph />
              </div>
              <div className="  min-h-[30vh]   ">
                <PanelCommand />
              </div>
            </div>
            <div className=" w-2/12 max-h-[1000px] min-h-[82vh]  min-w-fit border-l-[1px] border-gray-600 ">
              <HistoryMarket />
            </div>
          </div>
        </section>
        <div className="h-[30vh] w-full  border-gray-600 border-t-[1px]">
          <History />
        </div>
        <div className="h-[8vh] "></div>
        {/* {address && <p>My address is {address}</p>} */}

        {showUpdateModal && (
          <UpdateModal
            id={idUpdate}
            side={sideBuyOrSell}
            onClose={() => setShowUpdateModal(false)}
          />
        )}

        {notification && (
          <NotificationModal
            onClose={() => setNotification(false)}
            txNotification={txNotification}
          />
        )}
      </div>
    )
  )
}

export default Home

export const getServerSideProps = async (context: NextPageContext) => {
  const { query } = context
  return { props: { query } }
}
