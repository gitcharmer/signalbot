import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Alert, Typography } from 'antd';
import { useIntl, FormattedMessage } from 'umi';
import styles from './Welcome.less';

const CodePreview: React.FC = ({ children }) => (
  <pre className={styles.pre}>
    <code>
      <Typography.Text copyable>{children}</Typography.Text>
    </code>
  </pre>
);

const Welcome: React.FC = () => {
  const intl = useIntl();
  return (
    <PageContainer>
      <Card>
        <Alert
          message={intl.formatMessage({
            id: 'pages.welcome.alertMessage',
            defaultMessage: 'Faster and stronger heavy-duty components have been released.',
          })}
          type="success"
          showIcon
          banner
          style={{
            margin: -12,
            marginBottom: 24,
          }}
        />
        <Typography.Text strong>
          <FormattedMessage id="pages.welcome.advancedComponent" defaultMessage="Advanced Form" />{' '}
        </Typography.Text>
        <CodePreview>
          This code is provided only for educational purposes only. Derivatives trading carries
          substantial risks and possible loss of up to 100% of your funds. Perpetual contract
          trading may be regulated in your jurisdiction. Be sure to check local laws before trading.
        </CodePreview>
        <Typography.Text strong>
          <FormattedMessage id="pages.welcome.bscrpcendpoints" defaultMessage="Advanced Form" />{' '}
        </Typography.Text>
        <CodePreview>https://docs.binance.org/smart-chain/developer/rpc.html</CodePreview>
        <Typography.Text
          strong
          style={{
            marginBottom: 12,
          }}
        >
          <FormattedMessage id="pages.welcome.advancedLayout" defaultMessage="Advanced Builder" />{' '}
        </Typography.Text>
        <CodePreview>
          YOU (MEANING ANY INDIVIDUAL OR ENTITY ACCESSING, USING OR BOTH THE SOFTWARE INCLUDED IN
          THIS GITHUB REPOSITORY) EXPRESSLY UNDERSTAND AND AGREE THAT YOUR USE OF THE SOFTWARE IS AT
          YOUR SOLE RISK. THE SOFTWARE IN THIS GITHUB REPOSITORY IS PROVIDED “AS IS”, WITHOUT
          WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
          MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
          THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
          WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
          WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. YOU RELEASE AUTHORS OR
          COPYRIGHT HOLDERS FROM ALL LIABILITY FOR YOU HAVING ACQUIRED OR NOT ACQUIRED CONTENT IN
          THIS GITHUB REPOSITORY. THE AUTHORS OR COPYRIGHT HOLDERS MAKE NO REPRESENTATIONS
          CONCERNING ANY CONTENT CONTAINED IN OR ACCESSED THROUGH THE SERVICE, AND THE AUTHORS OR
          COPYRIGHT HOLDERS WILL NOT BE RESPONSIBLE OR LIABLE FOR THE ACCURACY, COPYRIGHT
          COMPLIANCE, LEGALITY OR DECENCY OF MATERIAL CONTAINED IN OR ACCESSED THROUGH THIS GITHUB
          REPOSITORY.
        </CodePreview>
      </Card>
    </PageContainer>
  );
};

export default Welcome;
