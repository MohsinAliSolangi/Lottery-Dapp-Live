import { ethers } from "ethers";
import React, { useState, useEffect, createContext } from "react";

import { lotteryAbi, contractAddress } from "./utils/constants";

export const LotteryContext = createContext();

const { ethereum } = window;

export const getLotteryContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const LotteryContract = new ethers.Contract(contractAddress, lotteryAbi, signer);
    return LotteryContract;

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
        checkWalletIsConnected();
        updateState();
    }, [])

    ethereum.on("accountsChanged", async(account) => {
        setCurrentAccount(account[0]);
    })


    const updateState = () => {
        if (getLotteryContract()) getPot();
        if (getLotteryContract()) getPlayers();
        if (getLotteryContract()) getLotteryId();
        if (getLotteryContract()) getResult();

    }


    const checkWalletIsConnected = async () => {
        try {
            if (!ethereum) return alert("Please Install Metamask");
            const accounts = await ethereum.request({ method: "eth_accounts" });
            if (accounts.length) {
                setCurrentAccount(accounts[0]);

            } else {
                console.log("No account found")
            }
      
        } catch (err) {
            setError(err.message);
            throw new Error("No ethereum object.")
        }
    }


    const connectWallet = async () => {
        setError("")
        try {
            setLoading(true)
            if (!ethereum) return alert("Please Install Metamask");
            const accounts = await ethereum.request({ method: "eth_requestAccounts" })
            setCurrentAccount(accounts[0]);
            window.location.reload();
            setLoading(false)

        } 
        
        catch (err) {
            setLoading(false)
            setError(err.message);
            throw new Error("No ethereum object.")
        }
    }


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

    const reload = () => {
        window.location.reload()
    }

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


