import Image from "next/image";
import { Inter } from "next/font/google";
import { useEffect, useState } from "react";
import axios from "axios";

const inter = Inter({ subsets: ["latin"] });

type UserBalance = {
  USDC: number;
  USDT: number;
  BZZ: number;
  Minutes: number;
};

const initialBalance = {
  USDC: 100,
  USDT: 100,
  BZZ: 100,
  Minutes: 0,
};

export default function Home() {
  const [currency, setCurrency] = useState("USDC");
  const [userBalance, setUserBalance] = useState<UserBalance>(initialBalance);
  const [rechargeAmount, setRechargeAmount] = useState(0);
  const [BZZPrize, setBZZPrize] = useState(0);
  const [BZZPerGBPerMonth, setBZZPerGBPerMonth] = useState(0.3261);
  const [minCastRecording, setMinCastRecording] = useState(1.2);
  const [minutesAllocated, setMinutesAllocated] = useState(0);
  const PLATFORM_FEE_PERCENTAGE = 0.01;

  const fetchBZZUSDTPrize = async () => {
    axios
      .get(
        "https://rest.coinapi.io/v1/exchangerate/USDT/BZZ?apikey=399519D6-A869-4322-A969-E04BFA9D8553&invert=true&output_format=json"
      )
      .then((res) => {
        setBZZPrize(1 / res.data.rate);
      });
  };

  useEffect(() => {
    fetchBZZUSDTPrize();
  }, []);

  const handleChange = (e: any) => {
    switch (e.target.name) {
      case "amount":
        setRechargeAmount(e.target.value);
        // getMinutesAllocated();
        break;
      case "currency":
        setCurrency(e.target.value);
        break;
      default:
        break;
    }
  };

  const getMinutesAllocated = () => {
    const _platformFee = rechargeAmount * PLATFORM_FEE_PERCENTAGE;
    let bzzAmount = rechargeAmount - _platformFee;
    if (currency !== "BZZ") {
      bzzAmount = (rechargeAmount - _platformFee) / BZZPrize;
    }
    const mbperBZZperMonth = 1024 / BZZPerGBPerMonth;
    const minutesAllocated = (bzzAmount * mbperBZZperMonth) / minCastRecording;
    setMinutesAllocated(parseFloat(minutesAllocated.toFixed(2)));
  };

  const handleClickRecharge = () => {
    setUserBalance({
      ...userBalance,
      [currency]: userBalance[currency as keyof UserBalance] - rechargeAmount,
      Minutes: userBalance.Minutes + minutesAllocated,
    });
    setRechargeAmount(0);
  };

  useEffect(() => {
    getMinutesAllocated();
  }, [rechargeAmount, currency]);

  return (
    <main
      className={`flex min-h-screen flex-col items-center p-4 md:p-24 ${inter.className}`}
    >
      <header className="w-full md:w-1/2 flex items-center justify-between px-2">
        <p>User Balance:</p>
        <p>{userBalance.USDC.toFixed(2)} USDC</p>
        <p>{userBalance.USDT.toFixed(2)} USDT</p>
        <p>{userBalance.BZZ.toFixed(2)} BZZ</p>
        <p>{userBalance.Minutes.toFixed(2)} Minutes</p>
      </header>
      <section className="w-full md:w-1/2 border border-gray-700 rounded-lg p-4 flex flex-col gap-4">
        <div>
          <div className="flex gap-2">
            <input
              type="number"
              className="w-4/5 p-2 bg-transparent rounded-lg border border-gray-700"
              placeholder="Enter amount"
              name="amount"
              value={rechargeAmount}
              onChange={handleChange}
            />
            <select
              className="w-1/5 text-center border border-gray-700 rounded-lg"
              name="currency"
              id="currency-select"
              value={currency}
              onChange={handleChange}
            >
              <option value="USDC">USDC</option>
              <option value="USDT">USDT</option>
              <option value="BZZ">BZZ</option>
            </select>
          </div>
          <div className="w-full text-gray-500 text-xs text-right px-1">
            {currency !== "BZZ" ? (
              <p>
                {rechargeAmount} {currency} ≈{" "}
                {currency !== "BZZ"
                  ? (rechargeAmount / BZZPrize).toFixed(2)
                  : 1}{" "}
                BZZ
              </p>
            ) : (
              <p>{rechargeAmount} BZZ</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            className="w-4/5 p-2 bg-transparent rounded-lg border border-gray-700"
            placeholder="Minutes Redeemable"
            value={minutesAllocated}
            disabled
          />
          <div className="w-1/5 flex items-center justify-center border border-gray-700 rounded-lg">
            ~Minutes
          </div>
        </div>

        <div className="flex flex-col gap-4 text-gray-500 text-xs px-2">
          <div className="flex items-center justify-between">
            <p>Platform Fee(1-5%)</p>
            <p>{rechargeAmount * PLATFORM_FEE_PERCENTAGE}</p>
          </div>
          <div className="flex items-center justify-between">
            <p>BZZ Prize(USD)</p>
            <p>{BZZPrize}</p>
          </div>
          <div className="flex items-center justify-between">
            <p>BZZ per GB per month</p>
            <p>{BZZPerGBPerMonth}</p>
          </div>
          <div className="flex items-center justify-between">
            <p>1 min cast recording(AVG)</p>
            <p>{minCastRecording} MB</p>
          </div>
        </div>

        <button
          className="w-full p-2 bg-gray-400 hover:bg-gray-200 text-black rounded-lg"
          onClick={handleClickRecharge}
        >
          Recharge
        </button>
      </section>
    </main>
  );
}
