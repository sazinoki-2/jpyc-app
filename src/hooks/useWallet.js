import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export const useWallet = () => {
    const [account, setAccount] = useState(null);
    const [balance, setBalance] = useState('12500'); // Demo balance
    const [chainId, setChainId] = useState(null);
    const [isDemo, setIsDemo] = useState(true);
    const [error, setError] = useState(null);

    const connect = async () => {
        setError(null);
        // Check if running on mobile and not in MetaMask browser
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        if (typeof window !== 'undefined' && window.ethereum) {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await provider.send("eth_requestAccounts", []);
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                    const network = await provider.getNetwork();
                    setChainId(Number(network.chainId));
                    setIsDemo(false);
                }
            } catch (error) {
                console.error("Connection failed", error);
                setError("接続がキャンセルされたか、エラーが発生しました。");
            }
        } else {
            if (isMobile) {
                // Deep link to MetaMask
                const currentUrl = window.location.href.split('?')[0]; // simple cleaning
                const mmUrl = `https://metamask.app.link/dapp/${currentUrl.replace(/^https?:\/\//, '')}`;

                if (confirm("MetaMaskアプリでこのページを開きますか？")) {
                    window.location.href = mmUrl;
                } else {
                    alert("MetaMaskがインストールされていません。デモモードで続行します。");
                }
            } else {
                alert("MetaMaskがインストールされていません。デモモードで続行します。");
            }
        }
    };

    const disconnect = () => {
        setAccount(null);
        setIsDemo(true);
        setBalance('12500');
    };

    // Auto connect checks
    useEffect(() => {
        const checkConnection = async () => {
            if (typeof window !== 'undefined' && window.ethereum) {
                try {
                    const provider = new ethers.BrowserProvider(window.ethereum);
                    const accounts = await provider.send("eth_accounts", []);
                    if (accounts.length > 0) {
                        setAccount(accounts[0]);
                        const network = await provider.getNetwork();
                        setChainId(Number(network.chainId));
                        setIsDemo(false);
                    }
                } catch (e) {
                    console.log("Auto connect failed", e);
                }
            }
        };
        checkConnection();
    }, []);

    return { account, balance, chainId, connect, disconnect, isDemo, setBalance, error };
};
