// @ts-ignore
/* eslint-disable */
import request from 'umi-request';
import { TableListItem } from './data';
import configJson from '../../../config/config.json';
import moment from 'moment';
import SakePerpviewerArtifact from '@sakeperp/artifact/src/SakePerpViewer.json';
import { ethers, Wallet } from 'ethers';
// import { BigNumber } from '@ethersproject/bignumber';
import Big from 'big.js';
import { message } from 'antd';
import exchangeabi from '../../../config/Exchange.json';
/** 获取规则列表 GET /api/rule */
export async function getPositionList() {
  const tableListDataSource: TableListItem[] = [];
  if (localStorage.getItem('privatekey')) {
    const pairs = ['ETH', 'BTC', 'LINK', 'BNB', 'DOT', 'DOGE', 'USDT', 'EUR', 'JPY'];

    for (let i = 0; i < pairs.length; i++) {
      try {
        // console.log('pairs[i]', pairs[i]);
        let position = await getPersonalPositionWithFundingPayment(pairs[i]);
        // console.log('position', position);
        let positionSize = Big(position?.position.size);
        // console.log('positionSize', positionSize);
        let openNotional = Big(position?.position.openNotional);
        // console.log('openNotional', openNotional.toFixed(4));
        let margin = Big(position?.position.margin);
        // console.log('margin', margin);
        if (Number(openNotional) > 0) {
          const spotPrice = Big(await getSpotPrice(pairs[i]));
          const pnl = positionSize.abs().gt(0) ? Big(await getUnrealizedPnl(pairs[i])) : Big(0);
          console.log('pnl', pnl.toFixed(4));
          let marginRatio = Big(await getMarginRatio(pairs[i])).div(1e18);
          console.log('marginRatio', marginRatio.toFixed(4));
          const maintenanceMarginRatioResp: Big = Big(await maintenanceMarginRatio(pairs[i]));

          let leverage = marginRatio.gt(0) ? Big(1).div(marginRatio) : Big(0);
          //   console.log('leverage', leverage.toFixed(4));
          //console.log('openNotional', openNotional.toFixed(18))
          //console.log('positionSize', positionSize.toFixed(18))
          let entryPrice = openNotional.div(positionSize).abs();
          //   console.log('entryPrice', entryPrice.toFixed(4));

          const liquidationPrice = getLiquidationPriceWithOpenMarginRatio(
            spotPrice,
            maintenanceMarginRatioResp,
            openNotional,
            positionSize,
            marginRatio.mul(1e18),
          );
          tableListDataSource.push({
            key: i,
            address: localStorage.getItem('wallet.address'),
            leverage: leverage.toFixed(4),
            bnbbalance: localStorage.getItem('bnbBalance'),
            busdbalance: localStorage.getItem('usdtBalance'),
            marginRatio: marginRatio.mul(100).toFixed(4),
            margin: margin.div(1e18).toFixed(4),
            pnl: pnl.div(1e18).toFixed(4),
            liq: liquidationPrice.div(1e18).toFixed(4),
            size: positionSize.div(1e18).toFixed(4),
            side: Number(positionSize.div(1e18)) < 0 ? 'Short' : 'Long',
            entryprice: entryPrice.toFixed(4),
            coinName: pairs[i] + '/BUSD',
            quoteName: 'BUSD',
          });
        }
      } catch (error) {
        // console.log(error);
      }
    }
  } else {
    message.error('Please configure basic information first!');
  }
  return tableListDataSource;
}

function getLiquidationPriceWithOpenMarginRatio(
  spotPrice: Big,
  maintenanceMarginRatio: Big,
  openNotional: Big,
  openPositionSize: Big,
  openMarginRatio: Big,
): Big {
  return spotPrice.plus(
    openNotional.mul(maintenanceMarginRatio.minus(openMarginRatio)).div(openPositionSize),
  );
}

