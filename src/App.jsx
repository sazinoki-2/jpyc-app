import { useState, useEffect } from 'react';
import { useWallet } from './hooks/useWallet';
import { Send, QrCode, History, Wallet, User, Menu, X, Copy, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';

// Separate components would be better but keeping in one file for concise initial verification
// We will split them in the next step if successful.

function App() {
  const { account, balance, connect, isDemo } = useWallet();
  const [view, setView] = useState('home');
  // X Integration State
  const [showProfile, setShowProfile] = useState(false);
  const [xProfile, setXProfile] = useState(null); // { name, handle, photo }

  const handleXConnect = () => {
    // Simulate OAuth flow
    setTimeout(() => {
      setXProfile({
        name: 'Demo User',
        handle: '@demo_user_jp',
        photo: 'https://ui-avatars.com/api/?name=Demo+User&background=0D8ABC&color=fff' // Placeholder
      });
    }, 1000);
  };

  const [scanResult, setScanResult] = useState(null);

  // Demo History Data
  const historyData = [
    { id: 1, type: 'receive', amount: 1000, date: '2026/01/12', from: '0x12...34' },
    { id: 2, type: 'send', amount: 500, date: '2026/01/11', to: '0xAB...CD' },
    { id: 3, type: 'send', amount: 3000, date: '2026/01/10', to: 'Amazon' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass px-5 py-4 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('home')}>
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
            <img src="/jpycaikonn.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="font-bold text-xl tracking-tight text-slate-800">JPYC Wallet</h1>
        </div>
        <button
          onClick={() => setShowProfile(true)}
          className={`relative pl-1 pr-4 py-1 rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-2 ${isDemo
            ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
            }`}
        >
          {xProfile ? (
            <>
              <img src={xProfile.photo} className="w-6 h-6 rounded-full" />
              <span>{xProfile.handle}</span>
            </>
          ) : (
            <>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isDemo ? 'bg-slate-300' : 'bg-emerald-500 text-white'}`}>
                <User size={14} />
              </div>
              {isDemo ? '未接続 (Demo)' : `● ${account?.slice(0, 4)}...`}
            </>
          )}
        </button>
      </header>

      {/* Main Content */}
      <main className="pt-24 px-4 max-w-md mx-auto min-h-screen">
        <AnimatePresence>
          {showProfile && (
            <ProfileModal
              onClose={() => setShowProfile(false)}
              account={account}
              isDemo={isDemo}
              connectWallet={connect}
              xProfile={xProfile}
              onConnectX={handleXConnect}
            />
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              key="home"
            >
              {/* Balance Card */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white shadow-xl shadow-blue-200 mb-8">
                <div className="absolute -top-10 -right-10 opacity-10">
                  <Wallet size={180} />
                </div>
                <p className="text-blue-100 text-sm font-medium mb-2">総資産残高</p>
                <div className="text-5xl font-bold tracking-tight mb-6 flex items-baseline gap-2">
                  {parseInt(balance).toLocaleString()} <span className="text-xl font-medium opacity-80">JPYC</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-blue-100 bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-sm">
                  {xProfile ? (
                    <>
                      <img src={xProfile.photo} className="w-4 h-4 rounded-full" />
                      {xProfile.name}
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      {account ? account.slice(0, 10) + '...' + account.slice(-4) : 'Demo Account'}
                    </>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <p className="text-sm font-bold text-slate-400 mb-3 px-1">クイックアクション</p>
              <div className="grid grid-cols-2 gap-4 mb-10">
                <ActionButton
                  icon={<Send size={28} />}
                  label="送る"
                  color="bg-blue-500"
                  onClick={() => setView('send')}
                  desc="QRコード読取"
                />
                <ActionButton
                  icon={<QrCode size={28} />}
                  label="受け取る"
                  color="bg-emerald-500"
                  onClick={() => setView('receive')}
                  desc="QRコード表示"
                />
              </div>

              {/* Recent History */}
              <div className="flex justify-between items-end mb-4 px-1">
                <h2 className="font-bold text-lg text-slate-800">最近の履歴</h2>
                <button onClick={() => setView('history')} className="text-blue-600 text-sm font-medium hover:underline">すべて見る</button>
              </div>
              <div className="space-y-3">
                {historyData.map((item) => (
                  <HistoryItem key={item.id} item={item} />
                ))}
              </div>
            </motion.div>
          )}

          {view === 'send' && (
            <SendView onBack={() => setView('home')} />
          )}

          {view === 'receive' && (
            <ReceiveView onBack={() => setView('home')} account={account} isDemo={isDemo} />
          )}

          {view === 'history' && (
            <HistoryView onBack={() => setView('home')} historyData={historyData} />
          )}

          {view === 'contacts' && (
            <ContactsView onBack={() => setView('home')} />
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 w-full glass bg-white/90 backdrop-blur-lg border-t border-slate-100 pb-safe z-40">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto">
          <NavBtn icon={<Wallet size={20} />} label="ホーム" active={view === 'home'} onClick={() => setView('home')} />
          <NavBtn icon={<History size={20} />} label="履歴" active={view === 'history'} onClick={() => setView('history')} />
          <NavBtn icon={<User size={20} />} label="アドレス帳" active={view === 'contacts'} onClick={() => setView('contacts')} />
          <NavBtn icon={<Menu size={20} />} label="設定" active={view === 'settings'} onClick={() => setView('settings')} />
        </div>
      </nav>
    </div>
  );
}

const ProfileModal = ({ onClose, account, isDemo, connectWallet, xProfile, onConnectX }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    />
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
      className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative z-10 overflow-hidden"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-800">アカウント設定</h3>
        <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X size={20} /></button>
      </div>

      <div className="space-y-4">
        {/* Wallet Section */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <p className="text-xs font-bold text-slate-400 mb-2 uppercase">ウォレット接続</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${isDemo ? 'bg-slate-200' : 'bg-emerald-100 text-emerald-600'}`}>
                <Wallet size={20} />
              </div>
              <div>
                <p className="font-bold text-sm text-slate-800">{isDemo ? '未接続' : 'Connected'}</p>
                <p className="text-xs text-slate-500 font-mono">{account ? account.slice(0, 12) + '...' : '0x...'}</p>
              </div>
            </div>
            {isDemo && (
              <button onClick={connectWallet} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-blue-700">
                接続
              </button>
            )}
          </div>
        </div>

        {/* X Section */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <p className="text-xs font-bold text-slate-400 mb-2 uppercase">ソーシャル連携</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${xProfile ? 'bg-black text-white' : 'bg-slate-200'}`}>
                {/* Simple X icon SVG */}
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                </svg>
              </div>
              <div>
                <p className="font-bold text-sm text-slate-800">{xProfile ? xProfile.name : 'X (Twitter)'}</p>
                <p className="text-xs text-slate-500">{xProfile ? xProfile.handle : '未連携'}</p>
              </div>
            </div>
            {!xProfile ? (
              <button onClick={onConnectX} className="px-3 py-1.5 bg-black text-white text-xs font-bold rounded-lg shadow-sm hover:bg-zinc-800">
                連携
              </button>
            ) : (
              <button className="text-xs font-bold text-slate-400">連携済み</button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-slate-300">
        v1.0.1
      </div>
    </motion.div>
  </div>
);

// Sub-components

const ActionButton = ({ icon, label, color, onClick, desc }) => (
  <button
    onClick={onClick}
    className={`relative overflow-hidden group p-6 ${color} text-white rounded-3xl shadow-lg shadow-blue-100 transition-all hover:scale-[1.02] active:scale-95 text-left`}
  >
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform scale-150">
      {icon}
    </div>
    <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
      {icon}
    </div>
    <div>
      <span className="block font-bold text-lg">{label}</span>
      <span className="text-xs opacity-80">{desc}</span>
    </div>
  </button>
);

const HistoryItem = ({ item }) => {
  const isReceive = item.type === 'receive';
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-full ${isReceive ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
          {isReceive ? <QrCode size={18} /> : <Send size={18} />}
        </div>
        <div>
          <p className="font-bold text-sm text-slate-800">{isReceive ? '受け取り' : '送金'}</p>
          <p className="text-xs text-slate-400">{item.date} • {isReceive ? 'From' : 'To'} {item.to || item.from}</p>
        </div>
      </div>
      <span className={`font-bold font-mono ${isReceive ? 'text-emerald-600' : 'text-slate-900'}`}>
        {isReceive ? '+' : '-'}{item.amount.toLocaleString()}
      </span>
    </div>
  );
};

const HeaderPlain = ({ title, onBack }) => (
  <div className="flex items-center gap-4 mb-6">
    <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100">
      <X size={24} className="text-slate-500" />
    </button>
    <h2 className="text-2xl font-bold">{title}</h2>
  </div>
);

const SendView = ({ onBack }) => {
  const [step, setStep] = useState('input'); // input, scan, confirm
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (step === 'scan') {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
        false
      );

      scanner.render((decodedText) => {
        let cleanAddress = decodedText;
        if (cleanAddress.includes('ethereum:')) cleanAddress = cleanAddress.split('ethereum:')[1].split('?')[0];
        setAddress(cleanAddress);
        setStep('input');
      }, (err) => {
        // ignore
      });

      return () => {
        scanner.clear().catch(e => console.log('Scanner cleanup', e));
      };
    }
  }, [step]);

  return (
    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
      <HeaderPlain title="送金する" onBack={onBack} />

      {step === 'scan' ? (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div id="reader" className="w-full max-w-sm rounded-2xl overflow-hidden shadow-xl border-4 border-white mb-6 bg-black"></div>
          <button
            onClick={() => setStep('input')}
            className="bg-white/90 backdrop-blur text-slate-600 font-bold py-3 px-8 rounded-full shadow-sm hover:bg-white"
          >
            閉じる
          </button>
          <p className="mt-4 text-xs text-slate-400">QRコードを枠内に合わせてください</p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-500 mb-2">宛先アドレス</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="0x..."
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
                <button
                  onClick={() => setStep('scan')}
                  className="bg-blue-50 p-3 rounded-xl text-blue-600 hover:bg-blue-100 transition-colors"
                >
                  <QrCode size={24} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-500 mb-2">金額 (JPYC)</label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute right-4 top-4 text-slate-400 font-bold">JPYC</span>
              </div>
            </div>

            <button className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95 text-lg mt-4">
              確認画面へ
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
};

const ReceiveView = ({ onBack, account, isDemo }) => {
  const myAddress = account || "0xDemoWalletAddress123456789";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(myAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
      <HeaderPlain title="受け取る" onBack={onBack} />

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center mb-6">
        <div className="bg-slate-900 p-4 rounded-xl mb-6">
          <QRCodeSVG value={myAddress} size={200} bgColor="#0f172a" fgColor="#ffffff" level="H" />
        </div>
        <p className="text-slate-500 text-sm font-bold mb-2">あなたのウォレットアドレス</p>
        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg max-w-full">
          <p className="font-mono text-xs text-slate-600 truncate max-w-[200px]">{myAddress}</p>
          <button onClick={handleCopy} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-slate-400" />}
          </button>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3">
        <div className="bg-blue-100 p-2 rounded-full text-blue-600">
          <History size={20} />
        </div>
        <div>
          <p className="font-bold text-sm text-blue-900">受け取りのヒント</p>
          <p className="text-xs text-blue-700 mt-1">
            このQRコードを相手にスキャンしてもらうか、アドレスをコピーして送ってください。PolygonネットワークのJPYCのみ対応しています。
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const HistoryView = ({ onBack, historyData }) => (
  <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
    <HeaderPlain title="取引履歴" onBack={onBack} />
    <div className="space-y-3">
      {/* Extended history mock */}
      {[...historyData, ...historyData].map((item, i) => (
        <HistoryItem key={i} item={{ ...item, id: i }} />
      ))}
    </div>
  </motion.div>
);

const ContactsView = ({ onBack }) => (
  <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}>
    <HeaderPlain title="アドレス帳" onBack={onBack} />
    <div className="space-y-4">
      <button className="w-full p-4 border-2 border-dashed border-slate-300 rounded-2xl text-slate-400 font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
        <User size={20} />
        新規登録
      </button>

      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-400 to-orange-400 flex items-center justify-center text-white font-bold">
              {String.fromCharCode(64 + i)}
            </div>
            <div>
              <p className="font-bold text-slate-800">User {String.fromCharCode(64 + i)}</p>
              <p className="text-xs text-slate-400 font-mono">0x123...456</p>
            </div>
          </div>
          <button className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold">送る</button>
        </div>
      ))}
    </div>
  </motion.div>
);

const NavBtn = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`relative flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors ${active ? 'text-blue-600' : 'text-slate-400 hover:text-slate-500'}`}>
    {active && <motion.div layoutId="nav-bg" className="absolute -top-3 w-8 h-1 bg-blue-500 rounded-b-full shadow-lg shadow-blue-200" />}
    {icon}
    <span className="text-[10px] font-bold tracking-tight">{label}</span>
  </button>
);

export default App;
