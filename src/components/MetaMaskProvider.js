import { createContext, useState, useEffect } from "react";
import Web3 from "web3";
import MetaMaskOnboarding from "@metamask/onboarding";
import detectEthereumProvider from "@metamask/detect-provider";
import { getMetamaskTokenOptions } from "../utils/helper";
import { Hash } from "./Hash";
import { MetaMaskInstallModal } from "./MetaMaskInstallModal";
import { Button } from "react-bootstrap";
import "./metamaskProvider.css";

export const MetaMaskContext = createContext();

export const MetaMaskProvider = ({ children }) => {
	const [provider, setProvider] = useState();
	const [web3, setWeb3] = useState();

	const [desiredChainId] = useState(process.env.REACT_APP_BLOCKCHAIN_NETWORK_ID);
	const [desiredChainName] = useState(process.env.REACT_APP_BLOCKCHAIN_NETWORK_NAME);

	const [chainId, setChainId] = useState();
	const [connectedAccount, setConnectedAccount] = useState();
	const [metaMaskIsReady, setMetaMaskIsReady] = useState(false);

	const [changeChainLoading, setChangeChainLoading] = useState(false);
	const [connectWalletLoading, setConnectWalletLoading] = useState(false);

	const contextStore = {
		provider,
		web3,
		chainId,
		account: connectedAccount,
	};

	// init metamask provider and web3
	useEffect(() => {
		// console.log(provider, "provider");
		// detectEthereumProvider().then((provider) => {
		// 	setProvider(provider);
		// 	setWeb3(new Web3(provider));
		// });
		const web3 = new Web3("http://localhost:8545");

		// Request account access if needed (for modern browsers)
		async function requestAccountAccess() {
			try {
				const accounts = await web3.eth.getAccounts();
				const balanceWei = await web3.eth.getBalance(accounts[2]);
				const balanceEth = web3.utils.fromWei(balanceWei, "ether");
				const senderAddress = accounts[2];
				const receiverAddress = accounts[3];
				console.log(balanceEth);
				const transaction = {
					from: senderAddress,
					to: receiverAddress,
					value: web3.utils.toWei("100", "ether"), // Amount in Wei
				};

				web3.eth
					.sendTransaction(transaction)
					.then((receipt) => console.log("Transaction receipt:", receipt))
					.catch((error) => console.error("Error sending transaction:", error));
			} catch (error) {
				console.error("Error requesting account access:", error);
			}
		}

		// Call the function to request account access (you might trigger this in response to a user action)
		requestAccountAccess();

		//eslint-disable-next-line
	}, []);

	const isMetaMaskInstalled = MetaMaskOnboarding.isMetaMaskInstalled();
	const onboarding = new MetaMaskOnboarding();

	useEffect(() => {
		if (isMetaMaskInstalled && provider) {
			console.log(1111, "provider", provider);
			provider.on("accountsChanged", handleAccountsChanged);
			provider.on("chainChanged", handleChainChanged);

			// initialize chainId and connectedAccount
			handleAccountsChanged();
			handleChainChanged();
		}
		return () => {
			onboarding.stopOnboarding();
		};
		//eslint-disable-next-line
	}, [provider]);

	const handleAccountsChanged = async () => {
		// it will only get the account address, not opening metamask
		const accounts = await provider.request({ method: "eth_accounts" });

		if (accounts || accounts.length) {
			console.log(accounts[0], "accounts[0]");
			setConnectedAccount(accounts[0]);
		}
	};

	const handleChainChanged = async (...args) => {
		const currentChainId = await provider.request({ method: "eth_chainId" });
		console.log(`Chain ID Changed To: ${currentChainId}`);
		if (currentChainId) {
			setChainId(currentChainId);
		}
	};

	const connectWallet = async () => {
		// it will open metamask to get permission if needed
		setConnectWalletLoading(true);
		console.log("eth_requestAccounts");
		try {
			const accounts = await provider.request({ method: "eth_requestAccounts" });
			console.log(accounts, 21112312);
			setConnectedAccount(accounts[0]);
		} catch (err) {
			// do nothing
			console.log("connect wallet rejected", err);
		}
		setConnectWalletLoading(false);
	};

	const changeChain = async () => {
		// it will open metamask to add and switch chain if needed
		if (chainId === desiredChainId) return;
		console.log(provider, "provider", "provider");
		setChangeChainLoading(true);
		try {
			await provider.request({
				method: "wallet_switchEthereumChain",
				params: [{ chainId: desiredChainId }],
			});
		} catch (err) {
			// do nothing
			console.log("change chain rejected", err);
		}
		setChangeChainLoading(false);
	};

	useEffect(() => {
		console.log(22222, chainId, desiredChainId);
		const correctChain = chainId === desiredChainId;
		setMetaMaskIsReady(isMetaMaskInstalled && correctChain && connectedAccount);
		//eslint-disable-next-line
	}, [connectedAccount, chainId]);

	const addTokenToMetaMask = async () => {
		const balanceWei = await web3.eth.getBalance(connectedAccount);
		const balanceEth = web3.utils.fromWei(balanceWei, "ether");

		const gasPriceWei = await web3.eth.getGasPrice();
		const gasPriceGweiFromWei = web3.utils.fromWei(gasPriceWei, "gwei");

		console.log(connectedAccount, gasPriceGweiFromWei, balanceEth);
	};

	return (
		<MetaMaskContext.Provider value={contextStore}>
			{!metaMaskIsReady && (
				<div className="metamask-container">
					{!isMetaMaskInstalled && (
						<>
							<h4 className="my-5">
								MetaMask is not installed. Please install MetaMask to use this app.
							</h4>
							<MetaMaskInstallModal />
						</>
					)}
					{isMetaMaskInstalled && !connectedAccount && (
						<Button
							className={""}
							disabled={connectWalletLoading}
							onClick={connectWallet}
						>
							{connectWalletLoading ? (
								<span>
									<div
										className="spinner-border spinner-border-sm p-0"
										role="status"
									></div>{" "}
									&nbsp; Connecting{" "}
								</span>
							) : (
								"Connect Wallet"
							)}
						</Button>
					)}
					{isMetaMaskInstalled && connectedAccount && chainId !== desiredChainId && (
						<>
							<p>
								<b className="color-red">Wrong network selected.</b>
								<br />
								Please switch to the "{desiredChainName}" (chain id:{" "}
								{desiredChainId}) network.
							</p>
							<Button
								className={`btn-danger px-5`}
								onClick={changeChain}
								disabled={changeChainLoading}
							>
								{changeChainLoading ? (
									<span className="">
										<div
											className="spinner-border spinner-border-sm p-0"
											role="status"
											style={{
												width: ".9rem",
												height: ".9rem",
												fontWeight: "bold",
											}}
										></div>{" "}
										&nbsp; Pending{" "}
									</span>
								) : (
									"change network"
								)}
							</Button>
						</>
					)}
				</div>
			)}

			{metaMaskIsReady && (
				<div className="card bg-dark m-1 p-5">
					<div className="card-body">
						<>
							<Hash address={connectedAccount}></Hash>
							<Button className={`btn-danger px-5`} onClick={addTokenToMetaMask}>
								GET AMOUNT
							</Button>
							{children}
						</>
					</div>
				</div>
			)}
		</MetaMaskContext.Provider>
	);
};
