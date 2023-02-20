import React from 'react'
import router from 'next/router'
type Props = {}

const markets = (props: Props) => {
  return (
    <div className="  flex flex-1 mt-10 items-center justify-center">
      <div className="flex flex-col space-y-5">
        <span className="text-2xl font-bold ">Markets</span>
        <span className="Buttonselect cursor-default py-2 max-w-fit">
          Mumbai
        </span>
        <div className="border-[1px] bg-[#131a2a]  border-gray-600 rounded-2xl">
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
          <div
            onClick={() => {
//               router.push(
// 'trade/'
//               )
              router.push(
                '/trade/tradepair?contractaddress=0xe149bfba0656636301cfd1382d72744a2610d57e&addresstoken0=0x91DB63f4ABc6E441Da7cA5765b9d7Fe2A666B75F&addresstoken1=0x7052F109585F2851207dad06C2F5Ec7E26a1270B'
              )

            }}
            className=" 
           rounded-t-none 
          px-5 py-5 grid grid-cols-7 hover:bg-black/20 cursor-pointer   space-x-10  max-h-[80vh] myscroll"
          >
            <div>1</div>
            <div className="col-span-2">BTC-USD</div>
            <div>100</div>
            <div>-2.5%</div>
            <div>$1.2M</div>
            <div>$100M</div>
          </div>
          <div
            className=" 
           rounded-t-none 
          px-5 py-5 grid grid-cols-7 hover:bg-black/20 cursor-pointer    space-x-10  max-h-[80vh] myscroll"
          >
            <div>1</div>
            <div className="col-span-2">BTC-USD</div>
            <div>100</div>
            <div>-2.5%</div>
            <div>$1.2M</div>
            <div>$100M</div>
          </div>
          <div
            className=" 
           rounded-t-none 
          px-5 py-5 grid grid-cols-7 hover:bg-black/20  cursor-pointer   space-x-10  max-h-[80vh] myscroll"
          >
            <div>1</div>
            <div className="col-span-2">BTC-USD</div>
            <div>100</div>
            <div>-2.5%</div>
            <div>$1.2M</div>
            <div>$100M</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default markets

