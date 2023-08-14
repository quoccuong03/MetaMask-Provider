export const getMetamaskChainOptions = (chainId, chainName) => ({
	chainId,
	chainName,
	nativeCurrency: {
		name: process.env.REACT_APP_BLOCKCHAIN_SYMBOL,
		symbol: process.env.REACT_APP_BLOCKCHAIN_SYMBOL, // 2-6 characters long
		decimals: 18,
	},
	// blockExplorerUrls: ['http://'],
	rpcUrls: [process.env.REACT_APP_BLOCKCHAIN_RPC_URL],
});

export const getMetamaskTokenOptions = (tokenAddress, tokenName = "LETH") => ({
	address: tokenAddress,
	symbol: tokenName,
	decimals: 18,
	image: "",
});

export const getAddress = (contract) => contract?._address;

const metaMaskConfigs = {
	"0x1": {
		// BSC TESTNET
		chain: {
			chainId: "0x61",
			chainName: "Custom Ethereum Classic",
			nativeCurrency: {
				name: "ETC",
				symbol: "ETC", // 2-6 characters long
				decimals: 18,
			},

			rpcUrls: ["https://mainnet.infura.io/v3/3033b1379d554eb1a382e0943d086662"],
		},
	},
	1337: {
		// BSC TESTNET
		chain: {
			chainId: "1337",
			chainName: "Localhost",
			nativeCurrency: {
				name: "ETH",
				symbol: "ETH", // 2-6 characters long
				decimals: 18,
			},

			rpcUrls: ["http://localhost:8545"],
		},
	},
};

const metaMaskConfig = metaMaskConfigs[process.env.REACT_APP_BLOCKCHAIN_NETWORK_ID];
export const { chain, TOKENNAME, addressUrl } = metaMaskConfig;
