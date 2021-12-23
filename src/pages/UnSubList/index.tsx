import { PlusOutlined } from '@ant-design/icons';
import { Popconfirm, Button, message, Input, Drawer } from 'antd';
import React, { useState, useRef } from 'react';
import { useIntl, FormattedMessage } from 'umi';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import type { ProDescriptionsItemProps } from '@ant-design/pro-descriptions';
import ProDescriptions from '@ant-design/pro-descriptions';
import { rule, addRule, updateRule, removeRule } from '@/services/ant-design-pro/api';
import request from 'umi-request';

// 删除数组中指定元素
function removeByValue(arr: any, val: any) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] == val) {
      arr.splice(i, 1);
      break;
    }
  }
}

/**
 * @en-US Update node
 * @zh-CN 更新节点
 *
 * @param fields
 */
const handleUpdate = async (signalID: any) => {
  try {
    //disSubscipSignal
    request
      .post('https://signal-dev.sakeperp.fi/subscrip/disSubscipSignal', {
        data: {
          address: localStorage.getItem('wallet.address'),
          signalId: signalID,
        },
        requestType: 'form',
      })
      .then(function (response) {
        console.log('subscrip/disSubscipSignal', response);
        if (response == 1) {
          // 存入数据
          console.log('localStorage.getItem(signalNo)', localStorage.getItem('signalNo'));
          if (localStorage.getItem('signalNo')) {
            const signalpush: any = localStorage.getItem('signalNo')?.split(',');
            console.log('signalpush ', signalpush);
            if (signalpush.includes(signalID + '')) {
              removeByValue(signalpush, signalID);
              localStorage.setItem('signalNo', signalpush.join(','));
              message.success('取消订阅成功！');
            } else {
              message.success('没有匹配到数据');
            }
          }
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
};

export type TableListItem = {
  key?: number;
  name?: string;
  strategyname?: string;
  subStatue?: number;
  status?: string;
  createdAt?: number;
  updatedAt?: number;
  memo?: string;
  coinName?: string;
  quoteName?: string;
};
const tableListDataSource: TableListItem[] = [];

request
  .get('https://signal-dev.sakeperp.fi/sakeSignal/getActiveSignal', {
    params: {
      address: localStorage.getItem('wallet.address'),
    },
  })
  .then(function (response) {
    console.log('sakeSignal/getActiveSignal/subsignals', response);
    for (let i = 0; i < response.length; i += 1) {
      if (response[i].subStatue == 1) {
        tableListDataSource.push({
          key: response[i].id,
          name: response[i].id,
          strategyname: response[i].strategyName,
          subStatue: response[i].subStatue,
          status: response[i].statues,
          coinName: response[i].coinName,
          quoteName: response[i].quoteName,
        });
      }
    }
  })
  .catch(function (error) {
    console.log(error);
  });
const UnSubList: React.FC = () => {
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
  const [currentRow, setCurrentRow] = useState<API.RuleListItem>();
  const [selectedRowsState, setSelectedRows] = useState<API.RuleListItem[]>([]);

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();

  const columns: ProColumns<TableListItem>[] = [
    {
      title: (
        <FormattedMessage
          id="pages.searchTable.updateForm.ruleName.signalid"
          defaultMessage="Rule name"
        />
      ),
      dataIndex: 'name',
      // tip: 'The rule name is the unique key',
      // render: (dom, entity) => {
      //   return (
      //     <a
      //       onClick={() => {
      //         setCurrentRow(entity);
      //         setShowDetail(true);
      //       }}
      //     >
      //       {dom}
      //     </a>
      //   );
      // },
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
      dataIndex: 'strategyname',
      valueType: 'textarea',
      ellipsis: true, //文字超出不换行，显示省略号，鼠标悬浮的时候可以把该字段显示全
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
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="config"
          onClick={() => {
            handleUpdate(record.key);
          }}
        >
          <FormattedMessage id="pages.searchTable.cancleconfig" defaultMessage="Configuration" />
        </a>,
      ],
    },
  ];
  return (
    <PageContainer>
      <ProTable<TableListItem, API.PageParams>
        headerTitle={intl.formatMessage({
          id: 'pages.searchTable.title',
          defaultMessage: 'Enquiry form',
        })}
        actionRef={actionRef}
        rowKey="key"
        search={false}
        pagination={{
          pageSize: 10,
          showQuickJumper: true,
        }}
        // request={rule}
        columns={columns}
        request={(params, sorter, filter) => {
          // 表单搜索项会从 params 传入，传递给后端接口。
          console.log(params, sorter, filter);
          return Promise.resolve({
            data: tableListDataSource,
            success: true,
          });
        }}
      />

      <Drawer
        width={600}
        visible={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {currentRow?.name && (
          <ProDescriptions<API.RuleListItem>
            column={2}
            title={currentRow?.name}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.name,
            }}
            columns={columns as ProDescriptionsItemProps<API.RuleListItem>[]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default UnSubList;
