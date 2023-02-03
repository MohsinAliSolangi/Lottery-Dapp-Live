import './App.css';
import "bulma/css/bulma.css";
import { useContext } from 'react';
import {LotteryContext} from './context/LotteryContext';
import image from './context/utils/logo192.png';
function App() {
  const {connectWallet,lotteryPot,lotteryPlayers,enterLottery,error,success,pickWinner,currentAccount,lotteryHistory,lotteryId,loading,sendToWinner,result} = useContext(LotteryContext);
  const owner = "0xd7A268E4C13487A15a5ded637B3e9FD6b9F81e99" 
  return (
    <div className="App">
    
     <div className='main'>
       <nav className='navbar mt-4 mb-4'>
         <div className='container'>
           <div className='navbar-brand'>
            <div>
              {/* <img src={require('../public/logo192.png').default} /> */}
              <img src={image} height={60} width={80} />
            </div>
             <h1 > Welcome To LotteryV2 </h1>
           </div>
            
           <div className='navbar-end'>
        {currentAccount ? 
         <button className='button is-link'>{`${currentAccount.slice(0,5)}...${currentAccount.slice(currentAccount.length - 4)}`}</button>
         :
         <button className='button is-link' onClick={connectWallet} disabled= {loading}>Connect Wallet</button>
     
      }
           </div>
         </div>
       </nav>
       <div className='container'>
         <section className='mt-5'>
           <div className='columns'>

           <div className='column is-two-third'>
          <section className='mt-5'>
            <p>Enter in the Lottery by sending 6 Wei </p>
            <button className='button is-link is-large is-light mt-3' onClick={enterLottery} disabled={loading}>Participant</button>
          </section>
          {currentAccount?.toLowerCase() == owner.toLowerCase()
            ?
            <section className='mt-6'>
            <p><b>Admin only : </b>OpenLottery</p>
            <button className='button is-primary is-large is-light mt-3' onClick={pickWinner} disabled={lotteryPlayers.length <10 || loading}> OpenLottery </button>
          </section >
          :
          ""
          }
       {currentAccount?.toLowerCase() == owner.toLowerCase()
            ?
            <section className = 'mt-6'>
            <p><b>Admin only : </b>sendToWinner</p>
           <button className='button is-primary is-large is-light mt-3' onClick={sendToWinner} disabled={result == 0 || loading}> sendAmountToWinner</button>
          </section>
          :
          ""
          }
         
         
          <section>
                  <div className="container has-text-danger mt-6">
                    <p>{error}</p>
                  </div>
                </section>
                <section>
                  <div className="container has-text-success mt-6">
                    {lotteryHistory.slice(0,2).map((item,index)=>{
                      if(item.address != "0x0000000000000000000000000000000000000000") {
                        return (
                         <p>The latest lottery winner is {`${item.address.slice(0,5)}....${item.address.slice(item.address.length - 4)}`}</p> 
                        )
                      }
                    })}
                  </div>
                </section>
           </div>
           <div className='column is-two-third'>
            <img src={image}/>
           </div>
           <div className='column is-one-third'>
            <section className='mt-5'>
              <div className='card'>
                <div className='card-content'>
                  <div className='content'>
                    <h2>Lottery History</h2>
                    {(lotteryHistory && lotteryHistory.length > 0) && lotteryHistory.slice(0,4).map((item,index) => {
                      if(lotteryId != item.id){
                        return (
                        <div className='history-entry mt-3' key={index}>
                        <div>Lottery #{item.id} winner:</div>
                        <div>
                          <a href={`https://etherscan.io/address/${item.address}`} target="_blank">{item.address}</a>
                        </div>
                      </div>
                        )
                      }
                       
                    })

                        }
                  </div>
                </div>
              </div>
            </section>
            <section className='mt-5'>
              <div className='card'>
                <div className='card-content'>
                  <div className='content'>
                    <h2>Players ({lotteryPlayers.length})</h2>
                      <ul className='ml-0'>
                        {(lotteryPlayers && lotteryPlayers.length > 0) && lotteryPlayers.map((player,index)=>(
                         <li key={index}>
                         <a href={`https://etherscan.io/address/${player}`} target="_blank">{player}</a> 
                         </li>
                        ))

                        }
                      </ul>
                  </div>
                </div>
              </div>
            </section>
            <section className='mt-5'>
              <div className='card'>
                <div className='card-content'>
                  <div className='content'>
                    <h2>Pot</h2>
                  <p>{lotteryPot > 0 ? lotteryPot : 0} Ether</p>
                  </div>
                </div>
              </div>
            </section>
           </div>
            </div>
         </section>
       </div>
     </div>
     <footer className='footer'>
    <p>&copy; 2022 Mohsin Blockchain Dveloper</p>
     </footer>
    </div>
  );
}

export default App;
