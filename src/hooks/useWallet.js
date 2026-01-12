import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export const useWallet = () => {
    const [account, setAccount] = useState(null);
    const [balance, setBalance] = useState('12500'); // Demo balance
    const [chainId, setChainId] = useState(null);
    const [isDemo, setIsDemo] = useState(true);

    const connect = async () => {
        if (typeof window !== 'undefined' && window.ethereum) {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await provider.send("eth_requestAccounts", []);
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                    const network = await provider.getNetwork();
                    setChainId(Number(network.chainId));
                    setIsDemo(false);
                    // In a real app, we would fetch the ERC20 balance here
                    // For now, if connected, show a "Real" balance example or keeping demo for UI testing
                    // setBalance('500'); 
                }
            } catch (error) {
                console.error("Connection failed", error);
                alert("ウォレット接続に失敗しました");
            }
        } else {
            alert("MetaMaskがインストールされていません。デモモードで続行します。");
        }
    };

    const disconnect = () => {
        setAccount(null);
        setIsDemo(true);
        setBalance('12500');
    };

    // Auto connect if authorized
    useEffect(() => {
        if (typeof window !== 'undefined' && window.ethereum && window.ethereum.selectedAddress) {
            // Optional: Auto connect logic
            // connect(); 
        }
    }, []);

    return { account, balance, chainId, connect, disconnect, isDemo, setBalance };
};
