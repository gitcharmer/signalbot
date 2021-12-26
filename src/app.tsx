import type { Settings as LayoutSettings } from '@ant-design/pro-layout';
import { PageLoading } from '@ant-design/pro-layout';
import { message } from 'antd';
import type { RunTimeLayoutConfig } from 'umi';
import { history, Link } from 'umi';
import RightContent from '@/components/RightContent';
import Footer from '@/components/Footer';
import { currentUser as queryCurrentUser } from './services/ant-design-pro/api';
import { BookOutlined, LinkOutlined } from '@ant-design/icons';
import request from 'umi-request';
import fetch from 'node-fetch';
import { ethers, Wallet } from 'ethers';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import Big from 'big.js';
import { formatFixed, parseFixed } from '@ethersproject/bignumber';
import { Block, WebSocketProvider } from '@ethersproject/providers';
import SakePerpArtifact from '@sakeperp/artifact/src/SakePerp.json';
import ERC20TokenArtifact from '@sakeperp/artifact/src/ERC20Token.json';
import configJson from '../config/config.json';
import configLinux from '../LinuxInit.json';

// 上线时再放开
// const ispro = process.env.NODE_ENV;
const ispro = 'development';
localStorage.setItem('ispro', ispro);

console.log('process.env.NODE_ENV', process.env.NODE_ENV);
const erc20tokenaddress = configJson[localStorage.getItem('ispro')].erc20address;
const erc20tokenabi = ERC20TokenArtifact;
const sakeperpabi = SakePerpArtifact;
const sakeperpaddress = configJson[localStorage.getItem('ispro')].sakeperpaddress; //sakeperp testnet address
// loca
let provider: any;
let wallet: any;
let erc20: any;
let privatekey: any = localStorage.getItem('privatekey')
  ? localStorage.getItem('privatekey')
  : configLinux.LinuxInit.privatekey;
let web3Endpoint: any = localStorage.getItem('bscrpcendpoint')
  ? localStorage.getItem('bscrpcendpoint')
  : configLinux.LinuxInit.bscrpcendpoint;
let pricenum: any = localStorage.getItem('pricerate')
  ? localStorage.getItem('pricerate')
  : configLinux.LinuxInit.pricenum;
let leverage: any = localStorage.getItem('leverage')
  ? localStorage.getItem('leverage')
  : configLinux.LinuxInit.leverage;

