import React, { Component } from 'react';
import AuctionContract from '../build/contracts/Auction.json';
import getWeb3 from './utils/getWeb3';
import Button from 'react-button';

const styles = {
	accountsDiv: {
		display: 'flex',
		flexDirection: 'column',
		width: '50%'
	},
	biddingButtons: {
		display: 'flex',
		flexDirection: 'column',
		width: '50%'
	}
};

class App extends Component {
	state = {
		accounts: null,
		auction: null,
		selectedAccount: null,
		bidValue: 0
	}
	web3;

  componentWillMount() {
    getWeb3
			.then(results => {
				this.web3 = results.web3;
				this.instantiateContract()
			})
			.catch(() => {
				console.log('Error finding web3.')
			});
  }

  instantiateContract = () => {
    const contract = require('truffle-contract');
    const auction = contract(AuctionContract);
    auction.setProvider(this.web3.currentProvider);
    this.web3.eth.getAccounts((error, accounts) => {
			this.setState({ accounts, selectedAccount: accounts[0] });
			auction.deployed()
				.then(auction => {
					this.setState({ auction });
				})
				.catch(e => console.log(e));
		});
	}

	bid = () => {
		this.state.auction.addBid.call(this.state.bidValue, {from: this.state.selectedAccount})
			.then(result => console.log(result));
	}

	closeAuction = async () => {
		if(this.state.selectedAccount !== this.state.accounts[0]) {
			console.log('You can\'t close the auction with this account');
		} else {
			await this.getHighestBidder();
			this.state.auction.closeAuction.call({from: this.state.selectedAccount});
		}
	}

	getHighestBidder = () => {
		return this.state.auction.getHighestBidder.call({from: this.state.selectedAccount})
			.then(result => console.log(result));
	}

  render() {
		const accountsToBidWith = this.state.accounts ? 
			this.state.accounts.map(account => {
				const pressed = account === this.state.selectedAccount;
				return (
					<Button
						pressed={pressed}
						key={account}
						onClick={() => this.setState({ selectedAccount: account })}
					>
						{account}
					</Button>
				);
			}) : null;
		const bettingButtons = () => {
			return (
				<div style={styles.biddingButtons}>
					<input
						style={{ width: '50%', margin: 'auto' }}
						value={this.state.bidValue}
						onChange={e => this.setState({ bidValue: e.target.value })}
					/>
					<Button
						onClick={this.bid}
					>
						Bid {this.state.bidValue} with account {this.state.selectedAccount}
					</Button>
					<Button
						onClick={this.getHighestBidder}
					>
						Get highest bidder
					</Button>
					<Button
						onClick={this.closeAuction}
					>
						Close Auction
					</Button>
				</div>
			);
		}
    return (
      <div style={{ display: 'flex' }}>
				<div
					style={styles.accountsDiv}
				>
					{accountsToBidWith}
				</div>
				{bettingButtons()}
      </div>
    );
  }
}


export default App
