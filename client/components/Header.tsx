import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'
import React from 'react'

type Props = {}

function Header({}: Props) {
    return (
      <div className="flex flex-row   items-center justify-between  bg-black/80 px-20 py-6 space-x-10">
        <h1 className="text-2xl font-semibold">Trust Less Protocol</h1>

        <form className="flex items-center w-1/3">
          <input
            type="text"
            // onKeyPress={(event) => {
            //   if (!/^[0-9]*[.,]?[0-9]*$/.test(event.key)) {
            //     event.preventDefault()
            //   }
            // }}
            onChange={(e) => {}}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full pl-10 p-2.5  "
            placeholder="Search"
            required
          />

          <button
            type="submit"
            onClick={(e) => {
              e.preventDefault()
            }}
            className="p-2.5 ml-2 text-sm font-medium text-white bg-red-700 rounded-lg border border-red-700 hover:bg-red-800 "
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
            <span className="sr-only">Search</span>
          </button>
        </form>

        <div className='flex flex-row items-center space-x-10'>
          <Link href="/deposit">
            <h1 className="text-xl font-bold  hover:text-yellow-400 cursor-pointer ">Deposit</h1>
          </Link>
          <ConnectButton
            label="connect web3"
            accountStatus={'full'}
            chainStatus={'full'}
          />
        </div>
      </div>
    )
}

export default Header