```bash
npm install
```

or

```bash
yarn
```

## Provided Scripts

Scripts provided in `package.json`. It's safe to modify or add additional script:

### Start web project

```bash
yarn start
```

### Build web project

```bash
yarn build
```

### Build desktop project(windows)

```bash
yarn package:win
```

### Build desktop project(mac)

```bash
yarn package:mac
```

### Build desktop project(linux)

```bash
yarn package:linux
```

### linux 配置文件格式及路径

```bash
在项目根目录新建linux配置文件：
文件名：LinuxInit.json
配置详解：
privatekey:钱包私钥地址
pricenum:每单资金量
leverage:杠杆比例
bscrpcendpoint:bsc rpc endpoint
示例：
{
  "LinuxInit": {
    "privatekey": "",
    "pricenum": "1",
    "leverage": "2",
    "bscrpcendpoint": "https://data-seed-prebsc-1-s1.binance.org:8545/"
  }
}
```
