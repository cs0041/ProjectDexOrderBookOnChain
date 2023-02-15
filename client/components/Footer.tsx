import React from 'react'

type Props = {}

function Footer({}: Props) {
  return (
    <div className='justify-between text-base font-light px-10 py-2 flex flex-row w-full border-gray-600 border-t-[1px]  h-12 items-center'>
        <div className='flex flex-row space-x-5'>
            <div className='text-green-400 animate-pulse pr-5 border-r border-gray-600 '>
                Online Now
            </div>
            <div className='hover:opacity-70 cursor-pointer'>
                Support
            </div>
            <div className='hover:opacity-70 cursor-pointer'>
                Contact us
            </div>
        </div>
         <div className='text-green-400 animate-pulse pl-10 border-l-2 border-gray-600'>
                POWERED BY 0xPascal
        </div>
    </div>
  )
}

export default Footer