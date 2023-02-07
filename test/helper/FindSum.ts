
import { ethers } from 'hardhat'
const toEther = (wei : string|number|ethers.BigNumber) => ethers.utils.formatEther(wei)
export function FindSum( listOrder: any[]): number {
  return listOrder.reduce((a, b) => Number(toEther(a)) + Number(toEther(b)), 0)
}


