import React, { useContext } from 'react'
import router from 'next/router'
import { ContractContext } from '../context/ContratContext'
type Props = {}

const markets = (props: Props) => {
  const { listPairOrder } = useContext(ContractContext)
  return (
    <div className="  flex flex-1 mt-[10vh]  items-center justify-center">
      <div className="flex flex-col space-y-5">
        <span className="text-2xl font-bold ">Markets</span>
        <span className="Buttonselect cursor-default py-2 max-w-fit">
          Mumbai
        </span>
        <div className="blue-glassmorphism">
          {/* border-radius: 16px; box-shadow: 0 4px 30px rgba(0, 0, 0, 1);
          backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px);
          border: 1px solid rgba(250, 250, 250, 0.3); */}
          <div
            className=" 
           border-b-[1px]   border-gray-600
           px-5 py-2  grid grid-cols-7 space-x-10 "
          >
            <div>#</div>
            <div className="col-span-2">Name</div>
            <div>Price</div>
            <div>Change</div>
            <div>Volume</div>
            <div>Market Cap</div>
          </div>
          {listPairOrder.map((item, index) => (
            <div
              onClick={() => {
                router.push(
                  `/trade/tradepair?contractaddress=${item.addressContractPair}&addresstoken0=${item.addressToken0}&addresstoken1=${item.addressToken1}`
                )
              }}
              className=" 
            rounded-t-none 
            px-5 py-5 grid grid-cols-7 hover:bg-black/20 cursor-pointer   space-x-10  max-h-[80vh] myscroll"
            >
              <div>{index}</div>
              <div className="col-span-2">
                {item.symbolToken0}-{item.symbolToken1}
              </div>
              <div>{item.price}</div>
              <div>-2.5%</div>
              <div>$1.2M</div>
              <div>$100M</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default markets

