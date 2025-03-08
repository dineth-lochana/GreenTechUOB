import React, { useState, useEffect, useMemo } from 'react';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { FaSun, FaBatteryFull, FaDollarSign } from 'react-icons/fa'; // Importing icons from react-icons
import './solar.css';

// Slider Component
function Slider(props) {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-gray-700">{props.label}</label>
        <span className="text-sm font-semibold text-gray-900">{props.value.toLocaleString()} {props.unit}</span>
      </div>
      <input
        type="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  );
}

function SolarCalc() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [systemSize, setSystemSize] = useState(5);
  const [systemCost, setSystemCost] = useState(1000000);
  const [costPerKwh, setCostPerKwh] = useState(50);
  const [receivedPerKwh, setReceivedPerKwh] = useState(30);
  const [selfConsumed, setSelfConsumed] = useState(70);
  const [priceIncrease, setPriceIncrease] = useState(5);
  const [productionPerYear, setProductionPerYear] = useState(1500);
  const [expectedLifetime, setExpectedLifetime] = useState(25);
  const [solarExported, setSolarExported] = useState(30);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        setUserEmail(user.email);
      } else {
        setIsLoggedIn(false);
        setUserEmail(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setSolarExported(100 - selfConsumed);
  }, [selfConsumed]);

  useEffect(() => {
    setSelfConsumed(100 - solarExported);
  }, [solarExported]);

  const calculations = useMemo(() => {
    const yearsData = [];
    let totalSavings = 0;
    let currentCostPerKwh = costPerKwh;
    const exported = solarExported / 100;

    for (let year = 0; year <= expectedLifetime; year++) {
      const yearlyProduction = productionPerYear * systemSize;
      const selfConsumedSavings = yearlyProduction * (selfConsumed / 100) * currentCostPerKwh;
      const exportedEarnings = yearlyProduction * exported * receivedPerKwh;
      const yearlyBenefit = selfConsumedSavings + exportedEarnings;

      totalSavings += yearlyBenefit;
      yearsData.push({
        year,
        savings: totalSavings,
        costPerKwh: currentCostPerKwh,
        exportedEarnings
      });

      currentCostPerKwh *= (1 + priceIncrease / 100);
    }

    const yearsToPayback = yearsData.length > 1 ? systemCost / (yearsData[1].savings || 1) : 0;
    const lifetimeROI = ((totalSavings - systemCost) / systemCost) * 100;
    const yearlyROI = lifetimeROI / expectedLifetime;

    return {
      yearsToPayback,
      yearlyROI,
      lifetimeROI,
      chartData: yearsData
    };
  }, [systemSize, systemCost, costPerKwh, receivedPerKwh, selfConsumed, priceIncrease, productionPerYear, expectedLifetime, solarExported]);

  if (!isLoggedIn) {
    return (
      <div>
        <h1>Solar Calculator Page</h1>
        <p>You are not logged in.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <FaSun className="text-yellow-500" />
            Solar ROI Calculator
          </h1>
          <p className="mt-2 text-gray-600">Calculate your solar investment returns</p>
          <p>Logged in as: {userEmail}</p>
        </div>

        <div className="card-container">
          <div className="card bg-white p-6 rounded-lg shadow-lg">
            <Slider label="System Size (kW)" value={systemSize} onChange={setSystemSize} min={0} max={50} step={0.5} unit="kW" />
            <Slider label="System Cost" value={systemCost} onChange={setSystemCost} min={0} max={10000000} step={50000} unit="LKR" />
            <Slider label="Cost per kWh" value={costPerKwh} onChange={setCostPerKwh} min={0} max={200} step={1} unit="LKR" />
            <Slider label="Received per kWh Exported" value={receivedPerKwh} onChange={setReceivedPerKwh} min={0} max={100} step={1} unit="LKR" />
            <Slider label="Solar Energy Self Consumed" value={selfConsumed} onChange={setSelfConsumed} min={0} max={100} step={5} unit="%" />
            <Slider label="Solar Energy Exported" value={solarExported} onChange={setSolarExported} min={0} max={100} step={5} unit="%" />
            <Slider label="Annual Electricity Price Increase" value={priceIncrease} onChange={setPriceIncrease} min={0} max={50} step={0.5} unit="%" />
            <Slider label="System Production per Year" value={productionPerYear} onChange={setProductionPerYear} min={0} max={5000} step={50} unit="kWh/kW" />
            <Slider label="Expected Lifetime" value={expectedLifetime} onChange={setExpectedLifetime} min={0} max={50} step={1} unit="years" />
          </div>

          <div className="card bg-white p-6 rounded-lg shadow-lg">
            <div className="grid grid-cols-1 gap-6 mb-8">
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FaBatteryFull className="text-green-500" />
                  System paid for after
                </h3>
                <p className="text-3xl font-bold text-green-600">{calculations.yearsToPayback.toFixed(1)} years</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FaDollarSign className="text-blue-500" />
                  Average ROI per year
                </h3>
                <p className="text-3xl font-bold text-blue-600">{calculations.yearlyROI.toFixed(1)}%</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FaDollarSign className="text-purple-500" />
                  ROI over lifetime
                </h3>
                <p className="text-3xl font-bold text-purple-600">{calculations.lifetimeROI.toFixed(1)}%</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FaDollarSign className="text-yellow-500" />
                  Total Exported Earnings
                </h3>
                <p className="text-3xl font-bold text-yellow-600">{calculations.chartData[calculations.chartData.length - 1]?.exportedEarnings.toFixed(1)} LKR</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SolarCalc;
