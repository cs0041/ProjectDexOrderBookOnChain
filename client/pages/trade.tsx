import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
type Props = {}

function index({}: Props) {
  const router = useRouter()
  useEffect(() => {
    router.push(
      '/tradepair?contractaddress=0xb34Cf1d0455b9070668c0292082CC4Ea03236248&addresstoken0=0x91DB63f4ABc6E441Da7cA5765b9d7Fe2A666B75F&addresstoken1=0x7052F109585F2851207dad06C2F5Ec7E26a1270B'
    )
  })
}

export default index
