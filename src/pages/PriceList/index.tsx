import React, { useRef, useState } from 'react';
import { useIntl, FormattedMessage } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { getPriceList } from './service';
import type { TableListItem } from './data';

let tableListDataSource: TableListItem[] = [];
// console.log('getSignalList', getPriceList());
// eslint-disable-next-line @typescript-eslint/no-unused-vars

const PriceList: React.FC = () => {
  /**
   * @en-US Pop-up window of new window
   * @zh-CN 新建窗口的弹窗
   *  */
  // const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  // /**
  //  * @en-US The pop-up window of the distribution update window
  //  * @zh-CN 分布更新窗口的弹窗
  //  * */
  // const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);

  // const [showDetail, setShowDetail] = useState<boolean>(false);

  // const actionRef = useRef<ActionType>();
  // const [currentRow, setCurrentRow] = useState<API.RuleListItem>();
  // const [selectedRowsState, setSelectedRows] = useState<API.RuleListItem[]>([]);

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const actionRef = useRef<ActionType>();
  const intl = useIntl();
  const [load, setLoad] = useState(true);

  (async () => {
    tableListDataSource = await getPriceList();
    setLoad(false);
    if (actionRef?.current) {
      await actionRef.current.reload();
    }
  })();

  const columns: ProColumns<TableListItem>[] = [
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.updateForm.ruleName.walletaddress"
          defaultMessage="Rule name"
        />
      ),
      dataIndex: 'address',
      hideInTable: localStorage.getItem('wallet.address') ? false : true,
      ellipsis: true, //文字超出不换行，显示省略号，鼠标悬浮的时候可以把该字段显示全
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.updateForm.ruleName.signalid"
          defaultMessage="Status"
        />
      ),
      dataIndex: 'signalId',
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.updateForm.ruleName.amount"
          defaultMessage="Status"
        />
      ),
      dataIndex: 'amount',
    },
    {
      title: <FormattedMessage id="pages.searchTable.coinName" defaultMessage="Status" />,
      dataIndex: 'coinName',
    },
    {
      title: <FormattedMessage id="pages.searchTable.quoteName" defaultMessage="Status" />,
      dataIndex: 'quoteName',
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.updateForm.ruleName.lastsignalid"
          defaultMessage="Description"
        />
      ),
      dataIndex: 'lastRecordId',
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.updateForm.ruleName.side"
          defaultMessage="Description"
        />
      ),
      dataIndex: 'side',
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.updateForm.ruleName.time"
          defaultMessage="Description"
        />
      ),
      dataIndex: 'time',
      ellipsis: true, //文字超出不换行，显示省略号，鼠标悬浮的时候可以把该字段显示全
    },
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

export default PriceList;