if (privatekey) {
  console.log('bscrpcendpoint', web3Endpoint);
  // const provider = new WebSocketProvider(web3Endpoint);
  provider = ethers.getDefaultProvider(web3Endpoint);
  wallet = new ethers.Wallet(privatekey, provider);
  erc20 = new ethers.Contract(erc20tokenaddress, erc20tokenabi, wallet);
  if (wallet.address) {
    localStorage.setItem('wallet.address', wallet.address);
  }
  // approve
  (async () => {
    //bnb balance
    const bnbBalance = await provider.getBalance(wallet.address);
    console.log('bnbBalance', Number(ethers.utils.formatUnits(bnbBalance, 18)).toFixed(4));
    localStorage.setItem('bnbBalance', Number(ethers.utils.formatUnits(bnbBalance, 18)).toFixed(4));
    //usdt balance
    const usdtBalance = await erc20.functions.balanceOf(wallet.address);
    console.log('usdtBalance', Number(ethers.utils.formatUnits(usdtBalance[0], 18)).toFixed(4));
    localStorage.setItem(
      'usdtBalance',
      Number(ethers.utils.formatUnits(usdtBalance[0], 18)).toFixed(4),
    );
    if (
      parseFloat(localStorage.getItem('bnbBalance')) <
        parseFloat(configJson.PreflightCheck.GAS_BALANCE_THRESHOLD) ||
      parseFloat(localStorage.getItem('usdtBalance')) < parseFloat(pricenum)
    ) {
      console.log('bnb/busd balance is insufficient');
      message.error('bnb/busd balance is insufficient!');
    } else {
      const gasPrice = await provider.getGasPrice(); // bsc大多时候返回5000000000 (5e9)
      // console.log('gasPrice', gasPrice);
      const allowance = await erc20.functions.allowance(wallet.address, sakeperpaddress);
      // console.log('allowance', allowance);
      // 返回值为uni256的BigNumber，如果是0，用0===allowance依然false，但0==allowance则为true
      // 如果从来没approve过，则allowance为0
      const MaxUint256: BigNumber = /*#__PURE__*/ BigNumber.from(
        '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      );
      const decimals = await erc20.functions.decimals();
      const infiniteAllowance = Big(ethers.utils.formatUnits(erc20tokenaddress, decimals[0]));
      const allowanceThreshold = infiniteAllowance.div(2);
      const haveallowance = Big(ethers.utils.formatUnits(allowance[0], decimals[0]));
      // console.log('allowance', allowance);
      // console.log('haveallowance', haveallowance);
      // console.log('allowanceThreshold', allowanceThreshold);
      // console.log('haveallowance.lt(allowanceThreshold)', haveallowance.lt(allowanceThreshold));
      if (haveallowance.lt(allowanceThreshold)) {
        const approveResult = await erc20.functions.approve(sakeperpaddress, MaxUint256, {
          gasPrice: gasPrice,
          gasLimit: '45000',
        });
        console.log('approveResult', approveResult);
      }
    }
  })();
}
// Create WebSocket connection.
const socket = new WebSocket(
  configJson[localStorage.getItem('ispro')].websocket + localStorage.getItem('wallet.address'),
);
console.log('init socket', socket);

socket.onopen = function () {
  socket.send('0');
  console.log('websocket connect');
};

socket.onclose = function () {
  window.location.reload();
};

setInterval(function () {
  socket.send('999');
  console.log('connect to websocket server');
}, configJson.PreflightCheck.INTERVAL_MIN * 1000);

socket.onmessage = function () {
  privatekey = localStorage.getItem('privatekey')
    ? localStorage.getItem('privatekey')
    : configLinux.LinuxInit.privatekey;
  web3Endpoint = localStorage.getItem('bscrpcendpoint')
    ? localStorage.getItem('bscrpcendpoint')
    : configLinux.LinuxInit.bscrpcendpoint;
  pricenum = localStorage.getItem('pricerate')
    ? localStorage.getItem('pricerate')
    : configLinux.LinuxInit.pricenum;
  leverage = localStorage.getItem('leverage')
    ? localStorage.getItem('leverage')
    : configLinux.LinuxInit.leverage;

  // check bnb/busd balance
  if (
    parseFloat(localStorage.getItem('bnbBalance')) <
      parseFloat(configJson.PreflightCheck.GAS_BALANCE_THRESHOLD) ||
    parseFloat(localStorage.getItem('usdtBalance')) < parseFloat(pricenum)
  ) {
    console.log('bnb/busd balance is insufficient');
    message.error('bnb/busd balance is insufficient!');
  } else {
    request
      .get(configJson[localStorage.getItem('ispro')].api + 'sakeSignal/getActiveSignal', {
        params: {
          address: localStorage.getItem('wallet.address'),
        },
      })
      .then(function (data) {
        for (let i = 0; i < data.length; i += 1) {
          if (data[i].subStatue == 1) {
            //判断订阅的信号id是否已经开过仓了
            // /operationRecord/getRecordBySigIdAndAddr 根据signalId和地址获取操作记录
            request
              .get(
                configJson[localStorage.getItem('ispro')].api +
                  'operationRecord/getLastRecordBySigIdAndAddr',
                {
                  params: {
                    address: localStorage.getItem('wallet.address'),
                    signalId: data[i].id,
                  },
                },
              )
              .then(function (res) {
                // console.log('/operationRecord/getLastRecordBySigIdAndAddr', res);
                const recordLastRecordid = res.lastRecordId;
                request
                  .get(configJson[localStorage.getItem('ispro')].api + 'sakeSignal/getSignalById', {
                    params: {
                      address: localStorage.getItem('wallet.address'),
                      signalId: data[i].id,
                    },
                  })
                  .then(function (response) {
                    const responsedata = response;
                    // console.log('response', responsedata);
                    // console.log('response.lastRecordId', responsedata.lastRecordId);
                    // console.log('recordLastRecordid', recordLastRecordid);
                    // console.log(
                    //   'response.lastRecordId == recordLastRecordid',
                    //   response.lastRecordId == recordLastRecordid,
                    // );
                    if (
                      responsedata.lastRecordId &&
                      recordLastRecordid &&
                      responsedata.lastRecordId == recordLastRecordid
                    ) {
                      console.log('此信号id已经开过仓了', response.id);
                    } else {
                      // 判断策略是否运行，是否订阅状态
                      if (responsedata.statues == 0 && responsedata.id == data[i].id) {
                        console.log('准备开仓,信号id为', data[i].id);
                        const coinName = responsedata.coinName;
                        const side = responsedata.side;
                        console.log('coinName', coinName);
                        // openPosition;
                        (async () => {
                          if (privatekey) {
                            // console.log('bscrpcendpoint', web3Endpoint);
                            // const provider = new WebSocketProvider(web3Endpoint);
                            provider = ethers.getDefaultProvider(web3Endpoint);
                            wallet = new ethers.Wallet(privatekey, provider);
                            erc20 = new ethers.Contract(erc20tokenaddress, erc20tokenabi, wallet);
                            if (wallet.address) {
                              localStorage.setItem('wallet.address', wallet.address);
                            }
                            // approve
                            (async () => {
                              // console.log('erc20', erc20);
                              const gasPrice = await provider.getGasPrice(); // bsc大多时候返回5000000000 (5e9)
                              // console.log('gasPrice', gasPrice);
                              const allowance = await erc20.functions.allowance(
                                wallet.address,
                                sakeperpaddress,
                              );
                              // console.log('allowance', allowance);
                              // 返回值为uni256的BigNumber，如果是0，用0===allowance依然false，但0==allowance则为true
                              // 如果从来没approve过，则allowance为0
                              const MaxUint256: BigNumber = /*#__PURE__*/ BigNumber.from(
                                '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
                              );
                              const decimals = await erc20.functions.decimals();
                              //bnb balance
                              const bnbBalance = await provider.getBalance(wallet.address);
                              console.log(
                                'bnbBalance',
                                Number(ethers.utils.formatUnits(bnbBalance, 18)).toFixed(4),
                              );
                              localStorage.setItem(
                                'bnbBalance',
                                Number(ethers.utils.formatUnits(bnbBalance, 18)).toFixed(4),
                              );
                              //usdt balance
                              const usdtBalance = await erc20.functions.balanceOf(wallet.address);
                              console.log(
                                'usdtBalance',
                                Number(ethers.utils.formatUnits(usdtBalance[0], 18)).toFixed(4),
                              );
                              localStorage.setItem(
                                'usdtBalance',
                                Number(ethers.utils.formatUnits(usdtBalance[0], 18)).toFixed(4),
                              );
                              const infiniteAllowance = Big(
                                ethers.utils.formatUnits(erc20tokenaddress, decimals[0]),
                              );
                              const allowanceThreshold = infiniteAllowance.div(2);
                              const haveallowance = Big(
                                ethers.utils.formatUnits(allowance[0], decimals[0]),
                              );
                              // console.log('allowance', allowance);
                              // console.log('haveallowance', haveallowance);
                              // console.log('allowanceThreshold', allowanceThreshold);
                              // console.log(
                              //   'haveallowance.lt(allowanceThreshold)',
                              //   haveallowance.lt(allowanceThreshold),
                              // );
                              if (haveallowance.lt(allowanceThreshold)) {
                                const approveResult = await erc20.functions.approve(
                                  sakeperpaddress,
                                  MaxUint256,
                                  {
                                    gasPrice: gasPrice,
                                    gasLimit: '45000',
                                  },
                                );
                                console.log('approveResult', approveResult);
                              }
                            })();
                          }
                          const sakeperpcontract = new ethers.Contract(
                            sakeperpaddress,
                            sakeperpabi,
                            wallet,
                          );
                          const ethexchangeaddress =
                            configJson[localStorage.getItem('ispro')][coinName];
                          if (parseFloat(leverage) > 0 && parseFloat(pricenum) > 0) {
                            const leveragerate = Big(parseFloat(leverage));
                            const pricerate = Big(parseFloat(pricenum)).div(leveragerate);
                            const tx = await sakeperpcontract.functions.openPosition(
                              ethexchangeaddress,
                              side,
                              { d: toWei(pricerate) },
                              { d: toWei(leveragerate) },
                              { d: toWei(Big(0)) },
                              {
                                gasLimit: 2_500_000,
                              },
                            );
                            console.log('tx: ', tx);

                            // 更新lastRecordId
                            if (tx) {
                              // bnb balance & busd balance
                              setTimeout(() => {
                                (async () => {
                                  //bnb balance
                                  const bnb = await provider.getBalance(wallet.address);
                                  console.log(
                                    'bnbBalance',
                                    Number(ethers.utils.formatUnits(bnb, 18)).toFixed(4),
                                  );
                                  localStorage.setItem(
                                    'bnbBalance',
                                    Number(ethers.utils.formatUnits(bnb, 18)).toFixed(4),
                                  );
                                  //usdt balance
                                  const usdt = await erc20.functions.balanceOf(wallet.address);
                                  console.log(
                                    'usdtBalance',
                                    Number(ethers.utils.formatUnits(usdt[0], 18)).toFixed(4),
                                  );
                                  localStorage.setItem(
                                    'usdtBalance',
                                    Number(ethers.utils.formatUnits(usdt[0], 18)).toFixed(4),
                                  );
                                })();
                              }, 50000);

                              // addRecord
                              console.log('to addRecord ', responsedata.lastRecordId);
                              request
                                .post(
                                  configJson[localStorage.getItem('ispro')].api +
                                    'operationRecord/addRecord',
                                  {
                                    data: {
                                      address: localStorage.getItem('wallet.address'),
                                      amount: parseFloat(pricenum),
                                      lastRecordId: responsedata.lastRecordId,
                                      side: side,
                                      signal_id: parseInt(data[i].id),
                                    },
                                    requestType: 'form',
                                  },
                                )
                                .then(function (response) {
                                  if (response == 1) {
                                    console.log(
                                      'update lastRecordId: operationRecord/addRecord',
                                      response,
                                    );
                                  }
                                })
                                .catch(function (error) {
                                  console.log(error);
                                });
                            }
                          } else {
                            console.log('invalid params');
                          }
                        })();
                      }
                    }
                  })
                  .catch(function (error) {
                    console.log(error);
                  });
              })
              .catch(function (error) {
                console.log(error);
              });
          }
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }
};

// noinspection JSMethodCanBeStatic
function toWei(val: Big): BigNumber {
  return parseEther(val.toFixed(18));
}

const names = ['wei', 'kwei', 'mwei', 'gwei', 'szabo', 'finney', 'ether'];

function parseEther(ether: string): BigNumber {
  return parseUnits(ether, 18);
}
function parseUnits(value: string, unitName?: BigNumberish): BigNumber {
  if (typeof unitName === 'string') {
    const index = names.indexOf(unitName);
    if (index !== -1) {
      // eslint-disable-next-line no-param-reassign
      unitName = 3 * index;
    }
  }
  return parseFixed(value, unitName != null ? unitName : 18);
}

// const fetchUrl = configJson[localStorage.getItem('ispro')].bscsubgraph;
// fetch(fetchUrl, {
//   method: 'POST',
//   body: '{"query": "{contractLists {name addr}}"}',
// })
//   .then((res) => res.json())
//   .then((json) => {
//     console.log('bscsubgraph ', json);
//   });

const loginPath = '/list';

// setInterval(function () {
//   alert('Hello Beichen!');
// }, 10000);

/** 获取用户信息比较慢的时候会展示一个 loading */
export const initialStateConfig = {
  loading: <PageLoading />,
};

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      const msg = await queryCurrentUser();
      return msg.data;
    } catch (error) {
      history.push(loginPath);
    }
    return undefined;
  };
  // 如果是登录页面，不执行
  if (history.location.pathname !== loginPath) {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings: {},
    };
  }
  return {
    fetchUserInfo,
    settings: {},
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState }) => {
  return {
    rightContentRender: () => <RightContent />,
    disableContentMargin: false,
    waterMarkProps: {
      content: initialState?.currentUser?.name,
    },
    menuHeaderRender: undefined,
    ...initialState?.settings,
  };
};
