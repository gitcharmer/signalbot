// @ts-ignore
/* eslint-disable */
import request from 'umi-request';
import { TableListItem } from './data';
import configJson from '../../../config/config.json';
import moment from 'moment';
import { message } from 'antd';
import { ethers, Wallet } from 'ethers';
import type { FormValueType } from './components/UpdateForm';
import ERC20TokenArtifact from '@sakeperp/artifact/src/ERC20Token.json';
import { BigNumber } from '@ethersproject/bignumber';
import Big from 'big.js';

/** 获取规则列表 GET /api/rule */
export async function getSignalList() {
  const tableListDataSource: TableListItem[] = [];
  await request
    .get(configJson[localStorage.getItem('ispro')].api + 'sakeSignal/getActiveSignal', {
      params: {
        address: localStorage.getItem('wallet.address'),
      },
    })
    .then(function (response) {
      // console.log('sakeSignal/getActiveSignal', response);
      // const signalpush: any = localStorage.getItem('signalNo')?.split(',');
      // console.log('signalpush ', signalpush);

      for (let i = 0; i < response.length; i += 1) {
        // const subStatue = signalpush?.includes(response[i].id + '') ? 1 : 0;
        tableListDataSource.push({
          key: response[i].id,
          name: response[i].id,
          authorName: response[i].authorName,
          platform: response[i].platform,
          price: response[i].price,
          strategyName: response[i].strategyName,
          subStatue: response[i].subStatue,
          status: response[i].statues,
          coinName: response[i].coinName,
          quoteName: response[i].quoteName,
          entryIntoTime: moment(response[i].entryIntoTime).format('YYYY-MM-DD HH:mm:ss'),
          twitterName: response[i].twitterName,
          twitterLink: response[i].twitterLink,
          tradingviewName: response[i].tradingviewName,
          tradingviewLink: response[i].tradingviewLink,
          lastRecordId: response[i].lastRecordId,
          introduce: response[i].introduce,
          fmzName: response[i].fmzName,
          fmzLink: response[i].fmzLink,
          facebookName: response[i].facebookName,
          facebookLink: response[i].facebookLink,
          createTime: moment(response[i].createTime).format('YYYY-MM-DD HH:mm:ss'),
        });
      }
    })
    .catch(function (error) {
      console.log(error);
    });
  return tableListDataSource;
}

