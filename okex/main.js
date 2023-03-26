const crypto = require('crypto');
const axios = require('axios');
const qs = require('qs');

// 您的 OKEx API Key 和 Secret Key
const apiKey = 'YOUR_API_KEY';
const secretKey = 'YOUR_SECRET_KEY';
const passphrase = 'YOUR_passphrase'

// OKEx API 请求地址
const baseUrl = 'https://www.okex.com/api';

// 获取 UTC 时间戳
const timestamp = () => {
    return new Date().toISOString();
}

// 生成签名
const sign = (params, secretKey) => {
    const signData = qs.stringify(params);
    return crypto.createHmac('sha256', secretKey).update(signData).digest('base64');
}


// 发送 OKEx API 请求
const request = async (method, path, params = {}) => {
    const url = `${baseUrl}/${path}`;
    const response = await axios({
        method,
        url,
        params,
        headers: {
            'OK-ACCESS-KEY': apiKey,
            'OK-ACCESS-SIGN': sign(params, secretKey),
            'OK-ACCESS-TIMESTAMP': timestamp(),
            'OK-ACCESS-PASSPHRASE': passphrase,
            'Content-Type': 'application/json',
        },
    });

    return response.data;
}

// 买入 BTC 永续开多
const buyBTC = async (price, quantity) => {
    const params = {
        instId: 'BTC-USD-SWAP', // BTC永续合约
        tdMode: 'cross', // 保证金模式：isolated：逐仓 ；cross：全仓
        side: 'buy', // 订单方向 buy：买， sell：卖
        /*
            持仓方向 在双向持仓模式下必填，且仅可选择 long 或 short。 仅适用交割、永续。
            开多：买入开多（side 填写 buy； posSide 填写 long ）
            开空：卖出开空（side 填写 sell； posSide 填写 short ） 
         */
        posSide: 'long',
        /* 
            ordType 订单类型
            market：市价单
            limit：限价单
            post_only：只做maker单
            fok：全部成交或立即取消
            ioc：立即成交并取消剩余
            optimal_limit_ioc：市价委托立即成交并取消剩余（仅适用交割、永续）
         */
        ordType: 'limit',
        px: price, // 委托价格，仅适用于limit、post_only、fok、ioc类型的订单
        sz: quantity, // 委托数量
        tpTriggerPx: '27850', // 止盈触发价
        tpTriggerPxType: "mark",
        tpOrdPx: '-1', // 止盈委托价，如果填写此参数，必须填写 止盈触发价 委托价格为-1时，执行市价止盈
        lever: "30" // 倍数
    };

    const result = await request('POST', 'v5/trade/order', params);
    console.log(result);
}

// 示例：买入 BTC 永续开多，价格为 $50000，数量为 1 张
buyBTC(50000, 1);
