import React, { useContext, useEffect, useState } from 'react'
import { ContractContext } from '../context/ContratContext'
import UpdateModal from '../components/Modal'
import { useAccount } from 'wagmi'
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'
import { TrashIcon } from '@heroicons/react/24/outline'
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
        loadOrderBookByAddress,
        historyOrderEvent
    } = useContext(ContractContext)

     useEffect(() => {
       const sorting = () => {
         historyOrderEvent.sort(function (a, b) {
           return b.Date - a.Date
         })
       }
       sorting()
     }, [historyOrderEvent])

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
          Open Order({orderBookByAddress.length})
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

      {selectShowOrder === ShowOrderStatus.OpenOrder ? (
        <>
          <div className=" text-xl grid grid-cols-9  border-b-2 border-gray-700 p-3">
            <div>Date</div>
            <div>Pair</div>
            <div>Type</div>
            <div>Side</div>
            <div>Price</div>
            <div>Amount</div>
            <div>Filled</div>
            <div>Total</div>
            <div>Cancel Order</div>
          </div>

          <div className="overflow-y-auto max-h-full">
            {orderBookByAddress.map((item) => (
              <div className=" grid grid-cols-9 text-xl border-b-2 border-gray-700  p-3">
                <div>{item.createdDate}</div>
                <div> BTC/USDT</div>
                <div>Limit</div>
                <div
                  className={`${
                    item.BuyOrSell === 0 ? 'text-green-500' : 'text-red-500'
                  }  `}
                >
                  {' '}
                  {item.BuyOrSell === 0 ? 'Buy' : 'Sell'}
                </div>
                <div className="flex flex-row">
                  {item.price}
                  <AdjustmentsHorizontalIcon
                    onClick={() => {
                      setIdUpdate(item.id)
                      setSideBuyOrSell(item.BuyOrSell)
                      setShowUpdateModal(true)
                    }}
                    className="h-8 w-8  hover:text-yellow-400 cursor-pointer"
                  />
                </div>
                <div className="flex flex-row">
                  {item.amount}
                  <AdjustmentsHorizontalIcon
                    onClick={() => {
                      setIdUpdate(item.id)
                      setSideBuyOrSell(item.BuyOrSell)
                      setShowUpdateModal(true)
                    }}
                    className="h-8 w-8  hover:text-yellow-400 cursor-pointer"
                  />
                </div>
                <div>{item.filled}</div>
                <div>{Number(item.price) * Number(item.amount)}</div>
                <TrashIcon
                  onClick={() => sendTxCancelOrder(item.BuyOrSell, item.id)}
                  className="h-8 w-8  hover:text-red-500 cursor-pointer"
                />
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className=" text-xl grid grid-cols-6  border-b-2 border-gray-700 p-3">
            <div>Date</div>
            <div>Pair</div>
            <div>Type</div>
            <div>Side</div>
            <div>Price</div>
            <div>Amount</div>
          </div>

          <div className="overflow-y-auto max-h-full">
            {historyOrderEvent.map((item) => (
              <div className=" grid grid-cols-6 text-xl border-b-2 border-gray-700  p-3">
                <div>{item.Date}</div>
                <div> BTC/USDT</div>
                <div>{item.Type}</div>
                <div
                  className={`${
                    item.Type === 'Market'
                      ? item.Side === 1
                        ? 'text-green-500'
                        : 'text-red-500'
                      : item.Side === 0
                      ? 'text-green-500'
                      : 'text-red-500'
                  } `}
                >
                  {item.Type === 'Market'
                    ? item.Side === 0
                      ? 'Sell'
                      : 'Buy'
                    : item.Side === 0
                    ? 'Buy'
                    : 'Sell'}
                </div>
                <div> {item.price === "0" ? 'Market' : item.price} </div>
                <div> {item.amount} </div>
              </div>
            ))}
          </div>
        </>
      )}

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