export async function handleUpdate(fields: FormValueType) {
  const hide = message.loading('Configuring');
  try {
    //init config
    localStorage.setItem('privatekey', fields?.privatekey);
    localStorage.setItem('pricerate', fields?.pricerate);
    localStorage.setItem('leverage', fields?.leverage);
    localStorage.setItem('bscrpcendpoint', fields?.bscrpcendpoint);

    if (localStorage.getItem('privatekey')) {
      const privatekey = localStorage.getItem('privatekey');
      const web3Endpoint = localStorage.getItem('bscrpcendpoint');
      // const provider = new WebSocketProvider(web3Endpoint);
      const provider = ethers.getDefaultProvider(web3Endpoint);
      const wallet = new ethers.Wallet(privatekey, provider);
      if (wallet.address) {
        localStorage.setItem('wallet.address', wallet.address);
      }
      // approve
      const erc20tokenaddress = configJson[localStorage.getItem('ispro')].erc20address;
      const erc20tokenabi = ERC20TokenArtifact;
      const sakeperpaddress = configJson[localStorage.getItem('ispro')].sakeperpaddress;
      (async () => {
        const erc20 = new ethers.Contract(erc20tokenaddress, erc20tokenabi, wallet);
        console.log('erc20', erc20);
        //bnb balance
        const bnbBalance = await provider.getBalance(wallet.address);
        console.log('bnbBalance', Number(ethers.utils.formatUnits(bnbBalance, 18)).toFixed(4));
        localStorage.setItem(
          'bnbBalance',
          Number(ethers.utils.formatUnits(bnbBalance, 18)).toFixed(4),
        );
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
          parseFloat(localStorage.getItem('usdtBalance')) <
            parseFloat(localStorage.getItem('pricerate'))
        ) {
          console.log('bnb/busd balance is insufficient');
          message.error('bnb/busd balance is insufficient!');
        } else {
          const gasPrice = await provider.getGasPrice(); // bsc大多时候返回5000000000 (5e9)
          console.log('gasPrice', gasPrice);
          const allowance = await erc20.functions.allowance(wallet.address, sakeperpaddress);
          console.log('allowance', allowance);
          // 返回值为uni256的BigNumber，如果是0，用0===allowance依然false，但0==allowance则为true
          // 如果从来没approve过，则allowance为0
          const MaxUint256: BigNumber = /*#__PURE__*/ BigNumber.from(
            '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
          );
          const decimals = await erc20.functions.decimals();
          const infiniteAllowance = Big(ethers.utils.formatUnits(erc20tokenaddress, decimals[0]));
          const allowanceThreshold = infiniteAllowance.div(2);
          const haveallowance = Big(ethers.utils.formatUnits(allowance[0], decimals[0]));
          console.log('allowance', allowance);
          console.log('haveallowance', haveallowance);
          console.log('allowanceThreshold', allowanceThreshold);
          console.log('haveallowance.lt(allowanceThreshold)', haveallowance.lt(allowanceThreshold));
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
    hide();

    message.success('Configuration is successful');
    return true;
  } catch (error) {
    hide();
    message.error('Configuration failed, please try again!');
    return false;
  }
}

// 订阅信号
export async function subSignal(signalID: any) {
  try {
    //sub signal
    //subscipSignal
    if (
      localStorage.getItem('privatekey') &&
      localStorage.getItem('pricerate') &&
      localStorage.getItem('leverage')
    ) {
      request
        .post(configJson[localStorage.getItem('ispro')].api + 'subscrip/subscipSignal', {
          data: {
            address: localStorage.getItem('wallet.address'),
            signalId: signalID,
          },
          requestType: 'form',
        })
        .then(function (response) {
          console.log('subscrip/subscipSignal', response);
          if (response == 1) {
            message.success('订阅成功！');
            // (async () => {
            //   tableListDataSource = await getSignalList();
            //   if (actionRef.current) {
            //     await actionRef.current.reload();
            //   }
            // })();
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    } else {
      message.error('请先初始化配置!');
    }
  } catch (error) {
    message.error('Configuration failed, please try again!');
    return false;
  }
}

// 订阅信号
export async function subSignalQuit(signalID: any) {
  try {
    //sub signal
    //subscipSignal
    if (
      localStorage.getItem('privatekey') &&
      localStorage.getItem('pricerate') &&
      localStorage.getItem('leverage')
    ) {
      request
        .post(configJson[localStorage.getItem('ispro')].api + 'subscrip/subscipSignal', {
          data: {
            address: localStorage.getItem('wallet.address'),
            signalId: signalID,
          },
          requestType: 'form',
        })
        .then(function (response) {
          console.log('subscrip/subscipSignal', response);
          if (response == 1) {
            if (localStorage.getItem('signalNo')) {
              const signalpush: any = localStorage.getItem('signalNo')?.split(',');
              console.log('signalpush', signalpush);
              console.log('signalpush.indexOf(signalID)', signalpush.indexOf(signalID));
              if (!signalpush.includes(signalID + '')) {
                // 存入数据
                if (localStorage.getItem('signalNo')) {
                  const signalpushs = localStorage.getItem('signalNo') + ',' + signalID;
                  localStorage.setItem('signalNo', signalpushs);
                } else {
                  localStorage.setItem('signalNo', signalID);
                }
                message.success('订阅成功！');
                return true;
              } else {
                message.error('不能重复订阅!');
                return false;
              }
            } else {
              message.success('初次订阅成功！');
              localStorage.setItem('signalNo', signalID);
            }
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    } else {
      message.error('请先初始化配置!');
    }
  } catch (error) {
    message.error('Configuration failed, please try again!');
    return false;
  }
}

// 删除数组中指定元素
// function removeByValue(arr: any, val: any) {
//   for (let i = 0; i < arr.length; i++) {
//     if (arr[i] == val) {
//       arr.splice(i, 1);
//       break;
//     }
//   }
// }

// 取消订阅
export async function unSubSignal(signalID: any) {
  try {
    //disSubscipSignal
    request
      .post(configJson[localStorage.getItem('ispro')].api + 'subscrip/disSubscipSignal', {
        data: {
          address: localStorage.getItem('wallet.address'),
          signalId: signalID,
        },
        requestType: 'form',
      })
      .then(function (response) {
        console.log('subscrip/disSubscipSignal', response);
        if (response == 1) {
          message.success('取消订阅成功！');
          // (async () => {
          //   tableListDataSource = await getSignalList();
          //   if (actionRef.current) {
          //     await actionRef.current.reload();
          //   }
          // })();
        }
      })
      .catch(function (error) {
        console.log(error);
      });
    return true;
  } catch (error) {
    message.error('Configuration failed, please try again!');
    return false;
  }
}
