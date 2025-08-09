import {createWalletClient, custom, createPublicClient, parseEther, defineChain, formatEther } from "https://esm.sh/viem"
import { contractAddress, abi } from "./constants-js.js"    

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const ethAmountInput = document.getElementById("ethAmount")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton");
const checkFundedButton = document.getElementById("checkFundedButton")
const fundedAddressInput = document.getElementById("fundedAddress")

let walletClient
let publicClient

async function connect()
{   
    
    if (typeof window.ethereum !== "undefined")
    {
        walletClient = createWalletClient({ transport: custom(window.ethereum)})
        await walletClient.requestAddresses()
        connectButton.innerHTML = "Connected"
    }
    else 
    {
        connectButton.innerHTML = "Please install MetaMask!"
    }

}

async function fund()
{
    const ethAmount = ethAmountInput.value 
    console.log(`Funding with ${ethAmount}...`)

    if (typeof window.ethereum !== "undefined")
    {
        walletClient = createWalletClient({ transport: custom(window.ethereum)})
        const[connectedAccount] = await walletClient.requestAddresses()
        const currentChain = await getCurrentChain(walletClient)

        publicClient = createPublicClient({ transport: custom(window.ethereum)})
        
        const { request } = await publicClient.simulateContract({ 
            address: contractAddress,
            abi: abi, 
            functionName: "fund",
            account: connectedAccount,
            chain: currentChain,
            value: parseEther(ethAmount)
        })
        
        const hash = await walletClient.writeContract(request)
        console.log(hash)

    }
    else 
    {
        connectButton.innerHTML = "Please install MetaMask!"
    }

}

async function withdraw() {
  console.log(`Withdrawing...`)

  if (typeof window.ethereum !== "undefined") 
    {
    try 
    {
      walletClient = createWalletClient({
        transport: custom(window.ethereum),
      })
      publicClient = createPublicClient({
        transport: custom(window.ethereum),
      })
      const [account] = await walletClient.requestAddresses()
      const currentChain = await getCurrentChain(walletClient)

      console.log("Processing transaction...")
      const { request } = await publicClient.simulateContract({
        account: account,
        address: contractAddress,
        abi: abi,
        functionName: "withdraw",
        chain: currentChain,
      })
      const hash = await walletClient.writeContract(request)
      console.log("Transaction processed: ", hash)
    } catch (error) {
      console.log(error)
    }
  } 
  else 
  {
    withdrawButton.innerHTML = "Please install MetaMask"
  }
}

async function getCurrentChain(client) {
  const chainId = await client.getChainId()
  const currentChain = defineChain({
    id: chainId,
    name: "Custom Chain",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ["http://localhost:8545"],
      },
    },
  })
  return currentChain
}

async function getbalance()
{
    if (typeof window.ethereum !== "undefined")
    {
        publicClient = createPublicClient({ transport: custom(window.ethereum)})
        await walletClient.requestAddresses()
    }
    const balance = await publicClient.getBalance({
        address: contractAddress
    })
    console.log(formatEther(balance))
}

async function checkFundedAmount() {
    const address = fundedAddressInput.value
    if (!address) {
        console.log("Please enter an address")
        return
    }
    if (typeof window.ethereum !== "undefined") {
        publicClient = createPublicClient({ transport: custom(window.ethereum) })
        try {
            const amount = await publicClient.readContract({
                address: contractAddress,
                abi: abi,
                functionName: "getAddressToAmountFunded",
                args: [address],
            })
            console.log(`Amount funded by ${address}:`, formatEther(amount))
        } catch (error) {
            console.error("Error reading funded amount:", error)
        }
    } else {
        checkFundedButton.innerHTML = "Please install MetaMask"
    }
}



connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getbalance
withdrawButton.onclick = withdraw
checkFundedButton.onclick = checkFundedAmount
