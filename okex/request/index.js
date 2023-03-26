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
const sign = (timestamp, method, path, params) => {
    const message = timestamp + method.toUpperCase() + path + qs.stringify(params);
    return crypto.createHmac('sha256', secretKey).update(message).digest('base64');;
};

const instance = axios.create({
    baseURL: baseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

instance.interceptors.request.use(config => {
    const { method, url, params } = config;
    config.headers['OK-ACCESS-KEY'] = apiKey;
    config.headers['OK-ACCESS-TIMESTAMP'] = timestamp();
    config.headers['OK-ACCESS-PASSPHRASE'] = passphrase;
    config.headers['OK-ACCESS-SIGN'] = sign(
        config.headers['OK-ACCESS-TIMESTAMP'],
        method,
        url,
        params,
    );
    return config;
});

// export
// instance.post('v5/trade/order', params)
