import React, { useContext, useEffect } from 'react'
import router from 'next/router'
import { ContractContext } from '../context/ContratContext'
import {numberWithCommas} from '../utils/FormatNumberComma'
import { shortenAddress } from '../utils/shortenAddress'
import { simpleNotificationToast } from '../utils/notificationToastify'
import { ClipboardDocumentListIcon,ArrowTrendingUpIcon } from '@heroicons/react/24/solid'
import copy from 'copy-to-clipboard'  
type Props = {}

const markets = (props: Props) => {
  const { listPairOrder,isLoadingListFactoryPairAddress,loadListFactoryPairAddress } = useContext(ContractContext)
  useEffect(() => {
    loadListFactoryPairAddress()
  
    
  }, [])
  
  return (
    <div className="  flex flex-1 mt-[10vh]  items-center justify-center">
      <div className="flex flex-col space-y-5">
        <span className="text-4xl  ">Markets on Trustless</span>
        <span className="Buttonselect cursor-default py-2 max-w-fit">
          Mumbai
        </span>

        <div className="blue-glassmorphism text-xl">
          {/* border-radius: 16px; box-shadow: 0 4px 30px rgba(0, 0, 0, 1);
          backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px);
          border: 1px solid rgba(250, 250, 250, 0.3); */}
          <div
            className=" 
           border-b-[1px]   border-gray-600
           px-5 py-2  grid grid-cols-6 space-x-10 "
          >
            <div>#</div>
            <div className="col-span-2">Name</div>
            <div>Price</div>
            <div>Market Cap</div>
            <div> </div>
          </div>
          {isLoadingListFactoryPairAddress ? (
            <div className="flex justify-center items-center py-3 ">
              <div className="animate-spin rounded-full h-64 w-64 border-b-2 border-red-700" />
            </div>
          ) : (
            <>
              {listPairOrder.map((item, index) => (
                <div
                  className=" 
            rounded-t-none 
            px-5 py-5 grid grid-cols-6 hover:bg-black/20    space-x-10  max-h-[80vh] myscroll   items-center"
                >
                  <div>{index+1}</div>
                  <div className="col-span-2 flex flex-col">
                    <h1>
                      {item.symbolToken0}-{item.symbolToken1}
                    </h1>
                   
                       <span className='font-light text-xs text-gray-500 flex '>
                        {item.symbolToken0} : {shortenAddress(item.addressToken0) }  
                        <ClipboardDocumentListIcon 
                        onClick={()=>{
                          copy(item.addressToken0)
                          simpleNotificationToast('Copied to clipboard!')

                           
                        }}
                        className=" IconHover h-4 w-4" 
                        />
                       </span> 
                       <span className='font-light text-xs text-gray-500 flex'>
                        {item.symbolToken1} : {shortenAddress(item.addressToken1)}  
                         <ClipboardDocumentListIcon 
                        onClick={()=>{
                          copy(item.addressToken1)
                           simpleNotificationToast('Copied to clipboard!')
                    
                        }}
                        className=" IconHover h-4 w-4" 
                        />
                       </span> 
                      <span className='font-light text-xs text-gray-500 flex'>
                        Contract Pair : {shortenAddress(item.addressContractPair)} 
                          <ClipboardDocumentListIcon 
                        onClick={()=>{
                          copy(item.addressContractPair)
                           simpleNotificationToast('Copied to clipboard!')
      
                        }}
                        className=" IconHover h-4 w-4" 
                        />
                       </span> 
               
                  </div>
                  <div>{numberWithCommas(item.price)} {item.symbolToken1}</div>
                  <div> {numberWithCommas(Number(item.price)*Number(item.totalSuplly))} {item.symbolToken1}</div>
                  <div 
                  onClick={() => {
                    router.push(
                      `/trade/tradepair?contractaddress=${item.addressContractPair}&addresstoken0=${item.addressToken0}&addresstoken1=${item.addressToken1}`
                    )
                  }}
                  className=' flex justify-center'>
                    <ArrowTrendingUpIcon className=" IconHover h-8 w-8" />
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default markets

