import { Button, Drawer } from 'antd';
import { Card, Descriptions } from 'antd';
import React, { useState, useRef } from 'react';
import { useIntl, FormattedMessage } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import request from 'umi-request';
import { message } from 'antd';
import configJson from '../../../config/config.json';
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import type { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import ProDescriptions from '@ant-design/pro-descriptions';
import UpdateForm from './components/UpdateForm';
import type { TableListItem } from './data';
import { getSignalList, handleUpdate, subSignal, unSubSignal } from './service';

let tableListDataSource: TableListItem[] = [];
// console.log('getSignalList', getSignalList());
// tableListDataSource = await getSignalList();

const SubList: React.FC = () => {
  /**
   * @en-US Pop-up window of new window
   * @zh-CN 新建窗口的弹窗
   *  */
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  /**
   * @en-US The pop-up window of the distribution update window
   * @zh-CN 分布更新窗口的弹窗
   * */
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  // const actionDescriptions = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<TableListItem>();
  // const [bnb, setBnb] = useState(localStorage.getItem('bnbBalance'));
  // const [busd, setBusd] = useState(localStorage.getItem('usdtBalance'));
  const [load, setLoad] = useState(true);

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();

  (async () => {
    tableListDataSource = await getSignalList();
    setLoad(false);
    if (actionRef?.current) {
      await actionRef.current.reload();
    }
  })();

  //setInterval
  // setInterval(() => {
  //   (async () => {
  //     // setBnb(localStorage.getItem('bnbBalance'));
  //     // setBusd(localStorage.getItem('usdtBalance'));
  //     tableListDataSource = await getSignalList();
  //     if (actionRef.current) {
  //       await actionRef.current.reload();
  //     }
  //   })();
  // }, 5000);

  const bodyStyle = {
    fontSize: '60px',
    fontWeight: 'bold',
    color: 'red',
  };

  const columns: ProColumns<TableListItem>[] = [
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.updateForm.ruleName.signalid"
          defaultMessage="Rule name"
        />
      ),
      search: false,
      dataIndex: 'name',
      tip: 'The signalid is the unique key',
      render: (dom, record) => {
        return (
          <a
            onClick={() => {
              // SignalDetail(dom);
              setCurrentRow(record);
              setShowDetail(true);
            }}
          >
            {dom}
          </a>
        );
      },
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.updateForm.ruleName.authorName"
          defaultMessage="Rule name"
        />
      ),
      dataIndex: 'authorName',
      hideInTable: true,
    },
    {
      title: <FormattedMessage id="pages.listDetail.createTime" defaultMessage="createTime" />,
      dataIndex: 'createTime',
      hideInTable: true,
    },
    {
      title: <FormattedMessage id="pages.listDetail.facebookLink" defaultMessage="facebookLink" />,
      dataIndex: 'facebookLink',
      hideInTable: true,
    },
    {
      title: <FormattedMessage id="pages.listDetail.facebookName" defaultMessage="facebookName" />,
      dataIndex: 'facebookName',
      hideInTable: true,
    },
    {
      title: <FormattedMessage id="pages.listDetail.fmzLink" defaultMessage="fmzLink" />,
      dataIndex: 'fmzLink',
      hideInTable: true,
    },
    {
      title: <FormattedMessage id="pages.listDetail.fmzName" defaultMessage="fmzName" />,
      dataIndex: 'fmzName',
      hideInTable: true,
    },
    {
      title: <FormattedMessage id="pages.listDetail.lastRecordId" defaultMessage="lastRecordId" />,
      dataIndex: 'lastRecordId',
      hideInTable: true,
    },
    {
      title: (
        <FormattedMessage id="pages.listDetail.tradingviewLink" defaultMessage="tradingviewLink" />
      ),
      dataIndex: 'tradingviewLink',
      hideInTable: true,
    },
    {
      title: (
        <FormattedMessage id="pages.listDetail.tradingviewName" defaultMessage="tradingviewName" />
      ),
      dataIndex: 'tradingviewName',
      hideInTable: true,
    },
    {
      title: <FormattedMessage id="pages.listDetail.twitterLink" defaultMessage="twitterLink" />,
      dataIndex: 'twitterLink',
      hideInTable: true,
    },
    {
      title: <FormattedMessage id="pages.listDetail.twitterName" defaultMessage="twitterName" />,
      dataIndex: 'twitterName',
      hideInTable: true,
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.updateForm.ruleName.platform"
          defaultMessage="Rule name"
        />
      ),
      dataIndex: 'platform',
      hideInTable: true,
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.updateForm.ruleName.price"
          defaultMessage="Rule name"
        />
      ),
      dataIndex: 'price',
      hideInTable: true,
    },
    {
      title: <FormattedMessage id="pages.searchTable.strategyStatus" defaultMessage="Status" />,
      dataIndex: 'status',
      hideInForm: true,
      // 策略状态，0：生效中；1：已失效；2：未生效
      valueEnum: {
        2: {
          text: (
            <FormattedMessage
              id="pages.searchTable.nameStatus.default"
              defaultMessage="Shut down"
            />
          ),
          status: 'Default',
        },
        0: {
          text: (
            <FormattedMessage id="pages.searchTable.nameStatus.running" defaultMessage="Running" />
          ),
          status: 'Processing',
        },
        1: {
          text: (
            <FormattedMessage
              id="pages.searchTable.nameStatus.abnormal"
              defaultMessage="Abnormal"
            />
          ),
          status: 'Error',
        },
      },
    },
    {
      title: <FormattedMessage id="pages.searchTable.subStatus" defaultMessage="Status" />,
      dataIndex: 'subStatue',
      hideInForm: true,
      // 是否已经订阅该信号 0：未订阅；1：已订阅
      valueEnum: {
        0: {
          text: (
            <FormattedMessage id="pages.searchTable.nameStatus.unsub" defaultMessage="Shut down" />
          ),
          status: 'Default',
        },
        1: {
          text: <FormattedMessage id="pages.searchTable.nameStatus.sub" defaultMessage="Running" />,
          status: 'Processing',
        },
      },
    },
    {
      title: <FormattedMessage id="pages.searchTable.strategyname" defaultMessage="Description" />,
      dataIndex: 'strategyName',
      valueType: 'textarea',
    },
    {
      title: <FormattedMessage id="pages.searchTable.coinName" defaultMessage="Description" />,
      dataIndex: 'coinName',
      valueType: 'textarea',
    },
    {
      title: <FormattedMessage id="pages.searchTable.quoteName" defaultMessage="Description" />,
      dataIndex: 'quoteName',
      valueType: 'textarea',
    },
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.updateForm.ruleName.entryIntoTime"
          defaultMessage="entryIntoTime"
        />
      ),
      dataIndex: 'entryIntoTime',
      hideInTable: true,
    },
    {
      title: <FormattedMessage id="pages.listDetail.introduce" defaultMessage="introduce" />,
      dataIndex: 'introduce',
      hideInTable: true,
      // ellipsis: true, //文字超出不换行，显示省略号，鼠标悬浮的时候可以把该字段显示全
    },
    {
      title: <FormattedMessage id="pages.listDetail.operate" defaultMessage="operate" />,
      dataIndex: 'option',
      valueType: 'option',
      hideInDescriptions: true,
      render: (_, record) => [
        record.subStatue == 0 ? (
          <a
            key="config"
            onClick={() => {
              subSignal(record.key);
              (async () => {
                tableListDataSource = await getSignalList();
                if (actionRef.current) {
                  await actionRef.current.reload();
                }
              })();
            }}
          >
            <FormattedMessage id="pages.searchTable.confirmconfig" defaultMessage="Configuration" />
          </a>
        ) : (
          <a
            key="config"
            onClick={() => {
              unSubSignal(record.key);
              (async () => {
                tableListDataSource = await getSignalList();
                if (actionRef.current) {
                  await actionRef.current.reload();
                }
              })();
            }}
          >
            <FormattedMessage id="pages.searchTable.cancleconfig" defaultMessage="Configuration" />
          </a>
        ),
      ],
    },
  ];
  return (
    <PageContainer>
      {localStorage.getItem('wallet.address') && (
        <Card>
          <Descriptions column={3}>
            <Descriptions.Item label="Address">
              <div style={{ width: '600px' }}>{localStorage.getItem('wallet.address')}</div>
            </Descriptions.Item>
            {/* <Descriptions.Item label={<div style={{ marginLeft: '139px' }}>BNB Balance</div>}>
            {bnb}
          </Descriptions.Item>
          <Descriptions.Item label="BUSD Balance">{busd}</Descriptions.Item> */}
          </Descriptions>
        </Card>
      )}
      <ProTable<TableListItem>
        headerTitle={intl.formatMessage({
          id: 'pages.searchTable.title',
          defaultMessage: 'Enquiry form',
        })}
        actionRef={actionRef}
        rowKey="key"
        search={false}
        options={{ density: true, fullScreen: false, reload: true, setting: true }}
        // search={{
        //   labelWidth: 'auto',
        // }}
        // form={{
        //   ignoreRules: false,
        // }}
        pagination={{
          pageSize: 10,
          showQuickJumper: true,
        }}
        columns={columns}
        loading={load}
        request={() => {
          // 表单搜索项会从 params 传入，传递给后端接口。
          // console.log(params, sorter, filter);
          // 刷新
          return Promise.resolve({
            data: tableListDataSource,
            success: true,
          });
        }}
        // request={tableListDataSource}
        toolBarRender={() => [
          <Button
            type="primary"
            key="config"
            onClick={() => {
              handleUpdateModalVisible(true);
              // setCurrentRow(record);
            }}
          >
            <FormattedMessage id="pages.searchTable.config" defaultMessage="Configuration" />
          </Button>,
        ]}
        // rowSelection={{
        //   onChange: (_, selectedRows) => {
        //     setSelectedRows(selectedRows);
        //   },
        // }}
      />
      <ModalForm
        title={intl.formatMessage({
          id: 'pages.searchTable.createForm.newRule',
          defaultMessage: 'New rule',
        })}
        width="400px"
        visible={createModalVisible}
        onVisibleChange={handleModalVisible}
      >
        <ProFormText
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage
                  id="pages.searchTable.ruleName"
                  defaultMessage="Rule name is required"
                />
              ),
            },
          ]}
          width="md"
          name="name"
        />
        <ProFormTextArea width="md" name="desc" />
      </ModalForm>
      <UpdateForm
        onSubmit={async (value) => {
          console.log('handleUpdate value: ', value);
          const success = await handleUpdate(value);
          if (success) {
            handleUpdateModalVisible(false);
            setCurrentRow(undefined);
          }
        }}
        onCancel={() => {
          handleUpdateModalVisible(false);
          if (!showDetail) {
            setCurrentRow(undefined);
          }
        }}
        updateModalVisible={updateModalVisible}
        values={currentRow || {}}
      />
      <Drawer
        width={800}
        bodyStyle={bodyStyle}
        visible={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {currentRow?.name && (
          <ProDescriptions<TableListItem>
            column={2}
            // title={'信号id:' + currentRow?.name}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.name,
            }}
            columns={columns as ProDescriptionsItemProps<TableListItem>[]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default SubList;
