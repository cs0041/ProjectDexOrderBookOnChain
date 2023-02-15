import React, { useContext, useState } from 'react'
import Header from '../components/Header'
import { ContractContext } from '../context/ContratContext'
import {ContractPairOrderAddress,ContractToken0Address,ContractToken1Address} from '../utils//Address'

type Props = {}

function deposit({}: Props) {
    
   const [amountInputDepositToken0, setAmountInputDepositToken0] = useState<string>()
   const [amountInputDepositToken1, setAmountInputDepositToken1] = useState<string>()
   const [amountInputWithdrawToken0, setAmountInputWithdrawToken0] = useState<string>()
   const [amountInputWithdrawToken1, setAmountInputWithdrawToken1] = useState<string>()
    const {
      balancesSpotToken0,
      balancesSpotToken1,
      balancesTradeToken0,
      balancesTradeToken1,
      sendTxDeposit,
      sendTxWithdraw
    } = useContext(ContractContext)
  return (
    <>
     <Header/>
    <div className="flex flex-col w-full p-20 space-y-10">
      <div className="flex flex-row justify-center space-x-10">
        <div className="bg-gray-700 w-fit p-10 rounded-lg flex flex-col border-2 border-gray-300">
          <h1 className="text-3xl text-center font-bold mb-10">Deposit</h1>
          <div className="flex flex-row space-x-10">
            <div className="  bg-black/50 p-10   rounded-md">
              <div className="space-y-4">
                <h1 className="text-center text-xl font-bold">Deposit BTC</h1>
                <div className="bg-gray-600 flex flex-row text-xl">
                  <span className="flex items-center pl-2 pr-5">Amount</span>
                  <input
                    type="number"
                    onKeyPress={(event) => {
                      if (!/^[0-9]*[.,]?[0-9]*$/.test(event.key)) {
                        event.preventDefault()
                      }
                    }}
                    onChange={(e) => {
                      setAmountInputDepositToken0(e.target.value)
                    }}
                    className="  w-full py-2 pr-2 text-right  bg-transparent outline-none  text-white"
                  />
                  <span className="flex items-center  pr-5">BTC</span>
                </div>
                <button
                  onClick={() => {
                    sendTxDeposit(amountInputDepositToken0!,ContractToken0Address)
                  }}
                  className="w-full text-white rounded bg-green-500 py-3 font-semibold"
                >
                  Deposit BTC
                </button>
              </div>
            </div>
            <div className="  bg-black/50 p-10 rounded-md">
              <div className="space-y-4">
                <h1 className="text-center text-xl font-bold">Deposit USDT</h1>
                <div className="bg-gray-600 flex flex-row text-xl">
                  <span className="flex items-center pl-2 pr-5">Amount</span>
                  <input
                    type="number"
                    onKeyPress={(event) => {
                      if (!/^[0-9]*[.,]?[0-9]*$/.test(event.key)) {
                        event.preventDefault()
                      }
                    }}
                    onChange={(e) => {
                      setAmountInputDepositToken1(e.target.value)
                    }}
                    className="  w-full py-2 pr-2 text-right  bg-transparent outline-none  text-white"
                  />
                  <span className="flex items-center  pr-5">USDT</span>
                </div>
                <button
                  onClick={() => {
                     sendTxDeposit(amountInputDepositToken1!,ContractToken1Address)
                  }}
                  className="w-full text-white rounded bg-green-500 py-3 font-semibold"
                >
                  Deposit USDT
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-700 w-fit p-10 rounded-lg flex flex-col border-2 border-gray-300">
          <h1 className="text-3xl text-center font-bold mb-10">Withdraw</h1>
          <div className="flex flex-row space-x-10">
            <div className="  bg-black/50 p-10   rounded-md">
              <div className="space-y-4">
                <h1 className="text-center text-xl font-bold">Withdraw BTC</h1>
                 <span className=" text-xl font-light">Avbl {balancesSpotToken0}</span>
                <div className="bg-gray-600 flex flex-row text-xl">
                  <span className="flex items-center pl-2 pr-5">Amount</span>
                  <input
                    type="number"
                    onKeyPress={(event) => {
                      if (!/^[0-9]*[.,]?[0-9]*$/.test(event.key)) {
                        event.preventDefault()
                      }
                    }}
                    onChange={(e) => {
                      setAmountInputWithdrawToken0(e.target.value)
                    }}
                    className="  w-full py-2 pr-2 text-right  bg-transparent outline-none  text-white"
                  />
                  <span className="flex items-center  pr-5">BTC</span>
                </div>
                <button
                  onClick={() => {
                     sendTxWithdraw(amountInputWithdrawToken0!,ContractToken0Address)
                  }}
                  className="w-full text-white rounded bg-red-500 py-3 font-semibold"
                >
                  Withdraw BTC
                </button>
              </div>
            </div>
            <div className="  bg-black/50 p-10 rounded-md">
              <div className="space-y-4">
                <h1 className="text-center text-xl font-bold">Withdraw USDT</h1>
                <span className=" text-xl font-light">Avbl {balancesSpotToken1}</span>
                <div className="bg-gray-600 flex flex-row text-xl">
                  <span className="flex items-center pl-2 pr-5">Amount</span>
                  <input
                    type="number"
                    onKeyPress={(event) => {
                      if (!/^[0-9]*[.,]?[0-9]*$/.test(event.key)) {
                        event.preventDefault()
                      }
                    }}
                    onChange={(e) => {
                      setAmountInputWithdrawToken1(e.target.value)
                    }}
                    className="  w-full py-2 pr-2 text-right  bg-transparent outline-none  text-white"
                  />
                  <span className="flex items-center  pr-5">USDT</span>
                </div>
                <button
                  onClick={() => {
                       sendTxWithdraw(amountInputWithdrawToken1!,ContractToken1Address)
                  }}
                  className="w-full text-white rounded bg-red-500 py-3 font-semibold"
                >
                  Withdraw USDT
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center text-3xl">
        <div className="bg-gray-700 w-fit justify-center p-10 rounded-lg flex flex-col border-2 border-gray-300">
          <h1 className="text-center font-semibold m-5">Dashboard blacness</h1>
          <div className="flex flex-row space-x-10 font-extralight">
            <div className="flex flex-col text-green-500">
              <h1 className='flex flex-col'>
                Balances Spot <span className='text-lg text-white'>( available for withdrawal )</span>
              </h1>
              <span>Amount BTC : {balancesSpotToken0}</span>
              <span>Amount USDT : {balancesSpotToken1}</span>
            </div>
            <div className="flex flex-col text-red-500">
               <h1 className='flex flex-col'>
                Balances Trade <span className='text-lg text-white'>( no available for withdrawal )</span>
              </h1>
              <span>Amount BTC : {balancesTradeToken0}</span>
              <span>Amount USDT : {balancesTradeToken1}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default deposit
