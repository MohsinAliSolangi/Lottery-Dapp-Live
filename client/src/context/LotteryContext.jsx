import { ethers } from "ethers";
import React, { useState, useEffect, createContext } from "react";
import { lotteryAbi, contractAddress } from "./utils/constants";

export const LotteryContext = createContext();

const { ethereum } = window;

export const getLotteryContract = () => {
    if(typeof window.ethereum !== "undefined"){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const LotteryContract = new ethers.Contract(contractAddress, lotteryAbi, signer);
        return LotteryContract;
    }
    else {
        const providers = process.env.REACT_APP_RPCADDRESS;
        const provider = new ethers.providers.JsonRpcProvider(providers);
        const LotteryContract = new ethers.Contract(contractAddress, lotteryAbi, provider);
        return LotteryContract;
    }
}

export const LotteryProvider = ({ children }) => {

    const [currentAccount, setCurrentAccount] = useState();
    const [lotteryPot, setLotteryPot] = useState();
    const [lotteryPlayers, setLotteryPlayers] = useState([]);
    const [lotteryHistory, setLotteryHistory] = useState([]);
    const [lotteryId,setLotteryId] = useState();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [result,setresult] = useState();



    useEffect(() => {
        checkIsWalletConnected();
        updateState();
        getLotteryContract()
    }, [])



    const updateState = () => {
        // if (loading){
            console.log("this is useEffect")
            getPot();
            getPlayers();
            getLotteryId();
            getResult();
        // } 
    }


    const connectWallet = async () => {
        const isMobile =
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
          );
    
        // Check if MetaMask is installed
        if (typeof window.ethereum !== "undefined") {
          try {
            // Check if the wallet is already connected
            if (!isMobile && !loading) {
              await ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [
                  {
                    chainId: process.env.CHAIN_ID, // Replace with your desired chain ID
                  },
                ],
              });
    
              const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
              });
    
              setCurrentAccount(accounts[0]);
              setLoading(true);
            } else if (isMobile) {
              const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
              });
              setCurrentAccount(accounts[0]);
              setLoading(true);
            }
          } catch (err) {
            setLoading(false);
            // toast.error(err.message);
            console.error(err.message);
          }
        } else {
          if (isMobile) {
            // Metamask app is not installed, redirect to installation page
            window.open(
              "https://metamask.app.link/dapp/https://staking-dapp-project.vercel.app/"
            );
            return;
          } else {
            // if no window.ethereum and no window.web3, then MetaMask or Trust Wallet is not installed
            alert(
              "MetaMask or Trust Wallet is not installed. Please consider installing one of them."
            );
            return;
          }
        }
      };
    
      const checkIsWalletConnected = async () => {
        try {
            
          window.ethereum.on("accountsChanged", async function (accounts) {
            setCurrentAccount(accounts[0]);
            setLoading(true);
          });
          window.ethereum.on("chainChanged", async (chainId) => {
            if (chainId != process.env.REACT_APP_CHAIN_ID) {
              await ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [
                  {
                    // chainId: "0x5" //Goerli
                    // chainId: "0x89", //PolygonMainnet
                    // chainId: "0xaa36a7", //sepolia
                    // chainId: "0x1", //Miannet
                    chainId: process.env.REACT_APP_CHAIN_ID, //localHost TODO
                    // chainId:"0x13881" //mumbai
                    // chainId:"0x61"//bnb
                  },
                ],
              });
            }
          });
          const accounts = await ethereum.request({ method: "eth_accounts" });
          if (accounts.length) {
            setCurrentAccount(accounts[0]);
            setLoading(true);
          } else {
            console.log("No account Found");
            setLoading(false);
          }
        } catch (err) {
          console.log(err.message);
          setLoading(false);
        }
      };


    const getPot = async () => {
        const pot = await getLotteryContract().getBalance();
        setLotteryPot(ethers.utils.formatEther(pot));
        
    }

    const getPlayers = async () => {
        const players = await getLotteryContract().getparticipants()
        setLotteryPlayers(players);
    }

    const enterLottery = async () => {
        
        setError("")
        try {
            setLoading(true)    
          const res =  await getLotteryContract().participant({
                from: currentAccount,
                value: '6',
                gasLimit: 3000000,
                gasPrice: null

        })
        await res.wait()
        window.location.reload()
        setLoading(false)

        } catch (err) {
        setLoading(false)
            setError(err.message);
        }

    }

    // const reload = () => {
    //     window.location.reload()
    // }

    const pickWinner =  async() => {

       setError('')
       setSuccess('')
        try{
        setLoading(true)
           const res =  await getLotteryContract().openLottery({
                from: currentAccount,
                gasLimit: 3000000,
                gasPrice: null
            })
            await res.wait()
        setLoading(false)
        }catch(err){
        setLoading(false)
            setError(err.message);
        }
    }
    
    const getLotteryId = async() => {
        const id = await getLotteryContract().result()
       if(id.toString() !== "0"){
        setLotteryId(parseInt(id));
        await getLotteryHistory(parseInt(id))
    }
    }

    const getLotteryHistory = async(id) => {
        const winnerAddress = await getLotteryContract().participants(id);
        const historyObj = {};
        historyObj.id = id;
        historyObj.address = winnerAddress;
        setLotteryHistory(lotteryHistory => [...lotteryHistory,historyObj]);
    }
    
    const sendToWinner =  async() => {

        setError('')
        setSuccess('')
         try{
         setLoading(true)
            const res =  await getLotteryContract().sendToWinner({
                 from: currentAccount,
                 gasLimit: 3000000,
                 gasPrice: null
             })
             await res.wait()
         setLoading(false)
         }catch(err){
         setLoading(false)
             setError(err.message);
         }
     }

     const getResult = async () => {
        const res = await getLotteryContract().result();
        setresult(res);
    }

    return (
        <LotteryContext.Provider value={{ connectWallet, currentAccount, lotteryPot, lotteryPlayers, enterLottery,error,success,pickWinner,lotteryHistory,lotteryId,loading,sendToWinner,result}}>
            {children}
        </LotteryContext.Provider>
    )
    }


