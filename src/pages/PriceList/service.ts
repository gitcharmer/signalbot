// @ts-ignore
/* eslint-disable */
import request from 'umi-request';
import { TableListItem } from './data';
import configJson from '../../../config/config.json';
import moment from 'moment';
/** 获取规则列表 GET /api/rule */
export async function getPriceList() {
  const tableListDataSource: TableListItem[] = [];
  await request
    .get(
      configJson[localStorage.getItem('ispro')].api + 'operationRecord/getRecordBySigIdAndAddr',
      {
        params: {
          // address: walletaddress,
          address: localStorage.getItem('wallet.address'),
          pageNo: 0,
          pageSize: 10000,
        },
      },
    )
    .then(function (response) {
      //   console.log('operationRecord/getRecordBySigIdAndAddr', response);
      for (let i = 0; i < response.content.length; i += 1) {
        tableListDataSource.push({
          key: i,
          address: response.content[i].address,
          signalId: response.content[i].signalId,
          amount: response.content[i].amount,
          coinName: response.content[i].coinName,
          quoteName: response.content[i].quoteName,
          lastRecordId: response.content[i].lastRecordId,
          side: response.content[i].side == 0 ? 'Long' : 'Short',
          time: moment(response.content[i].time).format('YYYY-MM-DD HH:mm:ss'),
        });
      }
    })
    .catch(function (error) {
      console.log(error);
    });
  return tableListDataSource;
}

/** 新建规则 PUT /api/rule */
export async function updateRule(data: { [key: string]: any }, options?: { [key: string]: any }) {
  return request<TableListItem>('/api/rule', {
    data,
    method: 'PUT',
    ...(options || {}),
  });
}

/** 新建规则 POST /api/rule */
export async function addRule(data: { [key: string]: any }, options?: { [key: string]: any }) {
  return request<TableListItem>('/api/rule', {
    data,
    method: 'POST',
    ...(options || {}),
  });
}

/** 删除规则 DELETE /api/rule */
export async function removeRule(data: { key: number[] }, options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/rule', {
    data,
    method: 'DELETE',
    ...(options || {}),
  });
}
