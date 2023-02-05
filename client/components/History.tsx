import React, { useContext, useState } from 'react'
import { ContractContext } from '../context/ContratContext'
import UpdateModal from '../components/Modal'
import { useAccount } from 'wagmi'
type Props = {}

enum ShowOrderStatus {
  OpenOrder,
  OrderHistory,
}

const History = (props: Props) => {

    const { address, isConnected } = useAccount()

    const { 
        isLoadingOrderBookByAddress,
        orderBookByAddress,
        sendTxCancelOrder,
        loadOrderBookByAddress
    } = useContext(ContractContext)

    // for update modal
    const [sideBuyOrSell, setSideBuyOrSell] = useState<number>(-1)
    const [idUpdate, setIdUpdate] = useState<number>(-1)
    const [showUpdateModal, setShowUpdateModal] = useState(false)


    const [selectShowOrder, setSelectShowOrder] = useState<ShowOrderStatus>(ShowOrderStatus.OpenOrder)
  return (
    <div className="p-5  h-full ">
      <div className="space-x-5 mb-5">
        <button
          onClick={() => setSelectShowOrder(ShowOrderStatus.OpenOrder)}
          className={`${
            selectShowOrder === ShowOrderStatus.OpenOrder && 'text-yellow-300'
          } HeadSelectTypeOrder`}
        >
          Open Order(0)
        </button>
        <button
          onClick={() => setSelectShowOrder(ShowOrderStatus.OrderHistory)}
          className={`${
            selectShowOrder === ShowOrderStatus.OrderHistory &&
            'text-yellow-300'
          } HeadSelectTypeOrder`}
        >
          Order History
        </button>

          <button
            onClick={() => {
                 if (address) {
                   loadOrderBookByAddress(address)
                 } else {
                   console.log('No address')
                 }
            }}
            className=" text-white rounded bg-purple-500 p-3 font-semibold"
          >
            Get Order By Address
          </button>
      </div>
      <div className=" text-xl grid grid-cols-10  border-b-2 border-gray-700 pb-5 mb-5">
        <div>Date</div>
        <div>Pair</div>
        <div >Type</div>
        <div>Side</div>
        <div>Price</div>
        <div>Amount</div>
        <div>Filled</div>
        <div>Total</div>
        <div>Update Order</div>
        <div>Cancel Order</div>
      </div>

        <div className='overflow-y-auto max-h-full'>
                {orderBookByAddress.map((item) => (
                    <div className=" grid grid-cols-10 text-xl border-b-2 border-gray-700  mb-5 ">
                        <div >{item.createdDate}</div>
                        <div> BTC/USDT</div>
                        <div >Limit</div>
                        <div className={`${item.BuyOrSell === 0? "text-green-500":"text-red-500" }  `}> {item.BuyOrSell === 0 ? 'Buy' : 'Sell'}</div>
                        <div>{item.price}</div>
                        <div>{item.amount}</div>
                        <div>{item.filled}</div>
                        <div>{item.price * item.amount}</div>
                         <button
                      onClick={() => sendTxCancelOrder(item.BuyOrSell, item.id)}
                      className=" text-white w-1/2 rounded bg-red-500 px-3 py-2 font-semibold"
                    >
                      cancel order
                    </button>
                    <button
                      onClick={() => {
                        setIdUpdate(item.id)
                        setSideBuyOrSell(item.BuyOrSell)
                        setShowUpdateModal(true)
                      }}
                      className=" text-white w-1/2  rounded bg-orange-500 px-3 py-2 font-semibold"
                    >
                      update order
                    </button>

                    </div>
                ))}
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
}

export default History