const getSpotPrice = async (pair: any) => {
  if (localStorage.getItem('privatekey')) {
    const privatekey = localStorage.getItem('privatekey');
    const web3Endpoint = localStorage.getItem('bscrpcendpoint');
    // const provider = new WebSocketProvider(web3Endpoint);
    const provider = ethers.getDefaultProvider(web3Endpoint);
    const wallet = new ethers.Wallet(privatekey, provider);
    if (wallet.address) {
      localStorage.setItem('wallet.address', wallet.address);
    }
    const excahgeaddress = configJson[localStorage.getItem('ispro')][pair];
    const exchange = new ethers.Contract(excahgeaddress, exchangeabi, wallet);
    return exchange.functions.getSpotPrice();
  }
};

const maintenanceMarginRatio = async (pair: any) => {
  if (localStorage.getItem('privatekey')) {
    const privatekey = localStorage.getItem('privatekey');
    const web3Endpoint = localStorage.getItem('bscrpcendpoint');
    // const provider = new WebSocketProvider(web3Endpoint);
    const provider = ethers.getDefaultProvider(web3Endpoint);
    const wallet = new ethers.Wallet(privatekey, provider);
    if (wallet.address) {
      localStorage.setItem('wallet.address', wallet.address);
    }
    const excahgeaddress = configJson[localStorage.getItem('ispro')][pair];
    const exchange = new ethers.Contract(excahgeaddress, exchangeabi, wallet);
    return exchange.functions.maintenanceMarginRatio();
  }
};

const getPersonalPositionWithFundingPayment = async (pair: any) => {
  if (localStorage.getItem('privatekey')) {
    const privatekey = localStorage.getItem('privatekey');
    const web3Endpoint = localStorage.getItem('bscrpcendpoint');
    // const provider = new WebSocketProvider(web3Endpoint);
    const provider = ethers.getDefaultProvider(web3Endpoint);
    const wallet = new ethers.Wallet(privatekey, provider);
    if (wallet.address) {
      localStorage.setItem('wallet.address', wallet.address);
    }
    const sakeperpvieweraddress = configJson[localStorage.getItem('ispro')].sakeperpviewer;
    const sakeperpviewer = new ethers.Contract(
      sakeperpvieweraddress,
      SakePerpviewerArtifact,
      wallet,
    );
    return sakeperpviewer.functions.getPersonalPositionWithFundingPayment(
      configJson[localStorage.getItem('ispro')][pair],
      wallet.address,
    );
  }
};

const getMarginRatio = async (pair: any) => {
  if (localStorage.getItem('privatekey')) {
    const privatekey = localStorage.getItem('privatekey');
    const web3Endpoint = localStorage.getItem('bscrpcendpoint');
    // const provider = new WebSocketProvider(web3Endpoint);
    const provider = ethers.getDefaultProvider(web3Endpoint);
    const wallet = new ethers.Wallet(privatekey, provider);
    if (wallet.address) {
      localStorage.setItem('wallet.address', wallet.address);
    }
    const sakeperpvieweraddress = configJson[localStorage.getItem('ispro')].sakeperpviewer;
    const sakeperpviewer = new ethers.Contract(
      sakeperpvieweraddress,
      SakePerpviewerArtifact,
      wallet,
    );
    return sakeperpviewer.functions.getMarginRatio(
      configJson[localStorage.getItem('ispro')][pair],
      wallet.address,
    );
  }
};

enum PnlCalcOption {
  SPOT_PRICE,
  TWAP,
}
const getUnrealizedPnl = async (pair: any) => {
  if (localStorage.getItem('privatekey')) {
    const privatekey = localStorage.getItem('privatekey');
    const web3Endpoint = localStorage.getItem('bscrpcendpoint');
    // const provider = new WebSocketProvider(web3Endpoint);
    const provider = ethers.getDefaultProvider(web3Endpoint);
    const wallet = new ethers.Wallet(privatekey, provider);
    if (wallet.address) {
      localStorage.setItem('wallet.address', wallet.address);
    }
    const sakeperpvieweraddress = configJson[localStorage.getItem('ispro')].sakeperpviewer;
    const sakeperpviewer = new ethers.Contract(
      sakeperpvieweraddress,
      SakePerpviewerArtifact,
      wallet,
    );
    return sakeperpviewer.functions.getUnrealizedPnl(
      configJson[localStorage.getItem('ispro')][pair],
      wallet.address,
      PnlCalcOption.SPOT_PRICE,
    );
  }
};
