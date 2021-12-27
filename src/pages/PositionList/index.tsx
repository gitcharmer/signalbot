import React, { useRef, useState } from 'react';
import { useIntl, FormattedMessage } from 'umi';
import { PageContainer, PageLoading } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { getPositionList } from './service';
import type { TableListItem } from './data';
import { loadavg } from 'os';

let tableListDataSource: TableListItem[] = [];
// console.log('getSignalList', getPriceList());
// eslint-disable-next-line @typescript-eslint/no-unused-vars

const PositionList: React.FC = () => {
  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const actionRef = useRef<ActionType>();
  const intl = useIntl();
  const [load, setLoad] = useState(true);

  (async () => {
    tableListDataSource = await getPositionList();
    // console.log('tableListDataSource', tableListDataSource);
    setLoad(false);
    if (actionRef?.current) {
      await actionRef.current.reload();
    }
  })();

  const columns: ProColumns<TableListItem>[] = [
    // {
    //   title: (
    //     <FormattedMessage
    //       id="pages.searchTable.updateForm.ruleName.walletaddress"
    //       defaultMessage="Rule name"
    //     />
    //   ),
    //   dataIndex: 'address',
    //   hideInTable: localStorage.getItem('wallet.address') ? false : true,
    //   ellipsis: true, //文字超出不换行，显示省略号，鼠标悬浮的时候可以把该字段显示全
    // },
    {
      title: <FormattedMessage id="pages.searchTable.Currency" defaultMessage="Currency" />,
      dataIndex: 'coinName',
    },
    // {
    //   title: <FormattedMessage id="pages.searchTable.quoteName" defaultMessage="Status" />,
    //   dataIndex: 'quoteName',
    // },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.updateForm.ruleName.leverage"
          defaultMessage="Status"
        />
      ),
      dataIndex: 'leverage',
    },
    {
      title: (
        <FormattedMessage id="pages.searchTable.updateForm.ruleName.side" defaultMessage="side" />
      ),
      dataIndex: 'side',
    },
    {
      title: (
        <FormattedMessage id="pages.searchTable.updateForm.ruleName.size" defaultMessage="size" />
      ),
      dataIndex: 'size',
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.updateForm.ruleName.entryprice"
          defaultMessage="Status"
        />
      ),
      dataIndex: 'entryprice',
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.updateForm.ruleName.margin"
          defaultMessage="margin"
        />
      ),
      dataIndex: 'margin',
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.updateForm.ruleName.marginRatio"
          defaultMessage="marginRatio"
        />
      ),
      dataIndex: 'marginRatio',
    },
    {
      title: (
        <FormattedMessage id="pages.searchTable.updateForm.ruleName.pnl" defaultMessage="pnl" />
      ),
      dataIndex: 'pnl',
    },
    {
      title: (
        <FormattedMessage id="pages.searchTable.updateForm.ruleName.liq" defaultMessage="liq" />
      ),
      dataIndex: 'liq',
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.updateForm.ruleName.bnbbalance"
          defaultMessage="Status"
        />
      ),
      dataIndex: 'bnbbalance',
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.updateForm.ruleName.busdbalance"
          defaultMessage="Status"
        />
      ),
      dataIndex: 'busdbalance',
    },
    // {
    //   title: (
    //     <FormattedMessage
    //       id="pages.searchTable.updateForm.ruleName.side"
    //       defaultMessage="Description"
    //     />
    //   ),
    //   dataIndex: 'side',
    // },
  ];
  return (
    <PageContainer>
      <ProTable<TableListItem>
        headerTitle={intl.formatMessage({
          id: 'pages.searchTable.title',
          defaultMessage: 'Enquiry form',
        })}
        actionRef={actionRef}
        rowKey="key"
        options={{ density: true, fullScreen: false, reload: true, setting: true }}
        search={false}
        loading={load}
        pagination={{
          pageSize: 10,
          // 跳转到指定的页码
          showQuickJumper: true,
        }}
        columns={columns}
        request={() => {
          // 表单搜索项会从 params 传入，传递给后端接口。
          return Promise.resolve({
            data: tableListDataSource,
            success: true,
          });
        }}
      />
    </PageContainer>
  );
};

export default PositionList;
