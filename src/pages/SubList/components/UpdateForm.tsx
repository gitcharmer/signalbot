import React from 'react';
import { Modal } from 'antd';
import {
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  StepsForm,
  ProFormRadio,
  ProFormDateTimePicker,
} from '@ant-design/pro-form';
import { useIntl, FormattedMessage } from 'umi';
import { Button } from 'antd';
import configJson from '../../../../config/config.json';

export type FormValueType = {
  target?: string;
  template?: string;
  type?: string;
  time?: string;
  frequency?: string;
} & Partial<API.RuleListItem>;

export type UpdateFormProps = {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  onSubmit: (values: FormValueType) => Promise<void>;
  updateModalVisible: boolean;
  values: Partial<API.RuleListItem>;
};

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const intl = useIntl();
  return (
    <StepsForm
      stepsProps={{
        size: 'small',
      }}
      stepsFormRender={(dom, submitter) => {
        // submitter[0][props].children = '确认';
        return (
          <Modal
            width={640}
            bodyStyle={{ padding: '32px 40px 48px' }}
            destroyOnClose
            title={intl.formatMessage({
              id: 'pages.searchTable.updateForm.ruleConfig',
              defaultMessage: '规则配置',
            })}
            visible={props.updateModalVisible}
            footer={submitter}
            onCancel={() => {
              props.onCancel();
            }}
          >
            {dom}
          </Modal>
        );
      }}
      onFinish={props.onSubmit}
      submitter={{
        render: (props) => {
          if (props.step === 0) {
            return (
              <Button type="primary" onClick={() => props.onSubmit?.()}>
                确认
              </Button>
            );
          }
        },
      }}
    >
      <StepsForm.StepForm
        // initialValues={{
        //   name: props.values.name,
        //   desc: props.values.desc,
        // }}
        title={intl.formatMessage({
          id: 'pages.searchTable.updateForm.basicConfig',
          defaultMessage: '基本信息',
        })}
      >
        <ProFormText
          name="privatekey"
          label={intl.formatMessage({
            id: 'pages.searchTable.updateForm.ruleName.privatekey',
            defaultMessage: '私钥名称',
          })}
          initialValue={localStorage.getItem('privatekey')}
          width="md"
          rules={[
            { min: 64, message: '长度64个字符' },
            {
              required: true,
              type: 'string',
              message: (
                <FormattedMessage
                  id="pages.searchTable.updateForm.ruleName.checkprivatekey"
                  defaultMessage="请输入正确的私钥名称！"
                />
              ),
            },
          ]}
        />
        <ProFormText
          name="pricerate"
          label={intl.formatMessage({
            id: 'pages.searchTable.updateForm.ruleName.pricerate',
            // defaultMessage: '请输入数字',
          })}
          width="md"
          initialValue={localStorage.getItem('pricerate')}
          rules={[
            {
              required: true,
              // type: 'number',
              message: (
                <FormattedMessage
                  id="pages.searchTable.updateForm.ruleName.isnum"
                  // defaultMessage="请输入资金比例！"
                />
              ),
            },
            {
              pattern: /^[1-9]+(.[0-9])?$/,
              message: '请输入大于等于1的数字！',
            },
          ]}
        />
        <ProFormText
          name="leverage"
          label={intl.formatMessage({
            id: 'pages.searchTable.updateForm.ruleName.leverage',
            // defaultMessage: '请输入数字',
          })}
          width="md"
          initialValue={localStorage.getItem('leverage')}
          rules={[
            {
              required: true,
              // type: 'number',
              message: (
                <FormattedMessage
                  id="pages.searchTable.updateForm.ruleName.isnum"
                  // defaultMessage="请输入杠杆倍数！"
                />
              ),
            },
            {
              pattern: /^[1-9]+(.[0-9])?$/,
              message: '请输入大于等于1的数字！',
            },
          ]}
        />
        <ProFormText
          name="bscrpcendpoint"
          label={intl.formatMessage({
            id: 'pages.searchTable.updateForm.ruleName.bscrpcendpoint',
            defaultMessage: 'BSC RPC Endpoint',
          })}
          width="md"
          initialValue={
            localStorage.getItem('bscrpcendpoint')
              ? localStorage.getItem('bscrpcendpoint')
              : configJson[localStorage.getItem('ispro')].bscrpcendpoint
          }
          rules={[
            {
              required: true,
              type: 'string',
              message: (
                <FormattedMessage
                  id="pages.searchTable.updateForm.ruleName.checkbscrpcendpoint"
                  defaultMessage="请正确输入BSC RPC Endpoint！"
                />
              ),
            },
          ]}
        />
      </StepsForm.StepForm>
    </StepsForm>
  );
};

export default UpdateForm;
